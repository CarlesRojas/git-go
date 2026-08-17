import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getConfig } from './config';
import { formatGitError } from './util/formatGitError';

export interface GitCommit {
    hash: string;
    parents: string[];
    author: string;
    email: string;
    date: string;
    message: string;
    /** The message body (everything after the subject), with line breaks preserved */
    body?: string;
    committer?: string;
    committerEmail?: string;
    refs?: string;
    tags: string[];
    isStash?: boolean;
    isHead?: boolean;
    isUncommitted?: boolean;
}

export interface GitBranch {
    name: string;
    cleanName: string;
    hash: string;
    current: boolean;
    remote: boolean;
    remoteName?: string;
    upstreamRemote?: string;
    upstreamBranch?: string;
    worktreePath?: string;
}

export interface GitWorktree {
    path: string;
    name: string;
    head: string;
    branch: string | null;
    cleanBranch: string | null;
    isMain: boolean;
    isCurrent: boolean;
    detached: boolean;
    locked: boolean;
    prunable: boolean;
}

export interface GitExecutable {
    path: string;
    version: string;
}

export interface GitFileChange {
    path: string;
    status: 'A' | 'M' | 'D' | 'R' | 'C' | 'T';
    oldPath?: string; // only for renames (R) and copies (C)
    additions: number;
    deletions: number;
    sourceCommit?: string; // for stashes, the actual commit containing the file
}

export interface GitRemote {
    name: string;
    fetchUrl: string;
    pushUrl: string;
}

/** The result of diffing two arbitrary refs, with each side resolved to the commit it names */
export interface GitComparison {
    fromHash: string;
    toHash: string;
    files: GitFileChange[];
}

export interface GitTagDetails {
    hash: string;
    taggerName: string;
    taggerEmail: string;
    taggerDate: string;
    message: string;
}

export interface GitRemoteTag {
    name: string;
    hash: string; // commit the tag points at (peeled for annotated tags)
}

export interface GitTagRemoteStatus {
    remote: string;
    tags: GitRemoteTag[];
}

export type GitOperationInProgress = 'merge' | 'rebase' | 'cherry-pick';

const ABORTABLE_OPERATIONS: GitOperationInProgress[] = ['merge', 'rebase', 'cherry-pick'];

export type GitPushMode = 'normal' | 'force-with-lease' | 'force';

export type GitResetMode = 'soft' | 'mixed' | 'hard';

export type GitUndoActionKind =
    | 'commit'
    | 'amend'
    | 'merge'
    | 'rebase'
    | 'cherry-pick'
    | 'revert'
    | 'reset'
    | 'pull'
    | 'other';

export interface GitUndoableAction {
    kind: GitUndoActionKind;
    /** The reflog subject of the action, e.g. 'commit: fix the parser' */
    description: string;
    branch: string;
    /** Where the branch is now */
    currentHash: string;
    /** Where the branch was before the action, and where undoing it returns the branch to */
    previousHash: string;
    /** Whether the action changed the working tree, so undoing it faithfully needs a hard reset */
    changedWorkingTree: boolean;
}

/** Actions that wrote their result into the working tree, rather than only recording what was in it */
const WORKING_TREE_UNDO_KINDS: GitUndoActionKind[] = ['merge', 'rebase', 'cherry-pick', 'reset', 'pull', 'other'];

export interface GitRewordableCommit {
    hash: string;
    /** Whether the commit is already contained in the current branch's upstream */
    published: boolean;
}

// Use ASCII character 0x1E (Record Separator) for field separation
const GIT_LOG_SEPARATOR = '\x1E';
const EOL_REGEX = /\r\n|\r|\n/g;

export class GitService {
    private static instance: GitService;
    private static readonly LS_REMOTE_TIMEOUT_MS = 15_000;
    private cachedGitExecutable: GitExecutable | null = null;
    private activeRepoPath: string | null = null;

    private constructor() {}

    public static getInstance(): GitService {
        if (!GitService.instance) {
            GitService.instance = new GitService();
        }
        return GitService.instance;
    }

    /**
     * Point every git command at a repository, which can be the workspace folder itself or any
     * repository found inside it. Passing null returns to the default of the first workspace folder.
     * @param repoPath The absolute path of the repository to work in.
     */
    public setActiveRepoPath(repoPath: string | null): void {
        this.activeRepoPath = repoPath;
    }

    /**
     * The repository every git command runs in: the one that was selected, or the first workspace
     * folder while none has been, or null when there is no workspace folder either.
     */
    public tryGetRepoPath(): string | null {
        return this.activeRepoPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
    }

    /**
     * The repository every git command runs in, for the callers that cannot work without one.
     */
    public getRepoPath(): string {
        const repoPath = this.tryGetRepoPath();
        if (!repoPath) throw new Error('No workspace folder found');

        return repoPath;
    }

    private validatePositional(value: string, kind: string): void {
        if (!value || value.trim() === '') {
            throw new Error(`${kind} cannot be empty`);
        }
        if (value.startsWith('-')) {
            throw new Error(`Invalid ${kind}: '${value}' (${kind}s cannot start with -)`);
        }
    }

    private static readonly REF_BAD_CHARS = /[\x00-\x1f\x7f ~^:?*\[\\]/;
    private static isValidRefName(refName: string): boolean {
        if (!refName || refName === '@') return false;
        if (refName.startsWith('-') || refName.includes('/-')) return false; // arg-injection guard
        if (refName.startsWith('/') || refName.endsWith('/')) return false;
        if (refName.startsWith('.') || refName.endsWith('.')) return false;
        if (refName.endsWith('.lock')) return false;
        if (GitService.REF_BAD_CHARS.test(refName)) return false;
        if (refName.includes('..')) return false;
        if (refName.includes('//')) return false;
        if (refName.includes('@{')) return false;
        if (refName.includes('/.')) return false;
        if (refName.includes('.lock/')) return false;
        return true;
    }

    private validateRefName(refName: string): void {
        if (!GitService.isValidRefName(refName)) throw new Error(`Invalid ref name: '${refName}'`);
    }

    public async findGitExecutable(): Promise<GitExecutable> {
        if (this.cachedGitExecutable) {
            return this.cachedGitExecutable;
        }

        const gitConfig = vscode.workspace.getConfiguration('git');
        const gitPath = gitConfig.get<string>('path');
        let executablePath = gitPath || 'git';

        try {
            const version = await this.spawnGit([executablePath, '--version'], process.cwd());
            const versionMatch = version.match(/git version (.+)/);
            if (versionMatch && versionMatch[1]) {
                this.cachedGitExecutable = {
                    path: executablePath,
                    version: versionMatch[1].trim()
                };
                return this.cachedGitExecutable;
            }
        } catch (error) {
            if (gitPath) {
                try {
                    const version = await this.spawnGit(['git', '--version'], process.cwd());
                    const versionMatch = version.match(/git version (.+)/);
                    if (versionMatch && versionMatch[1]) {
                        this.cachedGitExecutable = {
                            path: 'git',
                            version: versionMatch[1].trim()
                        };
                        return this.cachedGitExecutable;
                    }
                } catch (fallbackError) {
                    // Continue to throw original error
                }
            }
        }

        throw new Error('Unable to find Git executable. Please install Git or configure the git.path setting.');
    }

    private spawnGit(args: string[], cwd: string, timeoutMs?: number, signal?: AbortSignal): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!args.length || !args[0]) {
                reject(new Error('No command provided'));
                return;
            }

            const gitProcess = cp.spawn(args[0], args.slice(1), {
                cwd: cwd,
                stdio: ['ignore', 'pipe', 'pipe'],
                signal
            });

            let stdout = '';
            let stderr = '';
            let timedOut = false;
            const timeout = timeoutMs
                ? setTimeout(() => {
                      timedOut = true;
                      gitProcess.kill();
                  }, timeoutMs)
                : undefined;

