import type { GitRemote } from '../gitService';

/** The owner and repository name a github.com remote points at */
export interface GitHubRepo {
    owner: string;
    repo: string;
}

/** A GitHub repository together with the remote it was resolved from */
export interface GitHubRemote extends GitHubRepo {
    remote: string;
}

/** Everything the webview needs to build links into the repository on github.com */
export interface GitHubRepoInfo extends GitHubRemote {
    /** The branch the remote's HEAD points at, which pull requests open against, when it is known */
    defaultBranch: string | null;
}

/**
 * Extract the owner and repository from a github.com remote URL, in any of the forms git supports.
 */
export function parseGitHubRepo(remoteUrl: string): GitHubRepo | null {
    const url = remoteUrl.trim();
    const match =
        url.match(/^(?:https?:\/\/|ssh:\/\/|git:\/\/)(?:[^@/]+@)?([^/:]+)(?::\d+)?\/(.+)$/) ??
        url.match(/^(?:[^@/]+@)([^:/]+):(.+)$/);
    if (!match?.[1] || !match[2]) return null;

    const host = match[1].toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') return null;

    const segments = match[2].replace(/\.git$/, '').replace(/\/$/, '').split('/');
    if (segments.length < 2) return null;

    const owner = segments[segments.length - 2];
    const repo = segments[segments.length - 1];
    if (!owner || !repo) return null;

    return { owner, repo };
}

/**
 * The GitHub repository the workspace's remotes point at: `origin` when it is a GitHub remote, and
 * otherwise the first one that is. Null when none of the remotes is on github.com.
 * @param remotes The repository's remotes, in the order git lists them.
 */
export function resolveGitHubRemote(remotes: GitRemote[]): GitHubRemote | null {
    const origin = remotes.find((remote) => remote.name === 'origin');
    const ordered = origin ? [origin, ...remotes.filter((remote) => remote !== origin)] : remotes;

    for (const remote of ordered) {
        const repo = parseGitHubRepo(remote.fetchUrl || remote.pushUrl);
        if (repo) return { ...repo, remote: remote.name };
    }

    return null;
}

/**
 * Whether a URL is one Git Go itself built, which is the only kind it will open in a browser.
 * Everything shown in the webview — commit messages, branch names, file paths — can reach the URL
 * builders, so the extension host checks the result rather than trusting the webview.
 */
export function isGitHubUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' && (parsed.host === 'github.com' || parsed.host === 'www.github.com');
    } catch {
        return false;
    }
}
