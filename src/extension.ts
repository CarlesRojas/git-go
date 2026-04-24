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

		panel.webview.html = getWebviewContent(scriptUri, styleUri);
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

function getWebviewContent(scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${styleUri} 'unsafe-inline'; script-src ${scriptUri} 'unsafe-inline' 'unsafe-eval'; font-src data:; img-src data:;">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="${styleUri}" rel="stylesheet">
	<title>Git Go Graph</title>
</head>
<body>
	<div id="root"></div>
	<script src="${scriptUri}"></script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
