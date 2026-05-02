import * as cp from 'child_process';
import * as vscode from 'vscode';
import { formatGitError } from './util/formatGitError';

export interface GitCommit {
    hash: string;
    parents: string[];
    author: string;
    email: string;
    date: string;
    message: string;
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

export interface GitTagDetails {
    hash: string;
    taggerName: string;
    taggerEmail: string;
    taggerDate: string;
    message: string;
}

export type GitPushMode = 'normal' | 'force-with-lease' | 'force';

export type GitResetMode = 'mixed' | 'hard';

// Use ASCII character 0x1E (Record Separator) for field separation
const GIT_LOG_SEPARATOR = '\x1E';
const EOL_REGEX = /\r\n|\r|\n/g;

export class GitService {
    private static instance: GitService;
    private cachedGitExecutable: GitExecutable | null = null;

    private constructor() {}

    public static getInstance(): GitService {
        if (!GitService.instance) {
            GitService.instance = new GitService();
        }
        return GitService.instance;
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

    private spawnGit(args: string[], cwd: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!args.length || !args[0]) {
                reject(new Error('No command provided'));
                return;
            }

            const gitProcess = cp.spawn(args[0], args.slice(1), {
                cwd: cwd,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            gitProcess.stdout?.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            gitProcess.stderr?.on('data', (data: Buffer) => {
                stderr += data.toString();
            });

            gitProcess.on('close', (code: number | null) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(formatGitError(stderr || stdout)));
                }
            });

