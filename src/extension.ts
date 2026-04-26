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
                        case 'getCommitFiles':
                            try {
                                const gitService = GitService.getInstance();
                                const commitHash = message.commitHash;
                                if (!commitHash) {
                                    throw new Error('Commit hash is required');
                                }
                                const files = await gitService.getCommitFiles(log, commitHash);
                                log(
                                    `Successfully retrieved ${files.length} files for commit ${commitHash.substring(0, 7)}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'gitCommitFiles',
                                    files: files,
                                    commitHash: commitHash
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting commit files: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'openFile':
                            try {
                                const filePath = message.filePath;
                                const fileName = filePath.split('/').pop() || filePath;
                                const oldPath = message.oldPath;
                                const status = message.status;
                                const commitHash = message.commitHash;
                                const isRootCommit = message.isRootCommit ?? false;

                                if (!filePath) throw new Error('File path is required');

                                const workspaceFolders = vscode.workspace.workspaceFolders;
                                if (!workspaceFolders || workspaceFolders.length === 0)
                                    throw new Error('No workspace folder found');

                                const workspaceUri = workspaceFolders[0].uri;
                                const fileUri = vscode.Uri.joinPath(workspaceUri, filePath);

                                if (commitHash) {
                                    if (status === 'D') {
                                        const prevGitUri = vscode.Uri.from({
                                            scheme: 'git',
                                            path: fileUri.path,
                                            query: JSON.stringify({ ref: `${commitHash}^`, path: fileUri.path })
                                        });

                                        await vscode.commands.executeCommand(
                                            'vscode.diff',
                                            prevGitUri,
                                            vscode.Uri.parse('untitled:empty'),
                                            `${fileName} (deleted in ${commitHash.substring(0, 7)})`
                                        );
                                    } else if (status === 'A') {
                                        const gitUri = vscode.Uri.from({
                                            scheme: 'git',
                                            path: fileUri.path,
                                            query: JSON.stringify({ ref: commitHash, path: fileUri.path })
                                        });

                                        await vscode.commands.executeCommand(
                                            'vscode.diff',
                                            vscode.Uri.parse('untitled:empty'),
                                            gitUri,
                                            `${fileName} (added in ${commitHash.substring(0, 7)})`
                                        );
                                    } else if ((status === 'R' || status === 'C') && oldPath) {
                                        const oldFileUri = vscode.Uri.joinPath(workspaceUri, oldPath);

                                        const prevGitUri = vscode.Uri.from({
                                            scheme: 'git',
                                            path: oldFileUri.path,
                                            query: JSON.stringify({ ref: `${commitHash}^`, path: oldFileUri.path })
                                        });

                                        const gitUri = vscode.Uri.from({
                                            scheme: 'git',
                                            path: fileUri.path,
                                            query: JSON.stringify({ ref: commitHash, path: fileUri.path })
                                        });

                                        const label =
                                            status === 'R'
                                                ? `${fileName} (${commitHash.substring(0, 7)})`
                                                : `${fileName} (copied from ${oldPath} in ${commitHash.substring(0, 7)})`;

                                        await vscode.commands.executeCommand('vscode.diff', prevGitUri, gitUri, label);
                                    } else {
                                        const prevGitUri = isRootCommit
                                            ? vscode.Uri.parse('untitled:empty')
                                            : vscode.Uri.from({
                                                  scheme: 'git',
                                                  path: fileUri.path,
                                                  query: JSON.stringify({ ref: `${commitHash}^`, path: fileUri.path })
                                              });

                                        const gitUri = vscode.Uri.from({
                                            scheme: 'git',
                                            path: fileUri.path,
                                            query: JSON.stringify({ ref: commitHash, path: fileUri.path })
                                        });

                                        await vscode.commands.executeCommand(
                                            'vscode.diff',
                                            prevGitUri,
                                            gitUri,
                                            `${fileName} (${commitHash.substring(0, 7)})`
                                        );
                                    }

                                    log(`Opened diff for ${fileName} [${status}] at ${commitHash.substring(0, 7)}`);
                                } else {
                                    const document = await vscode.workspace.openTextDocument(fileUri);
                                    await vscode.window.showTextDocument(document);
                                    log(`Opened file: ${fileName}`);
                                }
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error opening file: ${errorMessage}`);
                                vscode.window.showErrorMessage(`Failed to open file: ${errorMessage}`);
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