            gitProcess.stdout?.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            gitProcess.stderr?.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            gitProcess.on('close', (code: number | null) => {
                if (timeout) clearTimeout(timeout);
                if (timedOut) {
                    reject(new Error(`Git command timed out after ${timeoutMs}ms`));
                } else if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(formatGitError(stderr || stdout)));
                }
            });

            gitProcess.on('error', (error: Error) => {
                if (timeout) clearTimeout(timeout);
                reject(error);
            });
        });
    }

    private sanitizeBranchName(branchName: string, isRemote: boolean): string {
        let cleanName = branchName;
        cleanName = cleanName.replace(/^refs\/(heads|remotes)\//, '');
        if (isRemote) cleanName = cleanName.replace(/^[^/]+\//, '');

        return cleanName;
    }

    private async filterToExistingRefs(workspacePath: string, gitPath: string, refs: string[]): Promise<string[]> {
        try {
            const output = await this.spawnGit(
                [gitPath, 'for-each-ref', '--format=%(refname)', 'refs/heads/', 'refs/remotes/'],
                workspacePath
            );

            const existingRefs = new Set(
                output
                    .split(EOL_REGEX)
                    .filter((l) => l.trim())
                    .map((l) => l.trim())
            );

            return refs.filter((ref) => existingRefs.has(ref));
        } catch {
            return [];
        }
    }

    public async isGitRepository(): Promise<boolean> {
        const workspacePath = this.tryGetRepoPath();
        if (!workspacePath) return false;

        try {
            await this.spawnGit(['git', 'rev-parse', '--git-dir'], workspacePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    public async getGitBranches(log: (message: string) => void): Promise<GitBranch[]> {
        const workspacePath = this.getRepoPath();
        log(`Getting git branches from: ${workspacePath}`);

        if (!(await this.isGitRepository())) throw new Error('Not a git repository');

        try {
            const gitExecutable = await this.findGitExecutable();
            log(`Using git executable: ${gitExecutable.path}`);

            const branchOutput = await this.spawnGit(
                [
                    gitExecutable.path,
                    'branch',
                    '-a',
                    '--format=%(refname),%(HEAD),%(objectname),%(upstream:remotename),%(upstream:lstrip=3)'
                ],
                workspacePath
            );

            const branches: GitBranch[] = [];
            const lines = branchOutput.split(EOL_REGEX).filter((line: string) => line.trim());

            for (const line of lines) {
                const [name, isHead, hash, upstreamRemote, upstreamBranch] = line.split(',');
                if (name && name.trim() && hash && hash.trim()) {
                    const refName = name.trim();
                    const isRemote = refName.startsWith('refs/remotes/');
                    const remoteName = isRemote ? refName.replace('refs/remotes/', '').split('/')[0] : undefined;
                    const branchName = this.sanitizeBranchName(refName, isRemote);

                    if (refName.endsWith('/HEAD')) continue;

                    branches.push({
                        name: refName,
                        cleanName: branchName,
                        hash: hash.trim(),
                        current: isHead?.trim() === '*',
                        remote: isRemote,
                        remoteName,
                        upstreamRemote: upstreamRemote?.trim() || undefined,
                        upstreamBranch: upstreamBranch?.trim() || undefined
                    });
                }
            }

            try {
                const worktrees = await this.getWorktrees(log);
                const branchToWorktree = new Map<string, string>();
                for (const worktree of worktrees) {
                    if (!worktree.isCurrent && worktree.branch) branchToWorktree.set(worktree.branch, worktree.path);
                }

                if (branchToWorktree.size > 0) {
                    for (const branch of branches) {
                        if (branch.remote) continue;
                        const worktreePath = branchToWorktree.get(branch.name);
                        if (worktreePath) branch.worktreePath = worktreePath;
                    }
                }
            } catch {
                // Worktree info is best-effort — branches still work without it
            }

            log(`Found ${branches.length} branches`);
            return branches;
        } catch (error) {
            log(`Error getting git branches: ${error}`);
            throw error;
        }
    }

    // Worktree operations

    private validateWorktreePath(worktreePath: string): void {
        if (!worktreePath || worktreePath.trim() === '') throw new Error('Worktree path cannot be empty');
        if (worktreePath.startsWith('-')) {
            throw new Error(`Invalid worktree path: '${worktreePath}' (paths cannot start with -)`);
        }
        if (/[\x00-\x1f\x7f]/.test(worktreePath)) throw new Error(`Invalid worktree path: '${worktreePath}'`);
    }

    private normalizeFsPath(fsPath: string): string {
        const resolved = path.resolve(fsPath);
        return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
    }

    public async getWorktrees(log: (message: string) => void): Promise<GitWorktree[]> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            const output = await this.spawnGit(
                [gitExecutable.path, 'worktree', 'list', '--porcelain'],
                workspacePath
            );

            let toplevel = workspacePath;
            try {
                const toplevelOutput = await this.spawnGit(
                    [gitExecutable.path, 'rev-parse', '--show-toplevel'],
                    workspacePath
                );
                toplevel = toplevelOutput.trim() || workspacePath;
            } catch {
                // Fall back to the workspace path (e.g. bare repositories)
            }
            const currentPath = this.normalizeFsPath(toplevel);

            const worktrees: GitWorktree[] = [];
            const records = output.split(/\r?\n\r?\n/).filter((record) => record.trim());

            records.forEach((record, index) => {
                const lines = record.split(EOL_REGEX).filter((line) => line.trim());

                let worktreePath = '';
                let head = '';
                let branch: string | null = null;
                let detached = false;
                let locked = false;
                let prunable = false;
                let bare = false;

                for (const line of lines) {
                    if (line.startsWith('worktree ')) worktreePath = line.substring('worktree '.length);
                    else if (line.startsWith('HEAD ')) head = line.substring('HEAD '.length).trim();
                    else if (line.startsWith('branch ')) branch = line.substring('branch '.length).trim();
                    else if (line === 'detached') detached = true;
                    else if (line === 'bare') bare = true;
                    else if (line === 'locked' || line.startsWith('locked ')) locked = true;
                    else if (line === 'prunable' || line.startsWith('prunable ')) prunable = true;
                }

                if (!worktreePath || bare) return;

                worktrees.push({
                    path: worktreePath,
                    name: path.basename(worktreePath),
                    head,
                    branch,
                    cleanBranch: branch ? branch.replace(/^refs\/heads\//, '') : null,
                    isMain: index === 0,
                    isCurrent: this.normalizeFsPath(worktreePath) === currentPath,
                    detached,
                    locked,
                    prunable
                });
            });

            log(`Found ${worktrees.length} worktree(s)`);
            return worktrees;
        } catch (error) {
            log(`Error getting worktrees: ${error}`);
            throw error;
        }
    }

    public async addWorktree(
        log: (message: string) => void,
        worktreePath: string,
        branchName: string
    ): Promise<string> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name and worktree path
        this.validateRefName(`refs/heads/${branchName}`);
        this.validateWorktreePath(worktreePath);

        try {
            log(`Creating worktree at '${worktreePath}' for branch '${branchName}'`);
            await this.spawnGit(
                [gitExecutable.path, 'worktree', 'add', '--', worktreePath, branchName],
                workspacePath
            );

            const resolvedPath = path.resolve(workspacePath, worktreePath);
            log(`Successfully created worktree at '${resolvedPath}'`);
            return resolvedPath;
        } catch (error) {
            log(`Error creating worktree: ${error}`);
            throw error;
        }
    }

    public async removeWorktree(
        log: (message: string) => void,
        worktreePath: string,
        force: boolean = false,
        deleteBranch?: string
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate worktree path
        this.validateWorktreePath(worktreePath);

        try {
            log(`Removing worktree at '${worktreePath}'${force ? ' (force)' : ''}`);
            const args = [gitExecutable.path, 'worktree', 'remove'];
            if (force) args.push('--force');
            args.push('--', worktreePath);

            await this.spawnGit(args, workspacePath);
            log(`Successfully removed worktree at '${worktreePath}'`);
        } catch (error) {
            log(`Error removing worktree: ${error}`);
            throw error;
        }

        if (deleteBranch) {
            await this.deleteBranch(log, deleteBranch, force);
        }
    }

    /**
     * The root of the repository a folder belongs to, which can be the folder itself or any folder
     * above it. Answers null when the folder is not inside a repository at all.
     * @param folderPath The absolute path of the folder.
     */
    public async findEnclosingRepoRoot(folderPath: string): Promise<string | null> {
        try {
            const gitExecutable = await this.findGitExecutable();
            const output = await this.spawnGit([gitExecutable.path, 'rev-parse', '--show-toplevel'], folderPath);
            const root = output.split(EOL_REGEX)[0]?.trim();
            return root ? path.resolve(root) : null;
        } catch {
            return null;
        }
    }

    public async getGitDirs(): Promise<{ gitDir: string; commonDir: string }> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        const output = await this.spawnGit(
            [gitExecutable.path, 'rev-parse', '--git-dir', '--git-common-dir'],
            workspacePath
        );

        const [gitDirRaw, commonDirRaw] = output
            .split(EOL_REGEX)
            .map((line) => line.trim())
            .filter(Boolean);

        const gitDir = path.resolve(workspacePath, gitDirRaw ?? '.git');
        const commonDir = path.resolve(workspacePath, commonDirRaw ?? gitDirRaw ?? '.git');
        return { gitDir, commonDir };
    }

    private async getStashInfo(workspacePath: string, gitPath: string): Promise<Map<string, string>> {
        const stashMap = new Map<string, string>();

        try {
            const output = await this.spawnGit([gitPath, 'stash', 'list', '--format=%H|%gd'], workspacePath);

            const lines = output.split(EOL_REGEX).filter((l) => l.trim());
            for (const line of lines) {
                const [hash, ref] = line.split('|');
                if (hash?.trim() && ref?.trim()) {
                    stashMap.set(hash.trim(), ref.trim());
                }
            }
        } catch {
            // No stashes
        }

        return stashMap;
    }

    /**
     * Get stash parents information - stashes are merge commits with multiple parents:
     * - Parent 0: baseHash (the commit the stash was created from)
     * - Parent 1: index state (staged changes)
     * - Parent 2: untrackedFilesHash (if untracked files exist)
     */
    private async getStashParents(
        stashHash: string,
        workspacePath: string,
        gitPath: string
    ): Promise<{ baseHash: string | null; untrackedFilesHash: string | null }> {
        try {
            // Basic validation for stash hash
            this.validatePositional(stashHash, 'stash hash');

            const output = await this.spawnGit([gitPath, 'rev-list', '--parents', '-n', '1', stashHash], workspacePath);

            const parts = output.trim().split(' ');
            if (parts.length < 2) {
                return { baseHash: null, untrackedFilesHash: null };
            }

            // parts[0] is the stash hash itself
            // parts[1] is the base commit (first parent)
            // parts[2] is the index state (second parent)
            // parts[3] is the untracked files hash (third parent) if it exists
            const baseHash = parts[1] || null;
            // Check for exactly 4 parts (commit + 3 parents) to match Git Graph's logic
            const untrackedFilesHash = parts.length === 4 ? parts[3] || null : null;

            return { baseHash, untrackedFilesHash };
        } catch (error) {
            return { baseHash: null, untrackedFilesHash: null };
        }
    }

    /**
     * Get untracked files from stash using the untracked files hash
     */
    private async getUntrackedFilesFromStash(
        untrackedFilesHash: string,
        workspacePath: string,
        gitPath: string
    ): Promise<GitFileChange[]> {
        try {
            // For untracked files, use diff-tree to show the content of the untracked files commit
            // This is exactly how Git Graph does it - diff-tree with a single hash shows the diff against parent
            const statusOutput = await this.spawnGit(
                [gitPath, 'diff-tree', '--name-status', '-r', '--root', untrackedFilesHash],
                workspacePath
            );

            const numstatOutput = await this.spawnGit(
                [gitPath, 'diff-tree', '--numstat', '-r', '--root', untrackedFilesHash],
                workspacePath
            );

            // Parse numstat for untracked files
            const statsMap = new Map<string, { additions: number; deletions: number }>();
            for (const line of numstatOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                const parts = line.split('\t');
                if (parts.length >= 3) {
                    const additions = parts[0] === '-' ? 0 : parseInt(parts[0] ?? '0') || 0;
                    const deletions = parts[1] === '-' ? 0 : parseInt(parts[1] ?? '0') || 0;
                    const path = parts.slice(2).join('\t');
                    statsMap.set(path, { additions, deletions });
                }
            }

            const untrackedFiles: GitFileChange[] = [];
            for (const line of statusOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                const parts = line.split('\t');
                if (parts.length >= 2) {
                    const statusRaw = parts[0]?.trim();
                    const path = parts[1]?.trim() || '';
                    const stats = statsMap.get(path) ?? { additions: 0, deletions: 0 };

                    // Convert 'A' (Added) status to untracked files, matching Git Graph's approach
                    // In the context of stash untracked files, 'A' means the file was untracked when stashed
                    const status = statusRaw === 'A' ? 'A' : (statusRaw?.[0] as GitFileChange['status']) || 'A';
                    untrackedFiles.push({ path, status, ...stats });
                }
            }

            return untrackedFiles;
        } catch (error) {
            return [];
        }
    }

    private async getStashCommits(
        workspacePath: string,
        gitPath: string,
        stashMap: Map<string, string>
    ): Promise<GitCommit[]> {
        if (stashMap.size === 0) return [];

        const format = ['%H', '%P', '%an', '%ae', '%ai', '%s'].join(GIT_LOG_SEPARATOR);
        const stashes: GitCommit[] = [];
        const hashes = Array.from(stashMap.keys());

        try {
            const output = await this.spawnGit(
                [gitPath, 'log', '--no-walk', `--pretty=format:${format}`, ...hashes],
                workspacePath
            );

            const lines = output
                .trim()
                .split('\n')
                .filter((line) => line.trim());
            for (const line of lines) {
                const parts = line.split(GIT_LOG_SEPARATOR);
                if (parts.length < 6) continue;
                const [hash, parentHashes, author, email, date, message] = parts;

                if (!hash) continue;
                const ref = stashMap.get(hash);
                if (!ref) continue;

                stashes.push({
                    hash,
                    parents: parentHashes?.trim() ? [parentHashes.trim().split(' ')[0]!] : [],
                    author: author?.trim() || '',
                    email: email?.trim() || '',
                    date: date?.trim() || '',
                    message: message?.trim() || '',
                    tags: [],
                    isStash: true,
                    refs: ref
                });
            }
        } catch (error) {
            // for (const [hash, ref] of stashMap) {
            //     try {
            //         const output = await this.spawnGit(
            //             [gitPath, 'log', '-1', `--pretty=format:${format}`, hash],
            //             workspacePath
            //         );
            //         const parts = output.trim().split(GIT_LOG_SEPARATOR);
            //         if (parts.length < 6) continue;
            //         const [, parentHashes, author, email, date, message] = parts;
            //         stashes.push({
            //             hash,
            //             parents: parentHashes?.trim() ? [parentHashes.trim().split(' ')[0]!] : [],
            //             author: author?.trim() || '',
            //             email: email?.trim() || '',
            //             date: date?.trim() || '',
            //             message: message?.trim() || '',
            //             tags: [],
            //             isStash: true,
            //             refs: ref
            //         });
            //     } catch {
            //         // Skip this stash
            //     }
            // }
        }

        return stashes;
    }

    public async getWorkingChanges(
        log: (message: string) => void,
        includeFiles: boolean = false
    ): Promise<{ commit: GitCommit; files: GitFileChange[] } | null> {
        const workspacePath = this.tryGetRepoPath();
        if (!workspacePath) return null;
        const gitExecutable = await this.findGitExecutable();

        try {
            const statusOutput = await this.spawnGit(
                [gitExecutable.path, 'diff', 'HEAD', '--name-status', '-r', '-M'],
                workspacePath
            );

            const untrackedOutput = await this.spawnGit(
                [gitExecutable.path, 'ls-files', '--others', '--exclude-standard'],
                workspacePath
            );

            const statusLines = statusOutput.split(EOL_REGEX).filter((l) => l.trim());
            const untrackedLines = untrackedOutput.split(EOL_REGEX).filter((l) => l.trim());

            if (statusLines.length === 0 && untrackedLines.length === 0) {
                log('No working changes');
                return null;
            }

            const headHash = await this.spawnGit([gitExecutable.path, 'rev-parse', 'HEAD'], workspacePath);

            let author = '';
            let email = '';
            try {
                author = (await this.spawnGit([gitExecutable.path, 'config', 'user.name'], workspacePath)).trim();
                email = (await this.spawnGit([gitExecutable.path, 'config', 'user.email'], workspacePath)).trim();
            } catch {
                // user config not set
            }

            const fileCount = statusLines.length + untrackedLines.length;

            const commit: GitCommit = {
                hash: 'working-changes',
                parents: [headHash.trim()],
                author,
                email,
                date: new Date().toISOString(),
                message: `Uncommitted changes (${fileCount})`,
                tags: [],
                isStash: false,
                isHead: false,
                refs: undefined,
                isUncommitted: true
            };

            let files: GitFileChange[] = [];

            if (includeFiles) {
                const numstatOutput = await this.spawnGit(
                    [gitExecutable.path, 'diff', 'HEAD', '--numstat', '-r', '-M'],
                    workspacePath
                );

                const statsMap = new Map<string, { additions: number; deletions: number }>();
                for (const line of numstatOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                    const parts = line.split('\t');
                    if (parts.length < 3) continue;
                    const additions = parts[0] === '-' ? 0 : parseInt(parts[0]!, 10);
                    const deletions = parts[1] === '-' ? 0 : parseInt(parts[1]!, 10);
                    const path = parts[parts.length - 1]!.trim();
                    statsMap.set(path, { additions, deletions });
                }

                for (const line of statusLines) {
                    const parts = line.split('\t');
                    if (parts.length < 2) continue;

                    const statusRaw = parts[0]!.trim();
                    const status = statusRaw[0] as GitFileChange['status'];

                    if (status === 'R' || status === 'C') {
                        const oldPath = parts[1]?.trim() || '';
                        const newPath = parts[2]?.trim() || '';
                        const stats = statsMap.get(newPath) ?? { additions: 0, deletions: 0 };
                        files.push({ path: newPath, status, oldPath, ...stats });
                    } else {
                        const path = parts[1]?.trim() || '';
                        const stats = statsMap.get(path) ?? { additions: 0, deletions: 0 };
                        files.push({ path, status, ...stats });
                    }
                }

                for (const line of untrackedLines) {
                    files.push({
                        path: line.trim(),
                        status: 'A',
                        additions: 0,
                        deletions: 0
                    });
                }
            }

            log(`Found uncommitted changes (${statusLines.length + untrackedLines.length} files)`);
            return { commit, files };
        } catch (error) {
            log(`Error getting working changes: ${error}`);
            return null;
        }
    }

    public async getGitCommits(
        log: (message: string) => void,
        branches?: string[],
        maxCount: number = 100,
        skip: number = 0
    ): Promise<{ commits: GitCommit[]; hasMore: boolean; total?: number }> {
        const workspacePath = this.getRepoPath();
        log(`Getting git commits from: ${workspacePath}`);

        if (!(await this.isGitRepository())) throw new Error('Not a git repository');
        log('Confirmed git repository');

        try {
            const gitExecutable = await this.findGitExecutable();
            log(`Using git executable: ${gitExecutable.path} (version: ${gitExecutable.version})`);

            const format = [
                '%H', // Hash
                '%P', // Parent hashes (space-separated)
                '%an', // Author name
                '%ae', // Author email
                '%ai', // Author date (ISO format)
                '%cn', // Committer name
                '%ce', // Committer email
                '%s', // Subject
                '%D', // Refs
                '%b' // Body — kept last, as it can span multiple lines (records are NUL-separated via -z)
            ].join(GIT_LOG_SEPARATOR);

            log(`Executing git log command (maxCount: ${maxCount}, skip: ${skip})`);

            const stashMap = await this.getStashInfo(workspacePath, gitExecutable.path);
            log(`Found ${stashMap.size} stash(es)`);
            const stashCommits =
                stashMap.size > 0 ? await this.getStashCommits(workspacePath, gitExecutable.path, stashMap) : [];

            const gitArgs = [
                gitExecutable.path,
                '-c',
                'log.showSignature=false',
                'log',
                '-z',
                `--max-count=${maxCount + 1}`,
                `--skip=${skip}`,
                `--pretty=format:${format}`,
                '--date-order',
                '--decorate=full'
            ];

            gitArgs.push(...(await this.resolveLogRefArgs(workspacePath, gitExecutable.path, branches, log)));

            // A stash's base commit can be unreachable from every ref — rewording, resetting or
            // undoing rewrites the commit a stash was made on — so each base is walked explicitly,
            // keeping the stash and the commit it sits on visible in the graph.
            const stashBases = [
                ...new Set(stashCommits.map((stash) => stash.parents[0]).filter((hash): hash is string => !!hash))
            ];
            gitArgs.push(...stashBases);

            gitArgs.push('--');

            const gitLog = await this.spawnGit(gitArgs, workspacePath);

            let lines = gitLog.split('\x00').filter((line: string) => line.trim());

            let hasMore = false;
            if (lines.length > maxCount) {
                hasMore = true;
                lines = lines.slice(0, maxCount);
            }

            const commits: GitCommit[] = [];

            for (const line of lines) {
                if (!line.includes(GIT_LOG_SEPARATOR)) continue;

                const parts = line.split(GIT_LOG_SEPARATOR);
                if (parts.length < 10) {
                    // We expect 10 parts: hash, parents, author, email, date, committer, committer email, subject, refs, body
                    log(`Skipping malformed line: ${line}`);
                    continue;
                }

                const [hash, parentHashes, author, email, date, committer, committerEmail, message, refs] = parts;
                // The body is the last field so its newlines survive; rejoin in case it contains the separator itself
                const body = parts.slice(9).join(GIT_LOG_SEPARATOR).trim();

                if (!hash?.trim()) {
                    log(`Skipping line with missing hash: ${line}`);
                    continue;
                }

                const trimmedHash = hash.trim();

                const tags = refs?.trim()
                    ? refs
                          .split(',')
                          .map((r) => r.trim())
                          .filter((r) => r.includes('refs/tags/'))
                          .map((r) =>
                              r
                                  .replace(/^tag:\s*/, '')
                                  .replace('refs/tags/', '')
                                  .trim()
                          )
                    : [];

                let commitRefs: string | undefined;
                if (refs?.trim()) {
                    const cleaned = refs
                        .split(',')
                        .map((r) => r.trim())
                        .filter((r) => r !== 'refs/stash' && r !== 'stash')
                        .join(', ');
                    commitRefs = cleaned || undefined;
                }

                const isHead =
                    refs?.split(',').some((r) => r.trim() === 'HEAD' || r.trim().startsWith('HEAD ->')) ?? false;

                commits.push({
                    hash: trimmedHash,
                    parents: parentHashes?.trim() ? parentHashes.trim().split(' ') : [],
                    author: author?.trim() || '',
                    email: email?.trim() || '',
                    date: date?.trim() || '',
                    message: message?.trim() || '',
                    body: body || undefined,
                    committer: committer?.trim() || undefined,
                    committerEmail: committerEmail?.trim() || undefined,
                    tags,
                    isStash: false,
                    refs: commitRefs,
                    isHead
                });
            }

            for (const stash of stashCommits) {
                const parentIdx = commits.findIndex((c) => c.hash === stash.parents[0]);

                if (parentIdx !== -1) commits.splice(parentIdx, 0, stash);
            }

            log(`Parsed ${commits.length} commits (hasMore: ${hasMore})`);
            return { commits, hasMore };
        } catch (error) {
            log(`Error getting git commits: ${error}`);
            throw error;
        }
    }

    /**
     * The ref arguments the graph's `git log` runs over: the selected branches when they still
     * exist, or every branch, tag, remote and HEAD otherwise.
     */
    private async resolveLogRefArgs(
        workspacePath: string,
        gitPath: string,
        branches: string[] | undefined,
        log: (message: string) => void
    ): Promise<string[]> {
        if (branches && branches.length > 0) {
            const existingBranches = await this.filterToExistingRefs(workspacePath, gitPath, branches);

            if (existingBranches.length > 0) {
                log(`Filtering commits for branches: ${existingBranches.join(', ')}`);
                return existingBranches;
            }
            log('No valid branches found, showing all');
        } else {
            log('Showing commits from all branches');
        }

        return ['--branches', '--tags', '--remotes', 'HEAD'];
    }

    private static readonly SEARCH_TIMEOUT_MS = 30_000;
    private searchAbortController: AbortController | null = null;

    /** Stop the search still running, for when its term was cleared rather than replaced. */
    public cancelSearch(): void {
        this.searchAbortController?.abort();
        this.searchAbortController = null;
    }

    /**
     * Search the whole history (not just the loaded pages) over the same ref set the graph shows,
     * returning the matching hashes in the graph's own `--date-order`. The term supports the
     * `author:`, `file:` and `hash:` prefixes; a plain term matches the commit message, the author,
     * or a hash prefix. Starting a new search aborts the one still running.
     */
    public async searchCommits(
        log: (message: string) => void,
        term: string,
        branches?: string[]
    ): Promise<{ hashes: string[] }> {
        const workspacePath = this.getRepoPath();
        const trimmed = term.trim();
        if (!trimmed) return { hashes: [] };

        this.searchAbortController?.abort();
        const abort = new AbortController();
        this.searchAbortController = abort;

        if (!(await this.isGitRepository())) throw new Error('Not a git repository');

        const gitExecutable = await this.findGitExecutable();
        const refArgs = await this.resolveLogRefArgs(workspacePath, gitExecutable.path, branches, () => {});

        const logHashes = async (extraArgs: string[], pathspec?: string): Promise<string[]> => {
            const args = [
                gitExecutable.path,
                '-c',
                'log.showSignature=false',
                'log',
                '--format=%H',
                '--date-order',
                ...extraArgs,
                ...refArgs,
                '--'
            ];
            if (pathspec) args.push(pathspec);

            const output = await this.spawnGit(args, workspacePath, GitService.SEARCH_TIMEOUT_MS, abort.signal);
            return output
                .split(EOL_REGEX)
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
        };

        const prefixed = /^(author|file|hash):([\s\S]*)$/i.exec(trimmed);
        const kind = prefixed?.[1]?.toLowerCase() ?? 'plain';
        const value = (prefixed?.[2] ?? trimmed).trim();

        try {
            let ordered: string[] = [];

            if (!value) {
                // A bare prefix like `author:` matches nothing yet
            } else if (kind === 'author') {
                ordered = await logHashes(['-i', '--fixed-strings', `--author=${value}`]);
            } else if (kind === 'file') {
                // Substring match anywhere in the path, unless the user already wrote a glob
                const pathspec = /[*?[\]]/.test(value) ? value : `*${value}*`;
                ordered = await logHashes([], pathspec);
            } else {
                const lower = value.toLowerCase();
                const wantsHashMatch =
                    kind === 'hash' ? /^[0-9a-f]{1,40}$/.test(lower) : /^[0-9a-f]{4,40}$/.test(lower);

                // The full ordered hash list both resolves prefix matches and orders the union
                const [allHashes, grepMatches, authorMatches] = await Promise.all([
                    logHashes([]),
                    kind === 'plain' ? logHashes(['-i', '--fixed-strings', `--grep=${value}`]) : [],
                    kind === 'plain' ? logHashes(['-i', '--fixed-strings', `--author=${value}`]) : []
                ]);

                const matches = new Set<string>([...grepMatches, ...authorMatches]);
                if (wantsHashMatch) {
                    for (const hash of allHashes) {
                        if (hash.startsWith(lower)) matches.add(hash);
                    }
                }

                ordered = allHashes.filter((hash) => matches.has(hash));
            }

            log(`Search '${trimmed}' matched ${ordered.length} commit(s)`);
            return { hashes: ordered };
        } catch (error) {
            if (abort.signal.aborted) throw new Error('Search cancelled');
            log(`Error searching commits: ${error}`);
            throw error;
        } finally {
            if (this.searchAbortController === abort) this.searchAbortController = null;
        }
    }

    /**
     * The file list of a diff, from the `--name-status` and `--numstat` renderings of the same
     * `git diff`/`diff-tree` invocation. Renames and copies are reported as `old\tnew`, and the
     * stats are keyed by the new path.
     */
    private static parseFileChanges(statusOutput: string, numstatOutput: string): GitFileChange[] {
        const statsMap = new Map<string, { additions: number; deletions: number }>();
        for (const line of numstatOutput.split(EOL_REGEX).filter((l) => l.trim())) {
            const parts = line.split('\t');
            if (parts.length < 3) continue;
            const additions = parts[0] === '-' ? 0 : parseInt(parts[0]!, 10);
            const deletions = parts[1] === '-' ? 0 : parseInt(parts[1]!, 10);
            const path = parts[parts.length - 1]!.trim();
            statsMap.set(path, { additions, deletions });
        }

        const files: GitFileChange[] = [];
        for (const line of statusOutput.split(EOL_REGEX).filter((l) => l.trim())) {
            const parts = line.split('\t');
            if (parts.length < 2) continue;

            const statusRaw = parts[0]!.trim();
            const status = statusRaw[0] as GitFileChange['status'];

            if (status === 'R' || status === 'C') {
                const oldPath = parts[1]?.trim() || '';
                const newPath = parts[2]?.trim() || '';
                const stats = statsMap.get(newPath) ?? { additions: 0, deletions: 0 };
                files.push({ path: newPath, status, oldPath, ...stats });
            } else {
                const path = parts[1]?.trim() || '';
                const stats = statsMap.get(path) ?? { additions: 0, deletions: 0 };
                files.push({ path, status, ...stats });
            }
        }

        return files;
    }

    /**
     * The files that differ between two arbitrary refs, as `git diff A B` sees them: a file added
     * in B counts as added, one only in A as deleted. Both refs are resolved to full hashes so the
     * caller can address the two sides by commit even when it was handed branch or tag names.
     */
    public async compareRefs(
        log: (message: string) => void,
        fromRef: string,
        toRef: string
    ): Promise<GitComparison> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        this.validatePositional(fromRef, 'ref');
        this.validatePositional(toRef, 'ref');

        try {
            const [fromHash, toHash] = await Promise.all([
                this.spawnGit([gitExecutable.path, 'rev-parse', `${fromRef}^{commit}`], workspacePath),
                this.spawnGit([gitExecutable.path, 'rev-parse', `${toRef}^{commit}`], workspacePath)
            ]);

            const baseArgs = [gitExecutable.path, 'diff', '-M', fromHash.trim(), toHash.trim()];
            const [statusOutput, numstatOutput] = await Promise.all([
                this.spawnGit([...baseArgs, '--name-status', '--'], workspacePath),
                this.spawnGit([...baseArgs, '--numstat', '--'], workspacePath)
            ]);

            const files = GitService.parseFileChanges(statusOutput, numstatOutput);

            log(`Comparison ${fromRef}..${toRef} has ${files.length} changed file(s)`);
            return { fromHash: fromHash.trim(), toHash: toHash.trim(), files };
        } catch (error) {
            log(`Error comparing '${fromRef}' with '${toRef}': ${error}`);
            throw error;
        }
    }

    public async getCommitFiles(
        log: (message: string) => void,
        commitHash: string,
        isStash: boolean = false
    ): Promise<GitFileChange[]> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            if (isStash) return await this.getStashFiles(log, commitHash, workspacePath, gitExecutable.path);

            // Guard against argument injection — same as cherryPickCommit / revertCommit
            this.validatePositional(commitHash, 'commit hash');

            // Determine parent count to choose the right diff-tree invocation
            const parentOutput = await this.spawnGit(
                [gitExecutable.path, 'log', '-1', '--pretty=format:%P', commitHash],
                workspacePath
            );
            const parents = parentOutput.trim().split(' ').filter(Boolean);

            // Build the trailing args for diff-tree based on parent count:
            //   0 parents (root)  -> --root <commit>
            //   1 parent (normal) -> <commit>
            //   2+ parents (merge) -> <commit>^1 <commit>  (diff against first parent)
            // --cc is NOT what we want — it only shows files with non-trivial conflict
            // resolution, so clean merges would render an empty file list.
            const revArgs: string[] =
                parents.length === 0
                    ? ['--root', commitHash]
                    : parents.length === 1
                      ? [commitHash]
                      : [`${commitHash}^1`, commitHash];

            const baseArgs = [gitExecutable.path, 'diff-tree', '--no-commit-id', '-r', '-M'];

            const statusOutput = await this.spawnGit([...baseArgs, '--name-status', ...revArgs], workspacePath);
            const numstatOutput = await this.spawnGit([...baseArgs, '--numstat', ...revArgs], workspacePath);

            const files = GitService.parseFileChanges(statusOutput, numstatOutput);

            log(`Found ${files.length} changed files for commit ${commitHash.substring(0, 7)}`);
            return files;
        } catch (error) {
            log(`Error getting commit files: ${error}`);
            throw error;
        }
    }

    private async getStashFiles(
        log: (message: string) => void,
        stashHash: string,
        workspacePath: string,
        gitPath: string
    ): Promise<GitFileChange[]> {
        try {
            // Get stash parents information - stashes are merge commits with multiple parents
            const stashParents = await this.getStashParents(stashHash, workspacePath, gitPath);
            if (!stashParents.baseHash) {
                log(`Could not get base commit for stash ${stashHash.substring(0, 7)}`);
                return [];
            }

            // Use git diff between stash and its base commit (like Git Graph)
            const statusOutput = await this.spawnGit(
                [gitPath, 'diff', '--name-status', stashParents.baseHash, stashHash],
                workspacePath
            );

            const numstatOutput = await this.spawnGit(
                [gitPath, 'diff', '--numstat', stashParents.baseHash, stashHash],
                workspacePath
            );

            // Parse numstat to get additions/deletions
            const statsMap = new Map<string, { additions: number; deletions: number }>();
            for (const line of numstatOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                const parts = line.split('\t');
                if (parts.length >= 3) {
                    const additions = parts[0] === '-' ? 0 : parseInt(parts[0] ?? '0') || 0;
                    const deletions = parts[1] === '-' ? 0 : parseInt(parts[1] ?? '0') || 0;
                    const path = parts.slice(2).join('\t');
                    statsMap.set(path, { additions, deletions });
                }
            }

            // Parse file status
            const files: GitFileChange[] = [];
            for (const line of statusOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                const parts = line.split('\t');
                if (parts.length < 2) continue;

                const statusRaw = parts[0]!.trim();
                const status = statusRaw[0] as GitFileChange['status'];

                if (status === 'R' || status === 'C') {
                    const oldPath = parts[1]?.trim() || '';
                    const newPath = parts[2]?.trim() || '';
                    const stats = statsMap.get(newPath) ?? { additions: 0, deletions: 0 };
                    files.push({
                        path: newPath,
                        status,
                        oldPath,
                        ...stats,
                        sourceCommit: stashHash // Use main stash commit for tracked files
                    });
                } else {
                    const path = parts[1]?.trim() || '';
                    const stats = statsMap.get(path) ?? { additions: 0, deletions: 0 };
                    files.push({
                        path,
                        status,
                        ...stats,
                        sourceCommit: stashHash // Use main stash commit for tracked files
                    });
                }
            }

            // Handle untracked files if they exist (like Git Graph)
            if (stashParents.untrackedFilesHash) {
                const untrackedFiles = await this.getUntrackedFilesFromStash(
                    stashParents.untrackedFilesHash,
                    workspacePath,
                    gitPath
                );
                // Add sourceCommit for untracked files
                for (const file of untrackedFiles) {
                    files.push({
                        ...file,
                        sourceCommit: stashParents.untrackedFilesHash // Use untracked parent for these files
                    });
                }
            }

            log(`Found ${files.length} changed files in stash ${stashHash.substring(0, 7)}`);
            return files;
        } catch (error) {
            log(`Error getting stash files: ${error}`);
            return [];
        }
    }

    public async addTag(
        log: (message: string) => void,
        commitHash: string,
        tagName: string,
        tagMessage?: string,
        tagType: 'annotated' | 'lightweight' = 'annotated'
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name. Git allows commas in refs, but the extension parses
        // comma-separated decorations and branch listings, so commas are banned
        if (tagName.includes(',')) throw new Error('Tag names cannot contain commas');
        this.validateRefName(`refs/tags/${tagName}`);

        try {
            const args = [gitExecutable.path, 'tag'];

            if (tagType === 'annotated') {
                if (tagMessage?.trim()) {
                    args.push('-a', '-m', tagMessage, '--', tagName, commitHash);
                } else {
                    args.push('--', tagName, commitHash);
                    tagType = 'lightweight';
                }
            } else {
                args.push('--', tagName, commitHash);
            }

            await this.spawnGit(args, workspacePath);
            log(`Successfully created ${tagType} tag '${tagName}' at commit ${commitHash.substring(0, 7)}`);
        } catch (error) {
            log(`Error creating tag: ${error}`);
            throw error;
        }
    }

    public async createBranchFromCommit(
        log: (message: string) => void,
        commitHash: string,
        branchName: string,
        checkout: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        this.validatePositional(commitHash, 'commit hash');

        try {
            if (checkout) {
                await this.spawnGit([gitExecutable.path, 'checkout', '-b', branchName, commitHash], workspacePath);
                log(
                    `Successfully created and checked out branch '${branchName}' from commit ${commitHash.substring(0, 7)}`
                );
            } else {
                await this.spawnGit([gitExecutable.path, 'branch', '--', branchName, commitHash], workspacePath);
                log(`Successfully created branch '${branchName}' from commit ${commitHash.substring(0, 7)}`);
            }
        } catch (error) {
            log(`Error creating branch: ${error}`);
            throw error;
        }
    }

    public async cherryPickCommit(
        log: (message: string) => void,
        commitHash: string,
        recordOrigin: boolean = false,
        noCommit: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Basic validation for commit hash
        // Note: This only validates against leading '-' since the webview only sends single hashes,
        // not ranges like A..B. If range support is added later, validation needs to be enhanced.
        this.validatePositional(commitHash, 'commit hash');

        try {
            const args = [gitExecutable.path, 'cherry-pick'];

            if (recordOrigin) {
                args.push('-x');
            }

            if (noCommit) {
                args.push('--no-commit');
            }

            args.push('--', commitHash);

            await this.spawnGit(args, workspacePath);

            const options = [];
            if (recordOrigin) options.push('with origin record');
            if (noCommit) options.push('without commit');
            const optionsText = options.length > 0 ? ` (${options.join(', ')})` : '';

            log(`Successfully cherry-picked commit ${commitHash.substring(0, 7)}${optionsText}`);
        } catch (error) {
            log(`Error cherry-picking commit: ${error}`);
            throw error;
        }
    }

    public async revertCommit(
        log: (message: string) => void,
        commitHash: string,
        noCommit: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Basic validation for commit hash
        // Note: This only validates against leading '-' since the webview only sends single hashes,
        // not ranges like A..B. If range support is added later, validation needs to be enhanced.
        this.validatePositional(commitHash, 'commit hash');

        try {
            const args = [gitExecutable.path, 'revert'];

            if (noCommit) {
                args.push('--no-commit');
            }

            args.push('--', commitHash);

            await this.spawnGit(args, workspacePath);

            const action = noCommit ? 'staged revert changes for' : 'reverted';
            log(`Successfully ${action} commit ${commitHash.substring(0, 7)}`);
        } catch (error) {
            log(`Error reverting commit: ${error}`);
            throw error;
        }
    }

    public async checkoutLocalBranch(log: (message: string) => void, branchName: string): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        try {
            log(`Checking out local branch: ${branchName}`);
            await this.spawnGit([gitExecutable.path, 'checkout', branchName], workspacePath);
            log(`Successfully checked out branch: ${branchName}`);
        } catch (error) {
            log(`Error checking out branch: ${error}`);
            throw error;
        }
    }

    public async hasUpstreamBranch(): Promise<boolean> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            await this.spawnGit(
                [gitExecutable.path, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'],
                workspacePath
            );
            return true;
        } catch {
            return false;
        }
    }

    public async pullCurrentBranch(log: (message: string) => void): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            log('Pulling the current branch from its upstream...');
            await this.spawnGit([gitExecutable.path, 'pull', '--no-edit'], workspacePath);
            log('Successfully pulled the current branch');
        } catch (error) {
            log(`Error pulling the current branch: ${error}`);
            throw error;
        }
    }

    public async checkoutRemoteBranch(
        log: (message: string) => void,
        remoteBranchName: string,
        localBranchName: string
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate both branch names
        this.validateRefName(`refs/remotes/${remoteBranchName}`);
        this.validateRefName(`refs/heads/${localBranchName}`);

        try {
            log(`Creating and checking out local branch '${localBranchName}' from remote '${remoteBranchName}'`);
            await this.spawnGit(
                [gitExecutable.path, 'checkout', '-b', localBranchName, remoteBranchName],
                workspacePath
            );
            log(`Successfully created and checked out branch: ${localBranchName}`);
        } catch (error) {
            log(`Error creating branch from remote: ${error}`);
            throw error;
        }
    }

    public async getCurrentBranch(log: (message: string) => void): Promise<string | null> {
        const workspacePath = this.tryGetRepoPath();
        if (!workspacePath) return null;
        const gitExecutable = await this.findGitExecutable();

        try {
            // symbolic-ref returns the full ref, so the name always matches the one derived from
            // %(refname). 'rev-parse --abbrev-ref' shortens it instead, and the shortening is only
            // as short as it is unambiguous: with a tag named like the branch it answers
            // 'heads/my-branch', which no longer matches any branch in the list.
            const symbolicRef = await this.spawnGit(
                [gitExecutable.path, 'symbolic-ref', '--quiet', 'HEAD'],
                workspacePath
            );

            const ref = symbolicRef.trim();
            // HEAD can point outside refs/heads/, in which case no branch is checked out
            if (!ref.startsWith('refs/heads/')) {
                log(`HEAD does not point at a branch: ${ref || '(empty)'}`);
                return null;
            }

            const branchName = ref.slice('refs/heads/'.length);
            log(`Current branch: ${branchName}`);
            return branchName;
        } catch (error) {
            // --quiet makes symbolic-ref exit non-zero without output when HEAD is detached
            log(`No branch checked out (detached HEAD or unreadable HEAD): ${error}`);
            return null;
        }
    }

    public async fetch(log: (message: string) => void, prune: boolean = false): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            log('Fetching from remote repositories...');

            const args = [gitExecutable.path, 'fetch', '--all'];
            if (prune) args.push('--prune');

            await this.spawnGit(args, workspacePath);
            log(`Successfully fetched from remotes${prune ? ' and pruned deleted remote branches' : ''}`);
        } catch (error) {
            log(`Error fetching from remotes: ${error}`);
            throw error;
        }
    }

    public async pushBranch(
        log: (message: string) => void,
        branchName: string,
        remote: string = 'origin',
        setUpstream: boolean = false,
        pushMode: GitPushMode = 'normal'
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        // Validate remote name
        this.validatePositional(remote, 'remote name');

        try {
            log(`Pushing branch ${branchName} to ${remote}${setUpstream ? ' (setting upstream)' : ''}`);
            const args = [gitExecutable.path, 'push'];
            if (setUpstream) args.push('--set-upstream');
            if (pushMode === 'force-with-lease') args.push('--force-with-lease');
            else if (pushMode === 'force') args.push('--force');
            args.push('--', remote, branchName);

            await this.spawnGit(args, workspacePath);
            log(`Successfully pushed branch ${branchName}`);
        } catch (error) {
            log(`Error pushing branch: ${error}`);
            throw error;
        }
    }

    public async renameBranch(log: (message: string) => void, oldName: string, newName: string): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate both old and new branch names
        this.validateRefName(`refs/heads/${oldName}`);
        this.validateRefName(`refs/heads/${newName}`);

        try {
            log(`Renaming branch ${oldName} to ${newName}`);
            await this.spawnGit([gitExecutable.path, 'branch', '-m', '--', oldName, newName], workspacePath);
            log(`Successfully renamed branch to ${newName}`);
        } catch (error) {
            log(`Error renaming branch: ${error}`);
            throw error;
        }
    }

    public async deleteBranch(
        log: (message: string) => void,
        branchName: string,
        force: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        try {
            log(`Deleting branch ${branchName}${force ? ' (force)' : ''}`);
            const deleteFlag = force ? '-D' : '-d';
            await this.spawnGit([gitExecutable.path, 'branch', deleteFlag, '--', branchName], workspacePath);
            log(`Successfully deleted branch ${branchName}`);
        } catch (error) {
            log(`Error deleting branch: ${error}`);
            throw error;
        }
    }

    public async mergeBranch(
        log: (message: string) => void,
        branchName: string,
        fastForwardIfPossible: boolean = true,
        squash: boolean = false,
        noCommit: boolean = false,
        commitMessage?: string
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        try {
            log(`Merging branch ${branchName} into current branch`);
            const args = [gitExecutable.path, 'merge'];

            if (squash) {
                args.push('--squash');
            } else if (!fastForwardIfPossible) {
                args.push('--no-ff');
            }

            if (noCommit) {
                args.push('--no-commit');
            }

            if (commitMessage && !squash && !noCommit) {
                args.push('-m', commitMessage);
            }

            args.push('--', branchName);

            await this.spawnGit(args, workspacePath);
            log(`Successfully merged branch ${branchName}`);
        } catch (error) {
            log(`Error merging branch: ${error}`);
            throw error;
        }
    }

    public async mergeCommitIntoCurrentBranch(
        log: (message: string) => void,
        commitHash: string,
        fastForwardIfPossible: boolean = true,
        squash: boolean = false,
        noCommit: boolean = false,
        commitMessage?: string
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            this.validatePositional(commitHash, 'commit hash');
            log(`Merging commit ${commitHash.substring(0, 7)} into current branch`);
            const args = [gitExecutable.path, 'merge'];

            if (squash) {
                args.push('--squash');
            } else if (!fastForwardIfPossible) {
                args.push('--no-ff');
            }

            if (noCommit) {
                args.push('--no-commit');
            }

            if (commitMessage && !squash && !noCommit) {
                args.push('-m', commitMessage);
            }

            args.push(commitHash);

            await this.spawnGit(args, workspacePath);
            log(`Successfully merged commit ${commitHash.substring(0, 7)} into current branch`);
        } catch (error) {
            log(`Error merging commit into current branch: ${error}`);
            throw error;
        }
    }

    public async rebaseBranch(
        log: (message: string) => void,
        branchName: string,
        ignoreDate: boolean = false,
        autoStash: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        try {
            log(`Rebasing current branch onto ${branchName}`);
            const args = [gitExecutable.path, 'rebase'];

            if (ignoreDate) {
                args.push('--ignore-date');
            }

            if (autoStash) {
                args.push('--autostash');
            }

            args.push('--', branchName);

            await this.spawnGit(args, workspacePath);
            log(`Successfully rebased onto ${branchName}`);
        } catch (error) {
            log(`Error rebasing branch: ${error}`);
            throw error;
        }
    }

    public async rebaseBranchToCommit(
        log: (message: string) => void,
        commitHash: string,
        ignoreDate: boolean = false,
        autoStash: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            this.validatePositional(commitHash, 'commit hash');
            log(`Rebasing current branch onto commit ${commitHash.substring(0, 7)}`);
            const args = [gitExecutable.path, 'rebase'];

            if (ignoreDate) {
                args.push('--ignore-date');
            }

            if (autoStash) {
                args.push('--autostash');
            }

            args.push(commitHash);

            await this.spawnGit(args, workspacePath);
            log(`Successfully rebased current branch onto commit ${commitHash.substring(0, 7)}`);
        } catch (error) {
            log(`Error rebasing branch onto commit: ${error}`);
            throw error;
        }
    }

    private async gitDirEntryExists(gitDir: string, entry: string): Promise<boolean> {
        try {
            await fs.promises.access(path.join(gitDir, entry));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Whether the sequencer still holds queued cherry-picks. Its todo list is shared with revert,
     * which lists its commits as 'revert' rather than 'pick' and needs its own abort.
     */
    private async hasQueuedCherryPicks(gitDir: string): Promise<boolean> {
        try {
            const todo = await fs.promises.readFile(path.join(gitDir, 'sequencer', 'todo'), 'utf8');
            const firstCommand = todo
                .split(EOL_REGEX)
                .map((line) => line.trim())
                .find((line) => line && !line.startsWith('#'));

            return firstCommand?.startsWith('pick ') ?? false;
        } catch {
            return false;
        }
    }

    /**
     * The operation the working tree is halted in the middle of, if any. Git records these as
     * marker files in the per-worktree git dir, which is also how 'git status' reports them.
     */
    public async getOperationInProgress(log: (message: string) => void): Promise<GitOperationInProgress | null> {
        if (!this.tryGetRepoPath()) return null;

        try {
            const { gitDir } = await this.getGitDirs();

            // 'rebase-merge' covers interactive and merge-backend rebases, 'rebase-apply' the patch
            // backend — which 'git am' shares, and only 'git am --abort' can end that one
            if (await this.gitDirEntryExists(gitDir, 'rebase-merge')) return 'rebase';
            if (await this.gitDirEntryExists(gitDir, 'rebase-apply')) {
                const isApplyingPatches = await this.gitDirEntryExists(gitDir, 'rebase-apply/applying');
                return isApplyingPatches ? null : 'rebase';
            }

            if (await this.gitDirEntryExists(gitDir, 'CHERRY_PICK_HEAD')) return 'cherry-pick';

            // Committing a resolved pick by hand clears CHERRY_PICK_HEAD but leaves the rest of the
            // sequence queued, and git keeps reporting the cherry-pick as being in progress
            if (await this.hasQueuedCherryPicks(gitDir)) return 'cherry-pick';

            // Checked after the rebase markers: a rebase stopping on a conflicted merge commit
            // writes MERGE_HEAD too, and there 'git merge --abort' is not what ends the operation
            if (await this.gitDirEntryExists(gitDir, 'MERGE_HEAD')) return 'merge';

            return null;
        } catch (error) {
            log(`Error checking for an operation in progress: ${error}`);
            return null;
        }
    }

    public async abortOperation(log: (message: string) => void, operation: GitOperationInProgress): Promise<void> {
        if (!ABORTABLE_OPERATIONS.includes(operation)) throw new Error(`Cannot abort '${operation}'`);

        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            log(`Aborting the ${operation} in progress`);
            await this.spawnGit([gitExecutable.path, operation, '--abort'], workspacePath);
            log(`Successfully aborted the ${operation}`);
        } catch (error) {
            log(`Error aborting the ${operation}: ${error}`);
            throw error;
        }
    }

    /**
     * Git has no 'undo' command: what it has is the reflog, a per-ref record of every position a
     * ref has held. Undoing an action is therefore moving the branch back to the position it held
     * before that action, which is what this reads out of the reflog.
     */
    private static parseUndoActionKind(subject: string): GitUndoActionKind | null {
        if (subject.startsWith('commit (amend)')) return 'amend';
        if (subject.startsWith('commit (merge)')) return 'merge';
        if (subject.startsWith('commit (cherry-pick)')) return 'cherry-pick';
        if (subject.startsWith('commit')) return 'commit';
        if (subject.startsWith('revert')) return 'revert';
        if (subject.startsWith('merge')) return 'merge';
        if (subject.startsWith('rebase')) return 'rebase';
        if (subject.startsWith('pull --rebase')) return 'rebase';
        if (subject.startsWith('pull')) return 'pull';
        if (subject.startsWith('reset')) return 'reset';
        if (subject.startsWith('cherry-pick')) return 'cherry-pick';

        // The branch coming into existence: there is no earlier position to return it to, and
        // undoing it would mean deleting the branch rather than moving it
        if (subject.startsWith('branch:') || subject.startsWith('clone:') || subject.startsWith('checkout:')) {
            return null;
        }

        return 'other';
    }

    /**
     * Whether a position on a branch is already contained in that branch's upstream, and so has
     * already been published. A branch with no upstream, or whose upstream is missing locally, has
     * nothing to compare against and is never treated as published.
     */
    private async isPublished(
        workspacePath: string,
        gitPath: string,
        branch: string,
        hash: string
    ): Promise<boolean> {
        try {
            this.validateRefName(branch);
            this.validatePositional(hash, 'commit hash');

            // 'for-each-ref' answers with an empty line for a branch that has no upstream, where
            // 'rev-parse <branch>@{upstream}' would fail and be indistinguishable from a real error
            const upstreamOutput = await this.spawnGit(
                [gitPath, 'for-each-ref', '--format=%(upstream)', `refs/heads/${branch}`],
                workspacePath
            );

            const upstream = upstreamOutput
                .split(EOL_REGEX)
                .map((line) => line.trim())
                .find((line) => line.length > 0);
            if (!upstream) return false;

            // Commits reachable from the position but not from the upstream: none of them means the
            // upstream already holds everything up to it
            const countOutput = await this.spawnGit(
                [gitPath, 'rev-list', '--count', hash, '--not', upstream],
                workspacePath
            );

            return countOutput.trim() === '0';
        } catch {
            // No upstream is configured, or it no longer exists locally
            return false;
        }
    }

    /**
     * The last action that moved the current branch, if it is one that can be undone by moving the
     * branch back. Reads the branch's own reflog rather than HEAD's: HEAD also records checkouts,
     * where the entry before belongs to a different branch entirely, and resetting to it would move
     * the wrong branch to the wrong place.
     */
    public async getUndoableAction(log: (message: string) => void): Promise<GitUndoableAction | null> {
        if (!this.tryGetRepoPath()) return null;

        try {
            // A halted merge, rebase or cherry-pick ends by aborting it, not by moving the branch
            if (await this.getOperationInProgress(log)) return null;

            // A detached HEAD has no branch reflog to walk back through
            const branch = await this.getCurrentBranch(log);
            if (!branch) return null;
            this.validateRefName(branch);

            const workspacePath = this.getRepoPath();
            const gitExecutable = await this.findGitExecutable();

            const output = await this.spawnGit(
                [
                    gitExecutable.path,
                    'reflog',
                    'show',
                    `--format=%H${GIT_LOG_SEPARATOR}%gs`,
                    '-n',
                    '2',
                    `refs/heads/${branch}`
                ],
                workspacePath
            );

            const entries = output
                .split(EOL_REGEX)
                .filter((line) => line.trim())
                .map((line) => line.split(GIT_LOG_SEPARATOR));

            // Each reflog entry records the position the ref moved *to*, so the entry before the
            // current one holds the position to return to. Without it there is nothing to undo.
            const current = entries[0];
            const previous = entries[1];
            if (!current || !previous) return null;

            const currentHash = (current[0] ?? '').trim();
            const previousHash = (previous[0] ?? '').trim();
            const description = (current[1] ?? '').trim();
            if (!currentHash || !previousHash || !description) return null;
            if (currentHash === previousHash) return null;

            const kind = GitService.parseUndoActionKind(description);
            if (!kind) return null;

            // Undoing is a local reset, so undoing a position the remote already has leaves the
            // remote holding commits the branch no longer does, and reconciling them needs a force
            // push. By default that is not offered at all, rather than warned about. A pull is the
            // exception: undoing one only leaves the branch behind its upstream, which pulling
            // again restores.
            const guardPushed = !getConfig().undoAllowPushed && kind !== 'pull';
            if (guardPushed && (await this.isPublished(workspacePath, gitExecutable.path, branch, currentHash))) {
                log(`Not offering to undo '${description}': ${branch} is already pushed at ${currentHash}`);
                return null;
            }

            log(`Undoable action on ${branch}: ${description}`);
            return {
                kind,
                description,
                branch,
                currentHash,
                previousHash,
                changedWorkingTree: WORKING_TREE_UNDO_KINDS.includes(kind)
            };
        } catch (error) {
            log(`Error looking for an action to undo: ${error}`);
            return null;
        }
    }

    /**
     * Move the current branch back to where it was before its last action. 'previousHash' is the
     * position the caller was shown, and the undo is refused when it no longer matches, so an undo
     * prepared against a stale view of the repository cannot land somewhere unintended.
     */
    public async undoLastAction(
        log: (message: string) => void,
        previousHash: string,
        discardChanges: boolean
    ): Promise<GitUndoableAction> {
        const action = await this.getUndoableAction(log);
        if (!action) throw new Error('There is no action to undo');
        if (action.previousHash !== previousHash) {
            throw new Error('The repository changed since this undo was prepared, refresh and try again');
        }

        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // A soft reset moves the branch and nothing else, leaving what the undone action produced
        // in the working tree and index; a hard reset also returns the tree to how it was
        const mode: GitResetMode = discardChanges ? 'hard' : 'soft';

        try {
            this.validatePositional(action.previousHash, 'commit hash');
            log(`Undoing '${action.description}' on ${action.branch} (${mode} reset)`);
            await this.spawnGit([gitExecutable.path, 'reset', `--${mode}`, action.previousHash], workspacePath);
            log(`Successfully moved ${action.branch} back to ${action.previousHash.substring(0, 7)}`);
            return action;
        } catch (error) {
            log(`Error undoing the last action: ${error}`);
            throw error;
        }
    }

    private static readonly REWORD_CHAIN_LIMIT = 1000;

    /**
     * The commits whose message can be rewritten: the first-parent chain from HEAD, cut at the
     * first merge commit — rewording an older commit rebases everything between it and HEAD, and
     * that range must not cross a merge. HEAD itself is amended rather than rebased, so a merge
     * at HEAD is still rewordable. Each commit carries whether the upstream already has it, and
     * the caller decides whether published commits are offered.
     */
    public async getRewordableCommits(log: (message: string) => void): Promise<GitRewordableCommit[]> {
        if (!this.tryGetRepoPath()) return [];

        try {
            // Rewording rewrites the branch, which cannot start while an operation is halted mid-way
            if (await this.getOperationInProgress(log)) return [];

            // A detached HEAD has no branch to rewrite
            const branch = await this.getCurrentBranch(log);
            if (!branch) return [];
            this.validateRefName(branch);

            const workspacePath = this.getRepoPath();
            const gitExecutable = await this.findGitExecutable();

            const chainOutput = await this.spawnGit(
                [
                    gitExecutable.path,
                    '-c',
                    'log.showSignature=false',
                    'log',
                    '--first-parent',
                    `--format=%H${GIT_LOG_SEPARATOR}%P`,
                    '-n',
                    String(GitService.REWORD_CHAIN_LIMIT),
                    'HEAD',
                    '--'
                ],
                workspacePath
            );

            // The chain hashes the upstream does not have yet; everything else is published.
            // With no upstream (or one that no longer exists locally) nothing is published,
            // matching how isPublished treats it.
            let unpushed: Set<string> | null = null;
            try {
                const upstreamOutput = await this.spawnGit(
                    [gitExecutable.path, 'for-each-ref', '--format=%(upstream)', `refs/heads/${branch}`],
                    workspacePath
                );
                const upstream = upstreamOutput
                    .split(EOL_REGEX)
                    .map((line) => line.trim())
                    .find((line) => line.length > 0);

                if (upstream) {
                    const unpushedOutput = await this.spawnGit(
                        [
                            gitExecutable.path,
                            '-c',
                            'log.showSignature=false',
                            'log',
                            '--first-parent',
                            '--format=%H',
                            '-n',
                            String(GitService.REWORD_CHAIN_LIMIT),
                            'HEAD',
                            '--not',
                            upstream,
                            '--'
                        ],
                        workspacePath
                    );
                    unpushed = new Set(
                        unpushedOutput
                            .split(EOL_REGEX)
                            .map((line) => line.trim())
                            .filter(Boolean)
                    );
                }
            } catch {
                // The upstream is configured but missing locally — treat nothing as published
            }

            const commits: GitRewordableCommit[] = [];
            const lines = chainOutput.split(EOL_REGEX).filter((line) => line.trim());

            for (let i = 0; i < lines.length; i++) {
                const [hash, parents] = lines[i]!.split(GIT_LOG_SEPARATOR);
                const trimmedHash = hash?.trim();
                if (!trimmedHash) continue;

                const isMerge = (parents?.trim().split(' ').filter(Boolean).length ?? 0) > 1;
                // A merge below HEAD cannot be reworded, and neither can anything older: the
                // rebase from there to HEAD would cross the merge and flatten it
                if (isMerge && i > 0) break;

                commits.push({ hash: trimmedHash, published: unpushed ? !unpushed.has(trimmedHash) : false });

                // HEAD being a merge is amendable itself, but nothing older is reachable past it
                if (isMerge) break;
            }

            log(`Found ${commits.length} rewordable commit(s) on ${branch}`);
            return commits;
        } catch (error) {
            log(`Error getting rewordable commits: ${error}`);
            return [];
        }
    }

    /**
     * Rewrite a commit's message. HEAD is amended in place; an older commit is amended on a
     * detached HEAD and the branch's commits above it are rebased onto the amended copy. The
     * replayed commits carry the exact same trees, so that rebase cannot conflict.
     */
    public async rewordCommit(
        log: (message: string) => void,
        commitHash: string,
        message: string,
        autoStash: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        this.validatePositional(commitHash, 'commit hash');
        if (!message.trim()) throw new Error('The commit message cannot be empty');

        const operation = await this.getOperationInProgress(log);
        if (operation) throw new Error(`Cannot reword while a ${operation} is in progress`);

        // Re-derived rather than trusted from the caller, so a reword prepared against a stale
        // view of the repository cannot rewrite the wrong commits
        const rewordable = await this.getRewordableCommits(log);
        const index = rewordable.findIndex((commit) => commit.hash === commitHash);
        if (index === -1) {
            throw new Error(
                'This commit can no longer be reworded: it is not on the current branch, or the path from it to HEAD crosses a merge commit'
            );
        }

        if (rewordable[index]!.published && !getConfig().rewordAllowPushed) {
            throw new Error(
                'This commit is already pushed to the upstream. Enable git-go.reword.allowPushed to reword it anyway'
            );
        }

        try {
            if (index === 0) {
                // '--only' with no paths commits from the current HEAD tree, so staged changes
                // are not swept into the amend — only the message changes
                await this.spawnGit(
                    [gitExecutable.path, 'commit', '--amend', '--only', '-m', message],
                    workspacePath
                );
                log(`Successfully reworded HEAD (${commitHash.substring(0, 7)})`);
                return;
            }

            const branch = await this.getCurrentBranch(log);
            if (!branch) throw new Error('No branch is checked out');
            this.validateRefName(branch);

            // Changed tracked files would block the detach below; untracked files survive it
            const statusOutput = await this.spawnGit(
                [gitExecutable.path, 'status', '--porcelain', '--untracked-files=no'],
                workspacePath
            );
            let stashed = false;
            if (statusOutput.split(EOL_REGEX).some((line) => line.trim())) {
                if (!autoStash) {
                    throw new Error(
                        'The working tree has uncommitted changes. Stash them first, or reword with autostash'
                    );
                }
                await this.spawnGit(
                    [gitExecutable.path, 'stash', 'push', '--include-untracked', '-m', 'git-go: reword autostash'],
                    workspacePath
                );
                stashed = true;
            }

            try {
                await this.spawnGit([gitExecutable.path, 'checkout', '--detach', commitHash], workspacePath);
                await this.spawnGit(
                    [gitExecutable.path, 'commit', '--amend', '--only', '-m', message],
                    workspacePath
                );
                const rewordedHash = (
                    await this.spawnGit([gitExecutable.path, 'rev-parse', 'HEAD'], workspacePath)
                ).trim();
                await this.spawnGit(
                    [gitExecutable.path, 'rebase', '--onto', rewordedHash, commitHash, branch],
                    workspacePath
                );
                log(
                    `Successfully reworded commit ${commitHash.substring(0, 7)} and rewrote ${index} descendant commit(s) on ${branch}`
                );
            } catch (error) {
                // Put the repository back on the branch it started from before rethrowing
                try {
                    await this.spawnGit([gitExecutable.path, 'rebase', '--abort'], workspacePath);
                } catch {
                    // No rebase was in progress
                }
                try {
                    await this.spawnGit([gitExecutable.path, 'checkout', branch], workspacePath);
                } catch {
                    // Already on the branch
                }
                throw error;
            } finally {
                if (stashed) {
                    try {
                        await this.spawnGit([gitExecutable.path, 'stash', 'pop'], workspacePath);
                    } catch {
                        log('Could not restore the autostashed changes; they remain in the stash list');
                    }
                }
            }
        } catch (error) {
            log(`Error rewording commit: ${error}`);
            throw error;
        }
    }

    /**
     * Create a branch at the commit a stash was made from, check it out and apply the stash onto
     * it, dropping the stash on success — 'git stash branch'. The checkout and the apply both
     * need a working tree without uncommitted changes.
     */
    public async branchFromStash(
        log: (message: string) => void,
        stashSelector: string,
        branchName: string
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        this.validatePositional(stashSelector, 'stash selector');
        this.validateRefName(`refs/heads/${branchName}`);

        const operation = await this.getOperationInProgress(log);
        if (operation) throw new Error(`Cannot create a branch from a stash while a ${operation} is in progress`);

        const statusOutput = await this.spawnGit(
            [gitExecutable.path, 'status', '--porcelain', '--untracked-files=no'],
            workspacePath
        );
        if (statusOutput.split(EOL_REGEX).some((line) => line.trim())) {
            throw new Error(
                'The working tree has uncommitted changes. Commit or stash them before creating a branch from a stash'
            );
        }

        try {
            await this.spawnGit([gitExecutable.path, 'stash', 'branch', branchName, stashSelector], workspacePath);
            log(`Successfully created branch '${branchName}' from ${stashSelector} and dropped the stash`);
        } catch (error) {
            log(`Error creating branch from stash: ${error}`);
            throw error;
        }
    }

    public async getGitRemotes(log: (message: string) => void): Promise<GitRemote[]> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            log('Getting git remotes');
            const output = await this.spawnGit([gitExecutable.path, 'remote', '-v'], workspacePath);

            const remotes: GitRemote[] = [];
            const remoteMap = new Map<string, { fetchUrl?: string; pushUrl?: string }>();

            for (const line of output.split(EOL_REGEX)) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                const fetchMatch = trimmed.match(/^(\S+)\s+(\S+)\s+\(fetch\)$/);
                const pushMatch = trimmed.match(/^(\S+)\s+(\S+)\s+\(push\)$/);

                if (fetchMatch && fetchMatch[1] && fetchMatch[2]) {
                    const name = fetchMatch[1];
                    const url = fetchMatch[2];
                    if (!remoteMap.has(name)) {
                        remoteMap.set(name, {});
                    }
                    remoteMap.get(name)!.fetchUrl = url;
                } else if (pushMatch && pushMatch[1] && pushMatch[2]) {
                    const name = pushMatch[1];
                    const url = pushMatch[2];
                    if (!remoteMap.has(name)) {
                        remoteMap.set(name, {});
                    }
                    remoteMap.get(name)!.pushUrl = url;
                }
            }

            // Convert map to array of GitRemote objects
            for (const [name, urls] of remoteMap) {
                if (urls.fetchUrl && urls.pushUrl) {
                    remotes.push({
                        name,
                        fetchUrl: urls.fetchUrl,
                        pushUrl: urls.pushUrl
                    });
                }
            }

            log(`Found ${remotes.length} remotes`);
            return remotes;
        } catch (error) {
            log(`Error getting remotes: ${error}`);
            throw error;
        }
    }

    /**
     * The branch a remote's HEAD points at, which is the branch a pull request opens against.
     * Read from `refs/remotes/<remote>/HEAD`, which clone writes and `fetch --prune` keeps up to
     * date; null when the repository never learned it (a remote added by hand, for instance).
     * @param remote The name of the remote to ask about.
     * @returns The branch name without the remote prefix, or null when it is not recorded.
     */
    public async getRemoteDefaultBranch(log: (message: string) => void, remote: string): Promise<string | null> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            // Inside the try like the lookup itself: a remote named something git would not take
            // as a ref simply has no default branch to report, it is not an error to raise
            this.validateRefName(`refs/remotes/${remote}/HEAD`);

            const output = await this.spawnGit(
                [gitExecutable.path, 'symbolic-ref', '--quiet', `refs/remotes/${remote}/HEAD`],
                workspacePath
            );

            const ref = output.trim();
            const prefix = `refs/remotes/${remote}/`;
            if (!ref.startsWith(prefix)) return null;

            return ref.slice(prefix.length) || null;
        } catch (error) {
            log(`The default branch of '${remote}' is not recorded: ${error}`);
            return null;
        }
    }

    // Stash operations

    public async applyStash(
        log: (message: string) => void,
        stashSelector: string,
        reinstateIndex: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Basic validation for stash selector
        this.validatePositional(stashSelector, 'stash selector');

        try {
            const args = [gitExecutable.path, 'stash', 'apply'];
            if (reinstateIndex) args.push('--index');
            args.push('--', stashSelector);

            await this.spawnGit(args, workspacePath);
            log(`Successfully applied stash ${stashSelector}${reinstateIndex ? ' with index reinstatement' : ''}`);
        } catch (error) {
            log(`Error applying stash: ${error}`);
            throw error;
        }
    }

    public async popStash(
        log: (message: string) => void,
        stashSelector: string,
        reinstateIndex: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Basic validation for stash selector
        this.validatePositional(stashSelector, 'stash selector');

        try {
            const args = [gitExecutable.path, 'stash', 'pop'];
            if (reinstateIndex) args.push('--index');
            args.push('--', stashSelector);

            await this.spawnGit(args, workspacePath);
            log(`Successfully popped stash ${stashSelector}${reinstateIndex ? ' with index reinstatement' : ''}`);
        } catch (error) {
            log(`Error popping stash: ${error}`);
            throw error;
        }
    }

    public async dropStash(log: (message: string) => void, stashSelector: string): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Basic validation for stash selector
        this.validatePositional(stashSelector, 'stash selector');

        try {
            await this.spawnGit([gitExecutable.path, 'stash', 'drop', '--', stashSelector], workspacePath);
            log(`Successfully dropped stash ${stashSelector}`);
        } catch (error) {
            log(`Error dropping stash: ${error}`);
            throw error;
        }
    }

    public async createStash(
        log: (message: string) => void,
        message: string = '',
        includeUntracked: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            const args = [gitExecutable.path, 'stash', 'push'];
            if (includeUntracked) args.push('--include-untracked');
            if (message.trim()) args.push('-m', message);

            await this.spawnGit(args, workspacePath);
            log(
                `Successfully created stash${message ? ` with message: ${message}` : ''}${includeUntracked ? ' (including untracked files)' : ''}`
            );
        } catch (error) {
            log(`Error creating stash: ${error}`);
            throw error;
        }
    }

    // Remote branch operations

    public async deleteRemoteBranch(log: (message: string) => void, branchName: string, remote: string): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        // Validate remote name
        this.validatePositional(remote, 'remote name');

        try {
            await this.spawnGit([gitExecutable.path, 'push', '--delete', '--', remote, branchName], workspacePath);
            log(`Successfully deleted remote branch ${branchName} on ${remote}`);
        } catch (error) {
            log(`Error deleting remote branch: ${error}`);
            throw error;
        }
    }

    public async fetchIntoLocalBranchNeedsForce(
        log: (message: string) => void,
        remote: string,
        remoteBranch: string,
        localBranch: string
    ): Promise<boolean> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate remote name
        this.validatePositional(remote, 'remote name');

        // Validate both branch names
        this.validateRefName(`refs/remotes/${remote}/${remoteBranch}`);
        this.validateRefName(`refs/heads/${localBranch}`);

        try {
            const localBranchExists = await this.spawnGit(
                [gitExecutable.path, 'rev-parse', '--verify', '--quiet', `refs/heads/${localBranch}`],
                workspacePath
            )
                .then(() => true)
                .catch(() => false);

            if (!localBranchExists) {
                log(`Local branch ${localBranch} does not exist yet, no force needed`);
                return false;
            }

            // Update FETCH_HEAD so the comparison uses the current remote tip
            await this.spawnGit([gitExecutable.path, 'fetch', '--', remote, remoteBranch], workspacePath);

            const commitsOnlyInLocal = await this.spawnGit(
                [gitExecutable.path, 'rev-list', '--count', `refs/heads/${localBranch}`, '^FETCH_HEAD'],
                workspacePath
            );

            const needsForce = parseInt(commitsOnlyInLocal.trim(), 10) > 0;
            log(
                `Fetching ${remote}/${remoteBranch} into ${localBranch} ${needsForce ? 'needs force' : 'is a fast forward'}`
            );
            return needsForce;
        } catch (error) {
            log(`Error checking if fetch into local branch needs force: ${error}`);
            throw error;
        }
    }

    public async fetchIntoLocalBranch(
        log: (message: string) => void,
        remote: string,
        remoteBranch: string,
        localBranch: string,
        forceFetch: boolean = false,
        checkout: boolean = false
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate remote name
        this.validatePositional(remote, 'remote name');

        // Validate both branch names
        this.validateRefName(`refs/remotes/${remote}/${remoteBranch}`);
        this.validateRefName(`refs/heads/${localBranch}`);

        try {
            // Check if the target local branch is currently checked out
            const currentBranch = await this.getCurrentBranch(log);
            const isTargetBranchCheckedOut = currentBranch === localBranch;

            if (isTargetBranchCheckedOut) {
                // If the target branch is checked out, fetch first then reset (for force) or merge
                log(`Target branch ${localBranch} is currently checked out`);

                if (forceFetch) {
                    // For force update: fetch then reset --hard
                    await this.spawnGit([gitExecutable.path, 'fetch', '--', remote, remoteBranch], workspacePath);
                    await this.spawnGit(
                        [gitExecutable.path, 'reset', '--hard', `${remote}/${remoteBranch}`],
                        workspacePath
                    );
                    log(`Successfully force-updated current branch ${localBranch} from ${remote}/${remoteBranch}`);
                } else {
                    // For normal update: use git pull
                    await this.spawnGit([gitExecutable.path, 'pull', '--', remote, remoteBranch], workspacePath);
                    log(`Successfully pulled ${remote}/${remoteBranch} into current branch ${localBranch}`);
                }
            } else {
                // If the target branch is not checked out, use the normal fetch approach
                const args = [gitExecutable.path, 'fetch'];
                if (forceFetch) args.push('--force');
                args.push('--', remote, `${remoteBranch}:${localBranch}`);

                await this.spawnGit(args, workspacePath);
                log(
                    `Successfully fetched ${remote}/${remoteBranch} into local branch ${localBranch}${forceFetch ? ' (force)' : ''}`
                );

                if (checkout) {
                    await this.checkoutLocalBranch(log, localBranch);
                }
            }
        } catch (error) {
            log(`Error fetching into local branch: ${error}`);
            throw error;
        }
    }

    // Tag operations

    public async getTagDetails(
        log: (message: string) => void,
        tagName: string
    ): Promise<{
        hash: string;
        taggerName: string;
        taggerEmail: string;
        taggerDate: string;
        message: string;
    }> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name
        this.validateRefName(`refs/tags/${tagName}`);

        try {
            const output = await this.spawnGit(
                [
                    gitExecutable.path,
                    'for-each-ref',
                    '--format=%(objectname)|%(taggername)|%(taggeremail)|%(taggerdate:iso)|%(contents)',
                    '--',
                    `refs/tags/${tagName}`
                ],
                workspacePath
            );

            const [hash, taggerName, taggerEmail, taggerDate, ...messageParts] = output.trim().split('|');

            return {
                hash: hash?.trim() || '',
                taggerName: taggerName?.trim() || '',
                taggerEmail: taggerEmail?.trim() || '',
                taggerDate: taggerDate?.trim() || '',
                message: messageParts.join('|').trim()
            };
        } catch (error) {
            log(`Error getting tag details: ${error}`);
            throw error;
        }
    }

    public async pushTag(log: (message: string) => void, tagName: string, remotes: string[]): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name
        this.validateRefName(`refs/tags/${tagName}`);

        // Validate all remote names
        for (const remote of remotes) {
            this.validatePositional(remote, 'remote name');
        }

        try {
            for (const remote of remotes) {
                await this.spawnGit([gitExecutable.path, 'push', '--', remote, tagName], workspacePath);
                log(`Successfully pushed tag ${tagName} to ${remote}`);
            }
        } catch (error) {
            log(`Error pushing tag: ${error}`);
            throw error;
        }
    }

    public async deleteTag(
        log: (message: string) => void,
        tagName: string,
        deleteOnRemotes: string[] = [],
        deleteLocal: boolean = true
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name
        this.validateRefName(`refs/tags/${tagName}`);

        // Validate all remote names
        for (const remote of deleteOnRemotes) {
            this.validatePositional(remote, 'remote name');
        }

        try {
            if (deleteLocal) {
                await this.spawnGit([gitExecutable.path, 'tag', '-d', '--', tagName], workspacePath);
                log(`Successfully deleted local tag ${tagName}`);
            }

            for (const remote of deleteOnRemotes) {
                await this.spawnGit([gitExecutable.path, 'push', '--delete', '--', remote, tagName], workspacePath);
                log(`Successfully deleted tag ${tagName} from remote ${remote}`);
            }
        } catch (error) {
            log(`Error deleting tag: ${error}`);
            throw error;
        }
    }

    /**
     * Get the tags that exist on each remote. Git keeps no local record of remote tags
     * (there is no refs/remotes/<remote>/tags namespace), so this queries each remote
     * over the network with `git ls-remote`. Remotes that cannot be reached are omitted
     * from the result rather than failing the whole call.
     */
    public async getTagRemotes(log: (message: string) => void): Promise<GitTagRemoteStatus[]> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            const remoteOutput = await this.spawnGit([gitExecutable.path, 'remote'], workspacePath);
            const remoteNames = remoteOutput
                .split(EOL_REGEX)
                .map((name) => name.trim())
                .filter((name) => !!name);

            if (remoteNames.length === 0) return [];

            log(`Querying tags on ${remoteNames.length} remote(s): ${remoteNames.join(', ')}`);

            const results = await Promise.allSettled(
                remoteNames.map(async (remote): Promise<GitTagRemoteStatus> => {
                    this.validatePositional(remote, 'remote name');

                    const output = await this.spawnGit(
                        [gitExecutable.path, 'ls-remote', '--tags', '--', remote],
                        workspacePath,
                        GitService.LS_REMOTE_TIMEOUT_MS
                    );

                    // Annotated tags appear twice: refs/tags/x (tag object) and the
                    // peeled refs/tags/x^{} (the commit) — prefer the peeled hash
                    const tagHashes = new Map<string, { direct?: string; peeled?: string }>();
                    for (const line of output.split(EOL_REGEX)) {
                        const [hash, ref] = line.trim().split('\t');
                        if (!hash || !ref || !ref.startsWith('refs/tags/')) continue;

                        if (ref.endsWith('^{}')) {
                            const name = ref.slice('refs/tags/'.length, -'^{}'.length);
                            tagHashes.set(name, { ...tagHashes.get(name), peeled: hash });
                        } else {
                            const name = ref.slice('refs/tags/'.length);
                            tagHashes.set(name, { ...tagHashes.get(name), direct: hash });
                        }
                    }

                    const tags: GitRemoteTag[] = [];
                    for (const [name, { direct, peeled }] of tagHashes) {
                        const hash = peeled ?? direct;
                        if (hash) tags.push({ name, hash });
                    }

                    return { remote, tags };
                })
            );

            const statuses: GitTagRemoteStatus[] = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') statuses.push(result.value);
                else log(`Could not list tags on remote '${remoteNames[index]}': ${result.reason}`);
            });

            log(`Retrieved tags from ${statuses.length}/${remoteNames.length} remote(s)`);
            return statuses;
        } catch (error) {
            log(`Error getting remote tags: ${error}`);
            throw error;
        }
    }

    // Uncommitted changes operations

    public async stashUncommittedChanges(
        log: (message: string) => void,
        message: string = '',
        includeUntracked: boolean = false
    ): Promise<void> {
        return this.createStash(log, message, includeUntracked);
    }

    public async resetUncommittedChanges(
        log: (message: string) => void,
        mode: 'mixed' | 'hard' = 'mixed',
        cleanUntrackedFiles: boolean = true,
        cleanDirectories: boolean = true
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            // First reset the uncommitted changes
            const modeFlag = mode === 'hard' ? '--hard' : '--mixed';
            await this.spawnGit([gitExecutable.path, 'reset', modeFlag, 'HEAD'], workspacePath);
            log(`Successfully reset uncommitted changes (${mode} mode)`);

            // Clean untracked files if requested
            if (cleanUntrackedFiles) {
                await this.cleanUntrackedFiles(log, cleanDirectories);
            }
        } catch (error) {
            log(`Error resetting uncommitted changes: ${error}`);
            throw error;
        }
    }

    public async resetBranchToCommit(
        log: (message: string) => void,
        commitHash: string,
        mode: GitResetMode = 'mixed'
    ): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            this.validatePositional(commitHash, 'commit hash');
            await this.spawnGit([gitExecutable.path, 'reset', `--${mode}`, commitHash], workspacePath);
            log(`Successfully reset current branch to commit ${commitHash.substring(0, 7)} (${mode} mode)`);
        } catch (error) {
            log(`Error resetting branch to commit: ${error}`);
            throw error;
        }
    }

    public async cleanUntrackedFiles(log: (message: string) => void, directories: boolean = false): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        try {
            const args = [gitExecutable.path, 'clean', '-f'];
            if (directories) args.push('-d');

            await this.spawnGit(args, workspacePath);
            log(`Successfully cleaned untracked files${directories ? ' and directories' : ''}`);
        } catch (error) {
            log(`Error cleaning untracked files: ${error}`);
            throw error;
        }
    }

    public clearCache(): void {
        this.cachedGitExecutable = null;
    }

    // Repository operations
    public async getRepoName(): Promise<string> {
        const workspacePath = this.getRepoPath();

        // Use the directory name as repository name
        const dirName = path.basename(workspacePath);
        return dirName || 'Unknown Repository';
    }

    // Git user configuration operations
    public async getGitUserConfig(): Promise<{ userName: string; userEmail: string; isLocal: boolean }> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        let userName = '';
        let userEmail = '';
        let isLocal = false;

        try {
            // Try to get local config first
            try {
                userName = (
                    await this.spawnGit([gitExecutable.path, 'config', '--local', 'user.name'], workspacePath)
                ).trim();
                userEmail = (
                    await this.spawnGit([gitExecutable.path, 'config', '--local', 'user.email'], workspacePath)
                ).trim();
                isLocal = true;
            } catch {
                // If local config doesn't exist, get global config
                try {
                    userName = (
                        await this.spawnGit([gitExecutable.path, 'config', '--global', 'user.name'], workspacePath)
                    ).trim();
                    userEmail = (
                        await this.spawnGit([gitExecutable.path, 'config', '--global', 'user.email'], workspacePath)
                    ).trim();
                    isLocal = false;
                } catch {
                    // Neither local nor global config exists
                    userName = '';
                    userEmail = '';
                    isLocal = false;
                }
            }
        } catch (error) {
            throw new Error(`Failed to get git user config: ${error}`);
        }

        return { userName, userEmail, isLocal };
    }

    public async setGitUserConfig(config: { userName?: string; userEmail?: string; isLocal: boolean }): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        if (!config.isLocal) {
            // Reset to use global settings by removing local config
            try {
                await this.spawnGit([gitExecutable.path, 'config', '--local', '--unset', 'user.name'], workspacePath);
            } catch {
                // Config might not exist, ignore error
            }
            try {
                await this.spawnGit([gitExecutable.path, 'config', '--local', '--unset', 'user.email'], workspacePath);
            } catch {
                // Config might not exist, ignore error
            }
        } else {
            // Set local config
            if (config.userName !== undefined) {
                await this.spawnGit(
                    [gitExecutable.path, 'config', '--local', 'user.name', config.userName],
                    workspacePath
                );
            }
            if (config.userEmail !== undefined) {
                await this.spawnGit(
                    [gitExecutable.path, 'config', '--local', 'user.email', config.userEmail],
                    workspacePath
                );
            }
        }
    }

    // Additional git remotes operations
    public async addGitRemote(remote: { name: string; fetchUrl: string; pushUrl: string }): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate remote name
        this.validatePositional(remote.name, 'remote name');

        try {
            // Add the remote with fetch URL
            await this.spawnGit(
                [gitExecutable.path, 'remote', 'add', '--', remote.name, remote.fetchUrl],
                workspacePath
            );

            // Set push URL if different from fetch URL
            if (remote.pushUrl && remote.pushUrl !== remote.fetchUrl) {
                await this.spawnGit(
                    [gitExecutable.path, 'remote', 'set-url', '--push', '--', remote.name, remote.pushUrl],
                    workspacePath
                );
            }

            await this.spawnGit([gitExecutable.path, 'fetch', '--', remote.name], workspacePath);
        } catch (error) {
            throw new Error(`Failed to add remote: ${error}`);
        }
    }

    public async removeGitRemote(remoteName: string): Promise<void> {
        const workspacePath = this.getRepoPath();
        const gitExecutable = await this.findGitExecutable();

        // Validate remote name
        this.validatePositional(remoteName, 'remote name');

        try {
            await this.spawnGit([gitExecutable.path, 'remote', 'remove', '--', remoteName], workspacePath);
        } catch (error) {
            throw new Error(`Failed to remove remote: ${error}`);
        }
    }
}