            gitProcess.on('error', (error: Error) => {
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return false;

        try {
            await this.spawnGit(['git', 'rev-parse', '--git-dir'], workspaceFolder.uri.fsPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    public async getGitBranches(log: (message: string) => void): Promise<GitBranch[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        log(`Getting git branches from: ${workspacePath}`);

        if (!(await this.isGitRepository())) throw new Error('Not a git repository');

        try {
            const gitExecutable = await this.findGitExecutable();
            log(`Using git executable: ${gitExecutable.path}`);

            const branchOutput = await this.spawnGit(
                [gitExecutable.path, 'branch', '-a', '--format=%(refname),%(HEAD),%(objectname)'],
                workspacePath
            );

            const branches: GitBranch[] = [];
            const lines = branchOutput.split(EOL_REGEX).filter((line: string) => line.trim());

            for (const line of lines) {
                const [name, isHead, hash] = line.split(',');
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
                        remoteName
                    });
                }
            }

            log(`Found ${branches.length} branches`);
            return branches;
        } catch (error) {
            log(`Error getting git branches: ${error}`);
            throw error;
        }
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return null;

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
                '%s', // Subject
                '%D' // Refs
            ].join(GIT_LOG_SEPARATOR);

            log(`Executing git log command (maxCount: ${maxCount}, skip: ${skip})`);

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

            if (branches && branches.length > 0) {
                const existingBranches = await this.filterToExistingRefs(workspacePath, gitExecutable.path, branches);

                if (existingBranches.length > 0) {
                    gitArgs.push(...existingBranches);
                    log(`Filtering commits for branches: ${existingBranches.join(', ')}`);
                } else {
                    log('No valid branches found, showing all');
                    gitArgs.push('--branches', '--tags', '--remotes', 'HEAD');
                }
            } else {
                gitArgs.push('--branches', '--tags', '--remotes', 'HEAD');
                log('Showing commits from all branches');
            }

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
                if (parts.length < 7) {
                    // We expect exactly 7 parts: hash, parents, author, email, date, message, refs
                    log(`Skipping malformed line: ${line}`);
                    continue;
                }

                const [hash, parentHashes, author, email, date, message, refs] = parts;

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
                    tags,
                    isStash: false,
                    refs: commitRefs,
                    isHead
                });
            }

            const stashMap = await this.getStashInfo(workspacePath, gitExecutable.path);
            log(`Found ${stashMap.size} stash(es)`);

            if (stashMap.size > 0) {
                const stashCommits = await this.getStashCommits(workspacePath, gitExecutable.path, stashMap);
                for (const stash of stashCommits) {
                    const parentIdx = commits.findIndex((c) => c.hash === stash.parents[0]);

                    if (parentIdx !== -1) commits.splice(parentIdx, 0, stash);
                }
            }

            log(`Parsed ${commits.length} commits (hasMore: ${hasMore})`);
            return { commits, hasMore };
        } catch (error) {
            log(`Error getting git commits: ${error}`);
            throw error;
        }
    }

    public async getCommitFiles(
        log: (message: string) => void,
        commitHash: string,
        isStash: boolean = false
    ): Promise<GitFileChange[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    public async checkoutRemoteBranch(
        log: (message: string) => void,
        remoteBranchName: string,
        localBranchName: string
    ): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    /**
     * Get the content of a file at a specific Git revision using git show.
     * This works with any commit hash including stash commits.
     * @param commitHash The commit hash to get the file from
     * @param filePath The path to the file relative to the repository root
     * @returns The file content as a string
     */
    public async getCommitFile(commitHash: string, filePath: string): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        try {
            const output = await this.spawnGit(
                [gitExecutable.path, 'show', `${commitHash}:${filePath}`],
                workspacePath
            );
            return output;
        } catch (error) {
            throw error;
        }
    }

    public async getCurrentBranch(log: (message: string) => void): Promise<string | null> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return null;

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        try {
            const currentBranch = await this.spawnGit(
                [gitExecutable.path, 'rev-parse', '--abbrev-ref', 'HEAD'],
                workspacePath
            );

            const branchName = currentBranch.trim();
            // If HEAD is detached, git returns 'HEAD' instead of a branch name
            if (branchName === 'HEAD') {
                log('Repository is in detached HEAD state');
                return null;
            }

            log(`Current branch: ${branchName}`);
            return branchName;
        } catch (error) {
            log(`Error getting current branch: ${error}`);
            return null;
        }
    }

    public async fetch(log: (message: string) => void): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        try {
            log('Fetching from remote repositories...');
            await this.spawnGit([gitExecutable.path, 'fetch', '--all'], workspacePath);
            log('Successfully fetched from remotes');
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        noCommit: boolean = false
    ): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

            args.push('--', branchName);

            await this.spawnGit(args, workspacePath);
            log(`Successfully merged branch ${branchName}`);
        } catch (error) {
            log(`Error merging branch: ${error}`);
            throw error;
        }
    }

    public async rebaseBranch(
        log: (message: string) => void,
        branchName: string,
        ignoreDate: boolean = false
    ): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        // Validate branch name
        this.validateRefName(`refs/heads/${branchName}`);

        try {
            log(`Rebasing current branch onto ${branchName}`);
            const args = [gitExecutable.path, 'rebase'];

            if (ignoreDate) {
                args.push('--ignore-date');
            }

            args.push('--', branchName);

            await this.spawnGit(args, workspacePath);
            log(`Successfully rebased onto ${branchName}`);
        } catch (error) {
            log(`Error rebasing branch: ${error}`);
            throw error;
        }
    }

    public async getGitRemotes(log: (message: string) => void): Promise<GitRemote[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    // Stash operations

    public async applyStash(
        log: (message: string) => void,
        stashSelector: string,
        reinstateIndex: boolean = false
    ): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    public async fetchIntoLocalBranch(
        log: (message: string) => void,
        remote: string,
        remoteBranch: string,
        localBranch: string,
        forceFetch: boolean = false
    ): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    public async deleteTag(log: (message: string) => void, tagName: string, deleteOnRemote?: string): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        // Validate tag name
        this.validateRefName(`refs/tags/${tagName}`);

        // Validate remote name if provided
        if (deleteOnRemote) {
            this.validatePositional(deleteOnRemote, 'remote name');
        }

        try {
            // Delete local tag
            await this.spawnGit([gitExecutable.path, 'tag', '-d', '--', tagName], workspacePath);
            log(`Successfully deleted local tag ${tagName}`);

            // Delete remote tag if specified
            if (deleteOnRemote) {
                await this.spawnGit(
                    [gitExecutable.path, 'push', '--delete', '--', deleteOnRemote, tagName],
                    workspacePath
                );
                log(`Successfully deleted tag ${tagName} from remote ${deleteOnRemote}`);
            }
        } catch (error) {
            log(`Error deleting tag: ${error}`);
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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

    public async cleanUntrackedFiles(log: (message: string) => void, directories: boolean = false): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;

        // Use the directory name as repository name
        const path = require('path');
        const dirName = path.basename(workspacePath);
        return dirName || 'Unknown Repository';
    }

    // Git user configuration operations
    public async getGitUserConfig(): Promise<{ userName: string; userEmail: string; isLocal: boolean }> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
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
