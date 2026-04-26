import * as cp from 'child_process';
import * as vscode from 'vscode';

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
}

const GIT_LOG_SEPARATOR = 'XX7Nal-YARtTpjCikii9nJxER19D6diSyk-AWkPb';
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

    /**
     * Find and validate a Git executable
     */
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

    /**
     * Spawn a git process and return stdout as string
     */
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
                    reject(new Error(`Git command failed with exit code ${code}: ${stderr || stdout}`));
                }
            });

            gitProcess.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    /**
     * Sanitize branch name by removing refs and remote prefixes
     */
    private sanitizeBranchName(branchName: string, isRemote: boolean): string {
        let cleanName = branchName;
        cleanName = cleanName.replace(/^refs\/(heads|remotes)\//, '');
        if (isRemote) cleanName = cleanName.replace(/^[^/]+\//, '');

        return cleanName;
    }

    /**
     * Check if the current workspace is a git repository
     */
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

    /**
     * Get all git branches from the current workspace
     */
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
            throw new Error(`Failed to get git branches: ${error}`);
        }
    }

    /**
     * Returns a map of stash commit hash → stash ref name (e.g. "stash@{0}").
     * Single git call replaces both getStashHashes and getAllStashRefs.
     */
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
     * Fetch stash commits individually, returning only the top-level stash
     * commit with parents stripped to first-only (the HEAD commit at stash time).
     */
    private async getStashCommits(
        workspacePath: string,
        gitPath: string,
        stashMap: Map<string, string>
    ): Promise<GitCommit[]> {
        const format = ['%H', '%P', '%an', '%ae', '%ai', '%s'].join(GIT_LOG_SEPARATOR);
        const stashes: GitCommit[] = [];

        for (const [hash, ref] of stashMap) {
            try {
                const output = await this.spawnGit(
                    [gitPath, 'log', '-1', `--pretty=format:${format}`, hash],
                    workspacePath
                );
                const parts = output.trim().split(GIT_LOG_SEPARATOR);
                if (parts.length < 6) continue;
                const [, parentHashes, author, email, date, message] = parts;

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
            } catch {
                // Skip this stash
            }
        }

        return stashes;
    }

    /**
     * Get git commits with branch filtering, pagination, and stashes included
     * inline positioned directly before their parent commit.
     */
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
                `--max-count=${maxCount + 1}`,
                `--skip=${skip}`,
                `--pretty=format:${format}`,
                '--date-order',
                '--decorate=full'
            ];

            if (branches && branches.length > 0) {
                gitArgs.push(...branches);
                gitArgs.push('HEAD');
                log(`Filtering commits for branches: ${branches.join(', ')}`);
            } else {
                gitArgs.push('--branches', '--tags', '--remotes', 'HEAD');
                log('Showing commits from all branches');
            }

            gitArgs.push('--');

            const gitLog = await this.spawnGit(gitArgs, workspacePath);

            let lines = gitLog.split(EOL_REGEX).filter((line: string) => line.trim());

            let hasMore = false;
            if (lines.length > maxCount) {
                hasMore = true;
                lines = lines.slice(0, maxCount);
            }

            const commits: GitCommit[] = [];

            for (const line of lines) {
                if (!line.includes(GIT_LOG_SEPARATOR)) continue;

                const parts = line.split(GIT_LOG_SEPARATOR);
                if (parts.length < 6) {
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
            throw new Error(`Failed to get git commits: ${error}`);
        }
    }

    /**
     * Get the list of files changed in a specific commit.
     * Uses git diff-tree for regular commits and git diff for root commits.
     */
    public async getCommitFiles(log: (message: string) => void, commitHash: string): Promise<GitFileChange[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) throw new Error('No workspace folder found');

        const workspacePath = workspaceFolder.uri.fsPath;
        const gitExecutable = await this.findGitExecutable();

        try {
            // Get status (A/M/D/R/C/T) and paths
            const statusOutput = await this.spawnGit(
                [gitExecutable.path, 'diff-tree', '--no-commit-id', '--name-status', '-r', '-M', '--root', commitHash],
                workspacePath
            );

            // Get line stats (additions/deletions)
            const numstatOutput = await this.spawnGit(
                [gitExecutable.path, 'diff-tree', '--no-commit-id', '--numstat', '-r', '-M', '--root', commitHash],
                workspacePath
            );

            // Parse numstat into a map: path → { additions, deletions }
            const statsMap = new Map<string, { additions: number; deletions: number }>();
            for (const line of numstatOutput.split(EOL_REGEX).filter((l) => l.trim())) {
                const parts = line.split('\t');
                if (parts.length < 3) continue;
                const additions = parts[0] === '-' ? 0 : parseInt(parts[0]!, 10);
                const deletions = parts[1] === '-' ? 0 : parseInt(parts[1]!, 10);
                // For renames: numstat shows "oldPath => newPath" or just the new path
                const path = parts[parts.length - 1]!.trim();
                statsMap.set(path, { additions, deletions });
            }

            // Parse status and merge with stats
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
            throw new Error(`Failed to get commit files: ${error}`);
        }
    }

    public clearCache(): void {
        this.cachedGitExecutable = null;
    }
}
