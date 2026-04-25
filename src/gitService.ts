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
}

export interface GitBranch {
    name: string;
    cleanName: string;
    hash: string;
    current: boolean;
    remote: boolean;
}

export interface GitExecutable {
    path: string;
    version: string;
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
    private sanitizeBranchName(branchName: string): string {
        let cleanName = branchName;
        cleanName = cleanName.replace(/^refs\/(heads|remotes)\//, '');
        cleanName = cleanName.replace(/^[^/]+\//, '');
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
                [gitExecutable.path, 'branch', '-a', '--format=%(refname:short),%(HEAD),%(objectname)'],
                workspacePath
            );

            const branches: GitBranch[] = [];
            const lines = branchOutput.split(EOL_REGEX).filter((line: string) => line.trim());

            for (const line of lines) {
                const [name, isHead, hash] = line.split(',');
                if (name && name.trim() && hash && hash.trim()) {
                    const branchName = name.trim();
                    if (branchName === 'origin' || branchName === 'upstream') continue;

                    branches.push({
                        name: branchName,
                        cleanName: this.sanitizeBranchName(branchName),
                        hash: hash.trim(),
                        current: isHead?.trim() === '*',
                        remote: branchName.includes('/')
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
     * Only top-level stash commits are included (not their index/untracked parents).
     */
    private async getStashHashes(workspacePath: string, gitPath: string): Promise<Map<string, string>> {
        const stashMap = new Map<string, string>();

        try {
            const output = await this.spawnGit(
                [gitPath, 'reflog', '--format=%H|%gd', 'refs/stash', '--'],
                workspacePath
            );

            const lines = output.split(EOL_REGEX).filter((l) => l.trim());
            for (const line of lines) {
                const [hash, ref] = line.split('|');
                if (hash?.trim() && ref?.trim()) {
                    stashMap.set(hash.trim(), ref.trim());
                }
            }
        } catch {
            // No stashes — refs/stash doesn't exist
        }

        return stashMap;
    }

    /**
     * Returns all stash commit hashes to pass as explicit refs to git log,
     * ensuring every stash appears in the log output regardless of reachability.
     */
    private async getAllStashRefs(workspacePath: string, gitPath: string): Promise<string[]> {
        try {
            const output = await this.spawnGit([gitPath, 'stash', 'list', '--format=%H'], workspacePath);
            return output
                .split(EOL_REGEX)
                .filter((l) => l.trim())
                .map((l) => l.trim());
        } catch {
            return [];
        }
    }

    /**
     * Reorders commits so each stash sits directly before its parent commit
     * (the commit it was stashed on top of), regardless of timestamp ordering.
     *
     * A stash's first parent is always the commit it was created on.
     * Stashes whose parent isn't in the current page are appended at the end.
     */
    private reorderStashes(log: (message: string) => void, commits: GitCommit[]): GitCommit[] {
        try {
            const stashes: GitCommit[] = commits.filter((c) => c.isStash);
            const regular: GitCommit[] = commits.filter((c) => !c.isStash);

            if (stashes.length === 0) return commits;

            // Build hash → index lookup for regular commits
            const regularIndexByHash = new Map<string, number>();
            for (let i = 0; i < regular.length; i++) {
                regularIndexByHash.set(regular[i]!.hash, i);
            }

            // Map each stash to its insertion index (just before its first parent)
            const insertions: Array<{ atIndex: number; stash: GitCommit }> = stashes.map((stash) => {
                const parentHash = stash.parents[0];
                const atIndex = parentHash ? (regularIndexByHash.get(parentHash) ?? regular.length) : regular.length;
                return { atIndex, stash };
            });

            // Sort by insertion index; stashes targeting the same parent keep
            // their original order (stash@{0} before stash@{1} = newer first)
            insertions.sort((a, b) => a.atIndex - b.atIndex);

            // Interleave stashes into the regular commits array
            const result: GitCommit[] = [];
            let cursor = 0;

            for (const { atIndex, stash } of insertions) {
                while (cursor < atIndex) {
                    result.push(regular[cursor]!);
                    cursor++;
                }
                result.push(stash);
            }

            while (cursor < regular.length) {
                result.push(regular[cursor]!);
                cursor++;
            }

            return result;
        } catch (error) {
            log(`Error reordering stashes: ${error}`);
            // In case of any unexpected issues, return the original order
            return commits;
        }
    }

    /**
     * Get git commits from the current workspace with branch filtering, pagination,
     * and stashes included inline positioned directly before their parent commit.
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

            const stashMap = await this.getStashHashes(workspacePath, gitExecutable.path);
            log(`Stash map: ${JSON.stringify([...stashMap.entries()])}`);

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

            const stashRefs = await this.getAllStashRefs(workspacePath, gitExecutable.path);
            if (stashRefs.length > 0) {
                gitArgs.push(...stashRefs);
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
                const stashRef = stashMap.get(trimmedHash);

                const tags =
                    !stashRef && refs?.trim()
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
                if (stashRef) {
                    commitRefs = stashRef;
                } else if (refs?.trim()) {
                    const cleaned = refs
                        .split(',')
                        .map((r) => r.trim())
                        .filter((r) => r !== 'refs/stash' && r !== 'stash')
                        .join(', ');
                    commitRefs = cleaned || undefined;
                }

                commits.push({
                    hash: trimmedHash,
                    parents: parentHashes?.trim() ? parentHashes.trim().split(' ') : [],
                    author: author?.trim() || '',
                    email: email?.trim() || '',
                    date: date?.trim() || '',
                    message: message?.trim() || '',
                    tags,
                    isStash: !!stashRef,
                    refs: commitRefs
                });
            }

            const reordered = this.reorderStashes(log, commits);

            log(`Parsed ${reordered.length} commits (hasMore: ${hasMore})`);
            return { commits: reordered, hasMore };
        } catch (error) {
            log(`Error getting git commits: ${error}`);
            throw new Error(`Failed to get git commits: ${error}`);
        }
    }

    public clearCache(): void {
        this.cachedGitExecutable = null;
    }
}
