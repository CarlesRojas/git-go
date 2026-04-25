// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitService } from './gitService';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Git Go');
    context.subscriptions.push(outputChannel);

    const log = (message: string) => {
        const timestamp = new Date().toISOString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
    };

    log('Starting Git Go extension...');

    // Register the command to open the Git Graph webview
    const disposable = vscode.commands.registerCommand('git-go.openGitGraph', () => {
        log('Opening Git Graph webview');
        const panel = vscode.window.createWebviewPanel('gitGoGraph', 'Git Go Graph', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        });

        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js'));
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.css'));

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
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
                            log(`Successfully retrieved ${result.commits.length} commits (hasMore: ${result.hasMore})`);
                            panel.webview.postMessage({
                                type: 'gitCommits',
                                commits: result.commits,
                                hasMore: result.hasMore,
                                skip: skip,
                                maxCount: maxCount
                            });
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                            log(`Error getting git commits: ${errorMessage}`);
                            panel.webview.postMessage({
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
                            panel.webview.postMessage({
                                type: 'gitBranches',
                                branches: branches
                            });
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                            log(`Error getting git branches: ${errorMessage}`);
                            panel.webview.postMessage({
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

        panel.webview.html = getWebviewContent(panel.webview, scriptUri, styleUri);
    });
    context.subscriptions.push(disposable);

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
\t<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src data:; img-src data: https://secure.gravatar.com https://*.gravatar.com;">
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

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// This method is called when your extension is deactivated
export function deactivate() {}
