// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitService } from './gitService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    const outputChannel = vscode.window.createOutputChannel('Git Go');
    context.subscriptions.push(outputChannel);

    const log = (message: string) => {
        const timestamp = new Date().toISOString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
    };

    log('Starting Git Go extension...');

    // Register the command to open the Git Graph webview
    context.subscriptions.push(
        vscode.commands.registerCommand('git-go.openGitGraph', () => {
            log('Opening Git Graph webview');
            const columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;

            if (currentPanel) return (currentPanel as vscode.WebviewPanel).reveal(columnToShowIn);

            currentPanel = vscode.window.createWebviewPanel('gitGoGraph', 'Git Go Graph', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            });

            if (!currentPanel) return;

            const scriptUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js')
            );
            const styleUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.css')
            );

            currentPanel.webview.onDidReceiveMessage(
                async (message) => {
                    log(`Received message from webview: ${message.type}`);
                    switch (message.type) {
                        case 'getGitCommits':
                            try {
                                const gitService = GitService.getInstance();
                                const branches = message.branches || undefined;
                                const maxCount = message.maxCount || 100;
                                const skip = message.skip || 0;
                                const result = await gitService.getGitCommits(log, branches, maxCount, skip);
                                log(
                                    `Successfully retrieved ${result.commits.length} commits (hasMore: ${result.hasMore})`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'gitCommits',
                                    commits: result.commits,
                                    hasMore: result.hasMore,
                                    skip: skip,
                                    maxCount: maxCount
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting git commits: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getGitStashes':
                            try {
                                const gitService = GitService.getInstance();
                                const stashes = await gitService.getGitStashes(log);
                                log(`Successfully retrieved ${stashes.length} stashes`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitStashes',
                                    stashes: stashes
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting git stashes: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getGitBranches':
                            try {
                                const gitService = GitService.getInstance();
                                const branches = await gitService.getGitBranches(log);
                                log(`Successfully retrieved ${branches.length} branches`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitBranches',
                                    branches: branches
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting git branches: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

            currentPanel.webview.html = getWebviewContent(currentPanel.webview, scriptUri, styleUri);

            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                },
                undefined,
                context.subscriptions
            );
        })
    );

    // Add a status bar button
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(git-branch) Git Go';
    statusBarItem.command = 'git-go.openGitGraph';
    statusBarItem.tooltip = 'Open Git Go Graph';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    log('Git Go extension activated successfully');
}

function getWebviewContent(webview: vscode.Webview, scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
    // Use a nonce to only allow specific scripts to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<!--
		Use a content security policy to only allow loading styles from our extension directory,
		and only allow scripts that have a specific nonce.
	-->
\t<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${standardiseCspSource(webview.cspSource)}; script-src 'nonce-${nonce}'; font-src data:; img-src data: https://secure.gravatar.com https://*.gravatar.com;">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="${styleUri}" rel="stylesheet">
	<title>Git Go Graph</title>
</head>
<body>
	<div id="root"></div>
	<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

/**
 * Standardise the CSP Source provided by Visual Studio Code for use with the Webview. It is idempotent unless called with http/https URI's, in which case it keeps only the authority portion of the http/https URI. This is necessary to be compatible with some web browser environments.
 * @param cspSource The value provide by Visual Studio Code.
 * @returns The standardised CSP Source.
 */
export function standardiseCspSource(cspSource: string) {
    if (cspSource.startsWith('http://') || cspSource.startsWith('https://')) {
        const pathIndex = cspSource.indexOf('/', 8),
            queryIndex = cspSource.indexOf('?', 8),
            fragmentIndex = cspSource.indexOf('#', 8);
        let endOfAuthorityIndex = pathIndex;
        if (queryIndex > -1 && (queryIndex < endOfAuthorityIndex || endOfAuthorityIndex === -1))
            endOfAuthorityIndex = queryIndex;
        if (fragmentIndex > -1 && (fragmentIndex < endOfAuthorityIndex || endOfAuthorityIndex === -1))
            endOfAuthorityIndex = fragmentIndex;
        return endOfAuthorityIndex > -1 ? cspSource.substring(0, endOfAuthorityIndex) : cspSource;
    } else {
        return cspSource;
    }
}

/**
 * Randomly generate a nonce.
 * @returns The nonce.
 */
export function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// This method is called when your extension is deactivated
export function deactivate() {}
