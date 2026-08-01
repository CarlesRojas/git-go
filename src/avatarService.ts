import * as https from 'https';
import * as vscode from 'vscode';

/**
 * Resolves author avatars from the repository's hosting provider.
 *
 * Gravatar only knows an author if they registered that exact email with Gravatar, so authors who
 * only exist on the hosting provider (bots, `noreply` addresses, anyone who never signed up for
 * Gravatar) fall back to a generated identicon. GitHub, on the other hand, maps a commit to the
 * account that authored it, so asking it about a commit gives the real profile picture.
 *
 * Images are returned as data URIs so the webview needs no per-host Content-Security-Policy rules.
 */

const CACHE_KEY = 'git-go:avatarUrls';
const FOUND_TTL = 14 * 24 * 60 * 60 * 1000;
const MISSING_TTL = 12 * 60 * 60 * 1000;
const AVATAR_SIZE = 128;
const REQUEST_TIMEOUT = 15000;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'vscode-git-go';

interface CachedAvatarUrl {
    /** The avatar image URL, or null when the provider has no avatar for this author. */
    url: string | null;
    timestamp: number;
}

interface GitHubRepo {
    owner: string;
    repo: string;
}

interface HttpResponse {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: Buffer;
}

export class AvatarService {
    private readonly images = new Map<string, string>();
    private readonly inFlight = new Map<string, Promise<string | null>>();
    private queue: Promise<unknown> = Promise.resolve();
    private rateLimitedUntil = 0;

    constructor(private readonly globalState: vscode.Memento) {}

    /**
     * Get the avatar of a commit author as a data URI.
     * @param email The author email of the commit.
     * @param commitHash A commit authored by that email, used to ask the provider who authored it.
     * @param resolveRemoteUrl Resolves the repository's remote URL. Only called when a lookup is needed.
     * @param log Logging callback.
     * @returns A data URI, or null when the provider has no avatar for this author.
     */
    public async getAvatar(
        email: string,
        commitHash: string | undefined,
        resolveRemoteUrl: () => Promise<string | null>,
        log: (message: string) => void
    ): Promise<string | null> {
        const author = email.trim().toLowerCase();
        if (!author) return null;

        const cachedImage = this.images.get(author);
        if (cachedImage) return cachedImage;

        const inFlight = this.inFlight.get(author);
        if (inFlight) return inFlight;

        const request = this.resolveAvatar(author, commitHash, resolveRemoteUrl, log)
            .catch((error) => {
                log(`Error resolving avatar for ${author}: ${error}`);
                return null;
            })
            .finally(() => this.inFlight.delete(author));

        this.inFlight.set(author, request);
        return request;
    }

    private async resolveAvatar(
        email: string,
        commitHash: string | undefined,
        resolveRemoteUrl: () => Promise<string | null>,
        log: (message: string) => void
    ): Promise<string | null> {
        const url = await this.resolveAvatarUrl(email, commitHash, resolveRemoteUrl, log);
        if (!url) return null;

        const image = await this.downloadImage(url, log);
        if (image) this.images.set(email, image);
        return image;
    }

    private async resolveAvatarUrl(
        email: string,
        commitHash: string | undefined,
        resolveRemoteUrl: () => Promise<string | null>,
        log: (message: string) => void
    ): Promise<string | null> {
        const cached = this.readCache(email);
        if (cached) return cached.url;

        // `<id>+<login>@users.noreply.github.com` already carries the account id, no request needed.
        const noReplyUrl = getGitHubNoReplyAvatarUrl(email);
        if (noReplyUrl) {
            this.writeCache(email, noReplyUrl);
            return noReplyUrl;
        }

        if (!commitHash) return null;

        const remoteUrl = await resolveRemoteUrl();
        const repo = remoteUrl ? parseGitHubRepo(remoteUrl) : null;
        if (!repo) return null;

        if (Date.now() < this.rateLimitedUntil) {
            log(`Skipping avatar lookup for ${email}, GitHub rate limit is in effect`);
            return null;
        }

        // Lookups are serialised: a repo with many authors would otherwise burst through the
        // unauthenticated rate limit as soon as the graph renders.
        const url = await this.enqueue(() => this.fetchGitHubAvatarUrl(repo, commitHash, email, log));
        if (url === undefined) return null; // Transient failure, don't cache it

        this.writeCache(email, url);
        return url;
    }

