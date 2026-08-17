import * as https from 'https';

const PROBE_TIMEOUT = 5000;
const MAX_REDIRECTS = 3;
const USER_AGENT = 'vscode-git-go';

/**
 * Whether a URL answers with a success status, asked with a HEAD request so nothing is downloaded.
 * Used to choose between a page that may not exist and one that always does — a tag's release page
 * versus its tree. Returns null when the question could not be answered at all (offline, blocked,
 * timed out), so the caller can fall back to opening what it would have opened anyway.
 * @param url The URL to probe.
 */
export function probeUrl(url: string, redirectsLeft = MAX_REDIRECTS): Promise<boolean | null> {
    return new Promise((resolve) => {
        const request = https.request(
            url,
            { method: 'HEAD', headers: { 'User-Agent': USER_AGENT }, timeout: PROBE_TIMEOUT },
            (response) => {
                response.resume();

                const statusCode = response.statusCode ?? 0;
                const location = response.headers.location;

                if (statusCode >= 300 && statusCode < 400 && location) {
                    if (redirectsLeft <= 0) {
                        resolve(null);
                        return;
                    }
                    const target = Array.isArray(location) ? location[0] : location;
                    probeUrl(new URL(target ?? '', url).toString(), redirectsLeft - 1).then(resolve);
                    return;
                }

                resolve(statusCode >= 200 && statusCode < 300);
            }
        );

        request.on('timeout', () => request.destroy());
        request.on('error', () => resolve(null));
        request.end();
    });
}
