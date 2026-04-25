import * as cp from 'child_process';
import * as vscode from 'vscode';

export interface GitCommit {
    hash: string;
    parents: string[];
    graph: string;
    author: string;
    email: string;
    date: string;
    message: string;
    refs?: string;
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
        // Return cached executable if available
        if (this.cachedGitExecutable) {
            return this.cachedGitExecutable;
        }

        // Try to use git from VS Code's configuration first
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
            // Fallback to system git if configured path fails
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

        // Remove refs prefixes
        cleanName = cleanName.replace(/^refs\/(heads|remotes)\//, '');

        // Remove remote name prefix (origin/, upstream/, etc.)
        cleanName = cleanName.replace(/^[^/]+\//, '');

        return cleanName;
    }

    /**
     * Check if the current workspace is a git repository
     */
    public async isGitRepository(): Promise<boolean> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return false;
        }

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
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        log(`Getting git branches from: ${workspacePath}`);

        // Check if it's a git repository
        if (!(await this.isGitRepository())) {
            throw new Error('Not a git repository');
        }

        try {
            const gitExecutable = await this.findGitExecutable();
            log(`Using git executable: ${gitExecutable.path}`);

            // Get all branches with their commit hashes
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

                    // Skip the bare remote name (e.g., "origin" without a branch)
                    if (branchName === 'origin' || branchName === 'upstream') {
                        continue;
                    }

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
     * Get git stashes filtered by branch reachability
     */
    public async getGitStashes(log: (message: string) => void, branches?: string[]): Promise<GitCommit[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;

        try {
            const gitExecutable = await this.findGitExecutable();

            const gitArgs = [gitExecutable.path, 'reflog', '--format=%gd|%H|%P|%gD|%an|%ae|%ai|%s', 'refs/stash'];

            gitArgs.push('--');

            const stashList = await this.spawnGit(gitArgs, workspacePath);
            const stashes: GitCommit[] = [];

            if (!stashList.trim()) {
                log('No stashes found');
                return stashes;
            }

            const lines = stashList.split(EOL_REGEX).filter((line) => line.trim());

            // Parse all stashes first (common logic)
            for (const line of lines) {
                const parts = line.split('|');
                if (parts.length < 8) continue;

                const [stashRef, hash, parentHashes, stashDesc, author, email, date, message] = parts;
                if (!stashRef || !hash || !author || !email || !date || !message) continue;

                const indexMatch = stashRef.match(/stash@\{(\d+)\}/) || null;
                const index = indexMatch && indexMatch[1] ? parseInt(indexMatch[1], 10) : 0;

                // Parse parent hashes directly from reflog output
                const parents = parentHashes?.trim() ? parentHashes.trim().split(' ') : [];

                const stashCommit: GitCommit = {
                    hash,
                    parents,
                    author,
                    email,
                    date,
                    message: message,
                    graph: '* ',
                    refs: `Stash ${index}`,
                    isStash: true
                };

                stashes.push(stashCommit);
            }

            // If no branch filtering needed, return all stashes
            if (!branches || branches.length === 0) {
                log(`Found ${stashes.length} stashes (no branch filtering)`);
                return stashes;
            }

            // Filter by branch ancestry
            const filteredStashes: GitCommit[] = [];
            for (const stash of stashes) {
                try {
                    // Get the base hash (first parent of stash commit)
                    const baseHash = (
                        await this.spawnGit([gitExecutable.path, 'rev-parse', `${stash.hash}^1`], workspacePath)
                    ).trim();

                    // Check if base hash is reachable from any selected branch
                    await this.spawnGit(
                        [gitExecutable.path, 'merge-base', '--is-ancestor', baseHash, ...branches],
                        workspacePath
                    );

                    filteredStashes.push(stash);
                } catch (error) {
                    // Skip stashes that aren't reachable from selected branches
                    continue;
                }
            }

            log(`Found ${filteredStashes.length} stashes (branch ancestry filtered)`);
            return filteredStashes;
        } catch (error) {
            log(`Error getting git stashes: ${error}`);
            throw new Error(`Failed to get git stashes: ${error}`);
        }
    }

    /**
     * Get git commits from the current workspace with branch filtering and pagination
     */
    public async getGitCommits(
        log: (message: string) => void,
        branches?: string[],
        maxCount: number = 100,
        skip: number = 0
    ): Promise<{ commits: GitCommit[]; hasMore: boolean; total?: number }> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        log(`Getting git commits from: ${workspacePath}`);

        // Check if it's a git repository
        if (!(await this.isGitRepository())) {
            throw new Error('Not a git repository');
        }
        log('Confirmed git repository');

        try {
            const gitExecutable = await this.findGitExecutable();
            log(`Using git executable: ${gitExecutable.path} (version: ${gitExecutable.version})`);

            // Use format similar to vscode-git-graph with separator
            const format = [
                '%H', // Hash
                '%P', // Parent hashes (space-separated)
                '%an', // Author name
                '%ae', // Author email
                '%ai', // Author date (ISO format)
                '%s', // Subject
                '%D' // Refs (only shows for branch tips and tags)
            ].join(GIT_LOG_SEPARATOR);

            log(`Executing git log command with format (maxCount: ${maxCount}, skip: ${skip})`);
            const gitArgs = [
                gitExecutable.path,
                '-c',
                'log.showSignature=false',
                'log',
                `--max-count=${maxCount + 1}`, // Fetch one extra to check if more are available
                `--skip=${skip}`,
                `--pretty=format:${format}`,
                '--date-order',
                '--graph',
                '--decorate=full'
            ];

            // Add branch filtering if specified, otherwise use --branches --tags --remotes
            if (branches && branches.length > 0) {
                // Add specific branches directly
                gitArgs.push(...branches);
                log(`Filtering commits for branches: ${branches.join(', ')}`);
            } else {
                // Add flags for all branches, tags, and remotes
                gitArgs.push('--branches', '--tags', '--remotes', 'HEAD');
                log('Showing commits from all branches');
            }

            // Always end with --
            gitArgs.push('--');

            const gitLog = await this.spawnGit(gitArgs, workspacePath);
            let lines = gitLog.split(EOL_REGEX).filter((line: string) => line.trim());

            const commits: GitCommit[] = [];
            let hasMore = false;

            // Check if we got more commits than requested (indicating more are available)
            if (lines.length > maxCount) {
                hasMore = true;
                lines = lines.slice(0, maxCount); // Remove the extra commit
            }

            for (const line of lines) {
                const parts = line.split(GIT_LOG_SEPARATOR);
                if (parts.length < 6) {
                    log(`Skipping malformed line: ${line}`);
                    continue;
                }

                const [rawHash, parentHashes, author, email, date, message, refs] = parts;

                // Ensure rawHash exists
                if (!rawHash) {
                    log(`Skipping line with missing hash: ${line}`);
                    continue;
                }

                // Split at last space - left is graph, right is hash
                const lastSpaceIndex = rawHash.lastIndexOf(' ');
                const graph = lastSpaceIndex >= 0 ? rawHash.substring(0, lastSpaceIndex) : '';
                const cleanHash = lastSpaceIndex >= 0 ? rawHash.substring(lastSpaceIndex + 1).trim() : rawHash.trim();

                const commit: GitCommit = {
                    hash: cleanHash,
                    parents: parentHashes?.trim() ? parentHashes.trim().split(' ') : [],
                    graph: graph,
                    author: author?.trim() || '',
                    email: email?.trim() || '',
                    date: date?.trim() || '',
                    message: message?.trim() || ''
                };

                if (refs?.trim()) {
                    commit.refs = refs.trim();
                }

                commits.push(commit);
            }

            let oldestCommitDate: Date | null = commits.length > 0 ? new Date(commits[commits.length - 1].date) : null;

            // Get all stashes - no date filtering to ensure stashes appear on correct pagination pages
            const stashes = await this.getGitStashes(log, branches);
            log(`Found ${stashes.length} total stashes`);

            // Insert stashes before their first parent commit
            const allCommits: GitCommit[] = [];
            const stashByParent = new Map<string, GitCommit[]>();

            // Group stashes by their first parent hash
            for (const stash of stashes) {
                if (stash.parents.length > 0) {
                    const parentHash = stash.parents[0];
                    if (!stashByParent.has(parentHash)) {
                        stashByParent.set(parentHash, []);
                    }
                    stashByParent.get(parentHash)!.push(stash);
                }
            }

            // Insert commits and their associated stashes in chronological order
            for (const commit of commits) {
                const relatedStashes = stashByParent.get(commit.hash);

                if (relatedStashes) {
                    relatedStashes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    allCommits.push(...relatedStashes);
                }

                allCommits.push(commit);
            }

            log(`Parsed ${commits.length} commits and ${stashes.length} stashes (hasMore: ${hasMore})`);
            return { commits: allCommits, hasMore };
        } catch (error) {
            log(`Error getting git commits: ${error}`);
            throw new Error(`Failed to get git commits: ${error}`);
        }
    }

    public clearCache(): void {
        this.cachedGitExecutable = null;
    }
}