    private async fetchGitHubAvatarUrl(
        repo: GitHubRepo,
        commitHash: string,
        email: string,
        log: (message: string) => void
    ): Promise<string | null | undefined> {
        const path = `/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/commits/${encodeURIComponent(commitHash)}`;

        let response: HttpResponse;
        try {
            response = await httpsGet(`https://api.github.com${path}`, {
                'User-Agent': USER_AGENT,
                Accept: 'application/vnd.github+json'
            });
        } catch (error) {
            log(`Error requesting GitHub avatar for ${email}: ${error}`);
            return undefined;
        }

        if (response.statusCode === 403 || response.statusCode === 429) {
            const reset = Number(response.headers['x-ratelimit-reset']);
            // Back off until the limit resets, or for 15 minutes when GitHub didn't say.
            this.rateLimitedUntil = Number.isFinite(reset) && reset > 0 ? reset * 1000 : Date.now() + 15 * 60 * 1000;
            log(`GitHub rate limit reached, pausing avatar lookups until ${new Date(this.rateLimitedUntil).toISOString()}`);
            return undefined;
        }

        if (response.statusCode !== 200) {
            // A 404 usually means the commit isn't on the remote yet, which another commit by the
            // same author may well be, so this is never remembered as a definitive miss.
            log(`GitHub returned ${response.statusCode} for the avatar of ${email}`);
            return undefined;
        }

        try {
            const commit = JSON.parse(response.body.toString('utf8'));
            const avatarUrl: unknown = commit?.author?.avatar_url;
            if (typeof avatarUrl !== 'string' || !avatarUrl) {
                log(`GitHub has no account linked to ${email}`);
                return null;
            }
            log(`Resolved GitHub avatar for ${email}`);
            return withSize(avatarUrl);
        } catch (error) {
            log(`Error parsing the GitHub avatar response for ${email}: ${error}`);
            return undefined;
        }
    }

    private async downloadImage(url: string, log: (message: string) => void): Promise<string | null> {
        try {
            const response = await httpsGet(url, { 'User-Agent': USER_AGENT });
            if (response.statusCode !== 200) {
                log(`Avatar download from ${url} returned ${response.statusCode}`);
                return null;
            }

            const contentType = getHeader(response.headers, 'content-type');
            if (contentType && !contentType.startsWith('image/')) {
                log(`Avatar download from ${url} returned '${contentType}' instead of an image`);
                return null;
            }

            return `data:${contentType || 'image/png'};base64,${response.body.toString('base64')}`;
        } catch (error) {
            log(`Error downloading avatar from ${url}: ${error}`);
            return null;
        }
    }

    private enqueue<T>(task: () => Promise<T>): Promise<T> {
        const run = this.queue.then(task, task);
        this.queue = run.then(
            () => undefined,
            () => undefined
        );
        return run;
    }

    private readCache(email: string): CachedAvatarUrl | undefined {
        const cache = this.globalState.get<Record<string, CachedAvatarUrl>>(CACHE_KEY, {});
        const entry = cache[email];
        if (!entry) return undefined;
        return isFresh(entry) ? entry : undefined;
    }

    private writeCache(email: string, url: string | null): void {
        const cache = this.globalState.get<Record<string, CachedAvatarUrl>>(CACHE_KEY, {});
        const pruned: Record<string, CachedAvatarUrl> = {};
        for (const [key, entry] of Object.entries(cache)) {
            if (isFresh(entry)) pruned[key] = entry;
        }
        pruned[email] = { url, timestamp: Date.now() };
        this.globalState.update(CACHE_KEY, pruned);
    }
}

function isFresh(entry: CachedAvatarUrl): boolean {
    if (typeof entry?.timestamp !== 'number') return false;
    return Date.now() - entry.timestamp < (entry.url ? FOUND_TTL : MISSING_TTL);
}

function withSize(avatarUrl: string): string {
    return `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}s=${AVATAR_SIZE}`;
}

/**
 * Derive the avatar of a GitHub `noreply` email, which embeds the account id.
 */
function getGitHubNoReplyAvatarUrl(email: string): string | null {
    const match = email.match(/^(\d+)\+[^@]+@users\.noreply\.github\.com$/);
    if (!match?.[1]) return null;
    return withSize(`https://avatars.githubusercontent.com/u/${match[1]}?v=4`);
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

function getHeader(headers: HttpResponse['headers'], name: string): string | undefined {
    const value = headers[name];
    return Array.isArray(value) ? value[0] : value;
}

function httpsGet(url: string, headers: Record<string, string>, redirectsLeft = MAX_REDIRECTS): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, { headers, timeout: REQUEST_TIMEOUT }, (response) => {
            const statusCode = response.statusCode ?? 0;
            const location = getHeader(response.headers, 'location');

            if (statusCode >= 300 && statusCode < 400 && location) {
                response.resume();
                if (redirectsLeft <= 0) {
                    reject(new Error('Too many redirects'));
                    return;
                }
                httpsGet(new URL(location, url).toString(), headers, redirectsLeft - 1).then(resolve, reject);
                return;
            }

            const chunks: Buffer[] = [];
            let size = 0;

            response.on('data', (chunk: Buffer) => {
                size += chunk.length;
                if (size > MAX_IMAGE_BYTES) {
                    request.destroy();
                    reject(new Error('Response too large'));
                    return;
                }
                chunks.push(chunk);
            });
            response.on('end', () => resolve({ statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
            response.on('error', reject);
        });

        request.on('timeout', () => request.destroy(new Error('Request timed out')));
        request.on('error', reject);
    });
}
