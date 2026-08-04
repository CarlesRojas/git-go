import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getConfig } from './config';

/** A git repository found in the workspace, either a workspace folder itself or a folder inside one */
export interface GitRepo {
    /** Absolute path of the repository's root */
    path: string;
    /** The repository's folder name */
    name: string;
    /** Path relative to the workspace folder it was found in, empty for a workspace folder itself */
    relativePath: string;
    /** Whether the repository is a workspace folder rather than a folder inside one */
    isWorkspaceFolder: boolean;
}

/** Folders that never contain a repository worth listing, and that are expensive to walk through */
const IGNORED_FOLDERS = new Set([
    'node_modules',
    'bower_components',
    'vendor',
    'dist',
    'out',
    'build',
    'target',
    'coverage',
    'tmp',
    'temp',
    '__pycache__',
    'Pods',
    'DerivedData'
]);

/** A workspace with more repositories than this is being scanned too broadly to be useful */
const MAX_REPOS = 100;

/** Guard against a scan that walks a huge tree, however shallow the configured depth is */
const MAX_VISITED_FOLDERS = 5_000;

/**
 * Finds the git repositories of the workspace, and keeps track of which one Git Go is showing.
 */
export class RepoService {
    private static instance: RepoService;

    private repos: GitRepo[] = [];
    private activeRepoPath: string | null = null;

    private constructor() {}

    public static getInstance(): RepoService {
        if (!RepoService.instance) {
            RepoService.instance = new RepoService();
        }
        return RepoService.instance;
    }

    /**
     * The repositories found by the last scan, without scanning again.
     */
    public getRepos(): GitRepo[] {
        return this.repos;
    }

    /**
     * The repository Git Go is showing, which is the first one found while none has been chosen.
     */
    public getActiveRepo(): GitRepo | null {
        const active = this.repos.find((repo) => repo.path === this.activeRepoPath);
        return active ?? this.repos[0] ?? null;
    }

    /**
     * Show a repository, as long as it is one of the repositories that were found.
     * @param repoPath The absolute path of the repository's root.
     * @returns The repository now being shown, or null when the path is not one of the found ones.
     */
    public setActiveRepo(repoPath: string): GitRepo | null {
        const repo = this.repos.find((candidate) => candidate.path === repoPath);
        if (!repo) return null;

        this.activeRepoPath = repo.path;
        return repo;
    }

    /**
     * Scan the workspace folders and every folder inside them, down to the configured depth, for git
     * repositories. Workspace folders come first, then the repositories inside them by path.
     * @param log The logging function.
     * @returns The repositories that were found.
     */
    public async discoverRepos(log: (message: string) => void): Promise<GitRepo[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders ?? [];
        const maxDepth = Math.max(0, getConfig().repoScanDepth);

        const found: GitRepo[] = [];
        const seen = new Set<string>();
        let visited = 0;

        const addRepo = (repoPath: string, root: vscode.WorkspaceFolder) => {
            if (seen.has(repoPath)) return;
            seen.add(repoPath);
            found.push({
                path: repoPath,
                name: path.basename(repoPath) || repoPath,
                relativePath: path.relative(root.uri.fsPath, repoPath),
                isWorkspaceFolder: repoPath === root.uri.fsPath
            });
        };

        const scan = async (
            folder: string,
            root: vscode.WorkspaceFolder,
            depth: number,
            submodules: Set<string>
        ): Promise<void> => {
            if (found.length >= MAX_REPOS || visited >= MAX_VISITED_FOLDERS) return;
            visited++;

            let submodulesBelow = submodules;

            if (await isGitRepo(folder)) {
                addRepo(folder, root);

                // A repository's submodules are part of it, rather than repositories of their own
                const ownSubmodules = await readSubmodulePaths(folder);
                if (ownSubmodules.size > 0) submodulesBelow = new Set([...submodules, ...ownSubmodules]);
            }

            if (depth >= maxDepth) return;

            let entries: fs.Dirent[];
            try {
                entries = await fs.promises.readdir(folder, { withFileTypes: true });
            } catch (error) {
                log(`Could not read '${folder}' while looking for repositories: ${error}`);
                return;
            }

            const subfolders = entries
                .filter(
                    (entry) =>
                        entry.isDirectory() && !entry.name.startsWith('.') && !IGNORED_FOLDERS.has(entry.name)
                )
                .map((entry) => path.join(folder, entry.name))
                .filter((subfolder) => !submodulesBelow.has(subfolder))
                .sort((a, b) => a.localeCompare(b));

            for (const subfolder of subfolders) {
                await scan(subfolder, root, depth + 1, submodulesBelow);
            }
        };

        for (const workspaceFolder of workspaceFolders) {
            await scan(workspaceFolder.uri.fsPath, workspaceFolder, 0, new Set());
        }

        this.repos = found;

        // The repository that was being shown may be gone, in which case the first one takes over
        if (this.activeRepoPath && !found.some((repo) => repo.path === this.activeRepoPath)) {
            this.activeRepoPath = null;
        }

        log(`Found ${found.length} git ${found.length === 1 ? 'repository' : 'repositories'} in the workspace`);
        return found;
    }
}

/**
 * The absolute paths of a repository's submodules, as its `.gitmodules` file declares them. A
 * repository without submodules has no such file, which is not an error.
 * @param repoPath The absolute path of the repository's root.
 */
async function readSubmodulePaths(repoPath: string): Promise<Set<string>> {
    let contents: string;
    try {
        contents = await fs.promises.readFile(path.join(repoPath, '.gitmodules'), 'utf8');
    } catch {
        return new Set();
    }

    const paths = new Set<string>();
    for (const line of contents.split(/\r\n|\r|\n/)) {
        const match = /^\s*path\s*=\s*(.+?)\s*$/.exec(line);
        if (match?.[1]) paths.add(path.resolve(repoPath, match[1]));
    }

    return paths;
}

/**
 * Whether a folder is the root of a git repository. A linked worktree has a `.git` file rather than
 * a directory, so both count.
 * @param folder The absolute path of the folder.
 */
async function isGitRepo(folder: string): Promise<boolean> {
    try {
        await fs.promises.stat(path.join(folder, '.git'));
        return true;
    } catch {
        return false;
    }
}
