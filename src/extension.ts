// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Register the command to open the Git Graph webview
	const disposable = vscode.commands.registerCommand('git-go.openGitGraph', () => {
		const panel = vscode.window.createWebviewPanel(
			'gitGoGraph',
			'Git Go Graph',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.joinPath(context.extensionUri, 'media')
				]
			}
		);

		const scriptUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js')
		);
		const styleUri = panel.webview.asWebviewUri(
			vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.css')
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
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src data:; img-src data:;">
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
