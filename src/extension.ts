// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getConfig } from './config';
import { DiffDocProvider, encodeDiffDocUri } from './diffDocProvider';
import { GitService } from './gitService';
import { StatusBarItem } from './statusBarItem';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    const outputChannel = vscode.window.createOutputChannel('Git Go');
    context.subscriptions.push(outputChannel);

    // Create status bar item
    const statusBarItem = new StatusBarItem((message: string) => {
        const timestamp = new Date().toISOString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
    });
    context.subscriptions.push({ dispose: () => statusBarItem.dispose() });

    // Register our custom diff document provider
    const diffDocProvider = new DiffDocProvider();
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(DiffDocProvider.scheme, diffDocProvider),
        diffDocProvider
    );

    const log = (message: string) => {
        const timestamp = new Date().toISOString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
    };

    log('Starting Git Go extension...');

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('git-go')) {
                log('Configuration changed, updating webview...');

                // Refresh status bar item if its setting changed
                if (event.affectsConfiguration('git-go.statusBar.enabled')) {
                    statusBarItem.refresh();
                }

                // Send updated config to webview if it's open
                if (currentPanel) {
                    const config = getConfig();
                    currentPanel.webview.postMessage({
                        type: 'configChanged',
                        config: {
                            rounded: config.rounded,
                            autoOpenEnabled: config.autoOpenEnabled,
                            pinTabEnabled: config.pinTabEnabled,
                            branchCreateCheckout: config.branchCreateCheckout,
                            branchDeleteForce: config.branchDeleteForce,
                            branchPushSetUpstream: config.branchPushSetUpstream,
                            branchRebaseIgnoreDate: config.branchRebaseIgnoreDate,
                            mergeFastForwardIfPossible: config.mergeFastForwardIfPossible,
                            mergeSquash: config.mergeSquash,
                            mergeNoCommit: config.mergeNoCommit,
                            cherryPickRecordOrigin: config.cherryPickRecordOrigin,
                            cherryPickNoCommit: config.cherryPickNoCommit,
                            revertNoCommit: config.revertNoCommit,
                            remoteFetchForceFetch: config.remoteFetchForceFetch,
                            stashIncludeUntracked: config.stashIncludeUntracked
                        }
                    });
                }
            }
        })
    );

    // Register the command to open the Git Graph webview
    context.subscriptions.push(
        vscode.commands.registerCommand('git-go.openGitGraph', () => {
            log('Opening Git Graph webview');
            const columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;

            if (currentPanel) {
                (currentPanel as vscode.WebviewPanel).reveal(columnToShowIn);

                const config = getConfig();
                if (config.pinTabEnabled) {
                    vscode.commands.executeCommand('workbench.action.pinEditor');
                }
                return;
            }

            currentPanel = vscode.window.createWebviewPanel('gitGoGraph', 'Git Go', vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            });

            currentPanel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'webview-icon.svg');

            const config = getConfig();
            if (config.pinTabEnabled) {
                vscode.commands.executeCommand('workbench.action.pinEditor');
            }

            watchGitChanges(currentPanel, log);

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
                        case 'getGitRemotes':
                            try {
                                const gitService = GitService.getInstance();
                                const remotes = await gitService.getGitRemotes(log);
                                log(`Successfully retrieved ${remotes.length} remotes`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitRemotes',
                                    remotes: remotes
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting git remotes: ${errorMessage}`);
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
                                const isStash = message.isStash ?? false;
                                if (!commitHash) {
                                    throw new Error('Commit hash is required');
                                }
                                const files = await gitService.getCommitFiles(log, commitHash, isStash);
                                const commitType = isStash ? 'stash' : 'commit';
                                log(
                                    `Successfully retrieved ${files.length} files for ${commitType} ${commitHash.substring(0, 7)}`
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
                        case 'getWorkingChanges':
                            try {
                                const gitService = GitService.getInstance();
                                const includeFiles = message.includeFiles ?? false;
                                const workingChanges = await gitService.getWorkingChanges(log, includeFiles);
                                log(
                                    `Successfully retrieved working changes: ${workingChanges ? `found changes (${workingChanges.files?.length || 0} files)` : 'no changes'}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'workingChanges',
                                    workingChanges: workingChanges
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting working changes: ${errorMessage}`);
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
                                const isStash = message.isStash ?? false;
                                const sourceCommit = message.sourceCommit; // Use sourceCommit if available (for stashes)

                                if (!filePath) throw new Error('File path is required');

                                const workspaceFolders = vscode.workspace.workspaceFolders;
                                if (!workspaceFolders || workspaceFolders.length === 0)
                                    throw new Error('No workspace folder found');

                                const workspaceUri = workspaceFolders[0].uri;
                                const fileUri = vscode.Uri.joinPath(workspaceUri, filePath);

                                if (commitHash) {
                                    // Use sourceCommit for file content if available (important for stash untracked files)
                                    const actualCommitHash = sourceCommit || commitHash;

                                    if (message.isUncommitted) {
                                        // Handle uncommitted changes (working directory)
                                        if (status === 'A') {
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                vscode.Uri.parse('untitled:empty'),
                                                fileUri,
                                                `${fileName} (new file)`
                                            );
                                        } else if (status === 'D') {
                                            const leftUri = encodeDiffDocUri(filePath, 'HEAD', true);
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                vscode.Uri.parse('untitled:empty'),
                                                `${fileName} (deleted)`
                                            );
                                        } else if ((status === 'R' || status === 'C') && oldPath) {
                                            const leftUri = encodeDiffDocUri(oldPath, 'HEAD', true);
                                            const label =
                                                status === 'R'
                                                    ? `${oldPath} → ${fileName} (renamed)`
                                                    : `${fileName} (copied from ${oldPath})`;
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                fileUri,
                                                label
                                            );
                                        } else {
                                            const leftUri = encodeDiffDocUri(filePath, 'HEAD', true);
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                fileUri,
                                                `${fileName} (uncommitted changes)`
                                            );
                                        }
                                    } else {
                                        // Handle committed changes
                                        if (status === 'D') {
                                            const leftUri = encodeDiffDocUri(filePath, `${actualCommitHash}^`, true);
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                vscode.Uri.parse('untitled:empty'),
                                                `${fileName} (deleted in ${commitHash.substring(0, 7)})`
                                            );
                                        } else if (status === 'A') {
                                            const rightUri = encodeDiffDocUri(filePath, actualCommitHash, true);
                                            const label = isStash
                                                ? `${fileName} (added in ${commitHash.substring(0, 8)})`
                                                : `${fileName} (added in ${commitHash.substring(0, 7)})`;
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                vscode.Uri.parse('untitled:empty'),
                                                rightUri,
                                                label
                                            );
                                        } else if ((status === 'R' || status === 'C') && oldPath) {
                                            const leftUri = encodeDiffDocUri(oldPath, `${actualCommitHash}^`, true);
                                            const rightUri = encodeDiffDocUri(filePath, actualCommitHash, true);
                                            const label =
                                                status === 'R'
                                                    ? `${fileName} (renamed in ${commitHash.substring(0, 7)})`
                                                    : `${fileName} (copied from ${oldPath} in ${commitHash.substring(0, 7)})`;
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                rightUri,
                                                label
                                            );
                                        } else {
                                            const leftUri = isRootCommit
                                                ? vscode.Uri.parse('untitled:empty')
                                                : encodeDiffDocUri(filePath, `${actualCommitHash}^`, true);
                                            const rightUri = encodeDiffDocUri(filePath, actualCommitHash, true);
                                            await vscode.commands.executeCommand(
                                                'vscode.diff',
                                                leftUri,
                                                rightUri,
                                                `${fileName} (${commitHash.substring(0, 7)})`
                                            );
                                        }
                                    }

                                    log(
                                        `Opened diff for ${fileName} [${status}] at ${commitHash.substring(0, 7)}${isStash ? ' (stash)' : ''}`
                                    );
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
                        case 'addTag':
                            try {
                                const gitService = GitService.getInstance();
                                const { commitHash, tagName, tagMessage, tagType } = message;
                                if (!commitHash || !tagName) {
                                    throw new Error('Commit hash and tag name are required');
                                }
                                await gitService.addTag(log, commitHash, tagName, tagMessage, tagType);
                                const typeText = tagType === 'lightweight' ? 'lightweight' : 'annotated';
                                log(
                                    `Successfully created ${typeText} tag '${tagName}' at commit ${commitHash.substring(0, 7)}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'tagCreated',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error creating tag: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'createBranchFromCommit':
                            try {
                                const gitService = GitService.getInstance();
                                const { commitHash, branchName, checkout } = message;
                                if (!commitHash || !branchName) {
                                    throw new Error('Commit hash and branch name are required');
                                }
                                await gitService.createBranchFromCommit(log, commitHash, branchName, checkout);
                                const action = checkout ? 'created and checked out' : 'created';
                                log(
                                    `Successfully ${action} branch '${branchName}' from commit ${commitHash.substring(0, 7)}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'branchCreated',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error creating branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'cherryPickCommit':
                            try {
                                const gitService = GitService.getInstance();
                                const { commitHash, recordOrigin, noCommit } = message;
                                if (!commitHash) {
                                    throw new Error('Commit hash is required');
                                }
                                await gitService.cherryPickCommit(log, commitHash, recordOrigin, noCommit);

                                const options = [];
                                if (recordOrigin) options.push('with origin record');
                                if (noCommit) options.push('without committing');
                                const optionsText = options.length > 0 ? ` (${options.join(', ')})` : '';

                                log(`Successfully cherry-picked commit ${commitHash.substring(0, 7)}${optionsText}`);
                                currentPanel?.webview.postMessage({
                                    type: 'commitCherryPicked',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error cherry-picking commit: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'revertCommit':
                            try {
                                const gitService = GitService.getInstance();
                                const { commitHash, noCommit } = message;
                                if (!commitHash) {
                                    throw new Error('Commit hash is required');
                                }
                                await gitService.revertCommit(log, commitHash, noCommit);
                                const action = noCommit ? 'staged revert changes for' : 'reverted';
                                log(`Successfully ${action} commit ${commitHash.substring(0, 7)}`);
                                currentPanel?.webview.postMessage({
                                    type: 'commitReverted',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error reverting commit: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'checkoutLocalBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName } = message;
                                if (!branchName) {
                                    throw new Error('Branch name is required');
                                }
                                await gitService.checkoutLocalBranch(log, branchName);
                                log(`Successfully checked out local branch: ${branchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'branchCheckedOut',
                                    branchName: branchName,
                                    isLocal: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error checking out local branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'checkoutRemoteBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { remoteBranchName, localBranchName } = message;
                                if (!remoteBranchName || !localBranchName) {
                                    throw new Error('Both remote and local branch names are required');
                                }
                                await gitService.checkoutRemoteBranch(log, remoteBranchName, localBranchName);
                                log(`Successfully created and checked out branch: ${localBranchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'branchCheckedOut',
                                    branchName: localBranchName,
                                    isLocal: false,
                                    remoteBranchName: remoteBranchName
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error creating branch from remote: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getCurrentBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const currentBranch = await gitService.getCurrentBranch(log);
                                log(
                                    `Successfully retrieved current branch: ${currentBranch || 'none (detached HEAD)'}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'currentBranch',
                                    currentBranch: currentBranch
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting current branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'fetch':
                            try {
                                const gitService = GitService.getInstance();
                                await gitService.fetch(log);
                                log('Successfully fetched from remotes');
                                currentPanel?.webview.postMessage({
                                    type: 'fetchComplete',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error fetching from remotes: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'pushBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName, remote, setUpstream, pushMode } = message;
                                await gitService.pushBranch(log, branchName, remote, setUpstream, pushMode);
                                log(`Successfully pushed branch ${branchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'pushBranchSuccess'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error pushing branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'renameBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { oldName, newName } = message;
                                await gitService.renameBranch(log, oldName, newName);
                                log(`Successfully renamed branch ${oldName} to ${newName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'renameBranchSuccess'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error renaming branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'deleteBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName, force } = message;
                                await gitService.deleteBranch(log, branchName, force);
                                log(`Successfully deleted branch ${branchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'deleteBranchSuccess'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error deleting branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'mergeBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName, fastFordwardIfPossible, squash, noCommit } = message;
                                await gitService.mergeBranch(log, branchName, fastFordwardIfPossible, squash, noCommit);
                                log(`Successfully merged branch ${branchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'mergeBranchSuccess'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error merging branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'rebaseBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName, ignoreDate } = message;
                                await gitService.rebaseBranch(log, branchName, ignoreDate);
                                log(`Successfully rebased onto ${branchName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'rebaseBranchSuccess'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error rebasing branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'applyStash':
                            try {
                                const gitService = GitService.getInstance();
                                const { stashSelector, reinstateIndex } = message;
                                if (!stashSelector) {
                                    throw new Error('Stash selector is required');
                                }
                                await gitService.applyStash(log, stashSelector, reinstateIndex);
                                log(`Successfully applied stash ${stashSelector}`);
                                currentPanel?.webview.postMessage({
                                    type: 'applyStashSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error applying stash: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'popStash':
                            try {
                                const gitService = GitService.getInstance();
                                const { stashSelector, reinstateIndex } = message;
                                if (!stashSelector) {
                                    throw new Error('Stash selector is required');
                                }
                                await gitService.popStash(log, stashSelector, reinstateIndex);
                                log(`Successfully popped stash ${stashSelector}`);
                                currentPanel?.webview.postMessage({
                                    type: 'popStashSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error popping stash: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'dropStash':
                            try {
                                const gitService = GitService.getInstance();
                                const { stashSelector } = message;
                                if (!stashSelector) {
                                    throw new Error('Stash selector is required');
                                }
                                await gitService.dropStash(log, stashSelector);
                                log(`Successfully dropped stash ${stashSelector}`);
                                currentPanel?.webview.postMessage({
                                    type: 'dropStashSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error dropping stash: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'createStash':
                            try {
                                const gitService = GitService.getInstance();
                                const { message: stashMessage, includeUntracked } = message;
                                await gitService.createStash(log, stashMessage || '', includeUntracked || false);
                                log(
                                    `Successfully created stash${stashMessage ? ` with message: ${stashMessage}` : ''}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'createStashSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error creating stash: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'deleteRemoteBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { branchName, remote } = message;
                                if (!branchName || !remote) {
                                    throw new Error('Branch name and remote are required');
                                }
                                await gitService.deleteRemoteBranch(log, branchName, remote);
                                log(`Successfully deleted remote branch ${branchName} on ${remote}`);
                                currentPanel?.webview.postMessage({
                                    type: 'deleteRemoteBranchSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error deleting remote branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'fetchIntoLocalBranch':
                            try {
                                const gitService = GitService.getInstance();
                                const { remote, remoteBranch, localBranch, forceFetch } = message;
                                if (!remote || !remoteBranch || !localBranch) {
                                    throw new Error('Remote, remote branch, and local branch are required');
                                }
                                await gitService.fetchIntoLocalBranch(
                                    log,
                                    remote,
                                    remoteBranch,
                                    localBranch,
                                    forceFetch || false
                                );
                                log(`Successfully fetched ${remote}/${remoteBranch} into local branch ${localBranch}`);
                                currentPanel?.webview.postMessage({
                                    type: 'fetchIntoLocalBranchSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error fetching into local branch: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getTagDetails':
                            try {
                                const gitService = GitService.getInstance();
                                const { tagName } = message;
                                if (!tagName) {
                                    throw new Error('Tag name is required');
                                }
                                const tagDetails = await gitService.getTagDetails(log, tagName);
                                log(`Successfully retrieved details for tag ${tagName}`);
                                currentPanel?.webview.postMessage({
                                    type: 'tagDetails',
                                    details: tagDetails
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting tag details: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'pushTag':
                            try {
                                const gitService = GitService.getInstance();
                                const { tagName, remotes } = message;
                                if (!tagName || !remotes || !Array.isArray(remotes)) {
                                    throw new Error('Tag name and remotes array are required');
                                }
                                await gitService.pushTag(log, tagName, remotes);
                                log(`Successfully pushed tag ${tagName} to ${remotes.join(', ')}`);
                                currentPanel?.webview.postMessage({
                                    type: 'pushTagSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error pushing tag: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'deleteTag':
                            try {
                                const gitService = GitService.getInstance();
                                const { tagName, deleteOnRemote } = message;
                                if (!tagName) {
                                    throw new Error('Tag name is required');
                                }
                                await gitService.deleteTag(log, tagName, deleteOnRemote);
                                log(
                                    `Successfully deleted tag ${tagName}${deleteOnRemote ? ` from remote ${deleteOnRemote}` : ''}`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'deleteTagSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error deleting tag: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'resetUncommittedChanges':
                            try {
                                const gitService = GitService.getInstance();
                                const { mode } = message;
                                await gitService.resetUncommittedChanges(log, mode || 'mixed');
                                log(
                                    `Successfully reset uncommitted changes and cleaned untracked files (${mode || 'mixed'} mode)`
                                );
                                currentPanel?.webview.postMessage({
                                    type: 'resetUncommittedChangesSuccess',
                                    success: true
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error resetting uncommitted changes: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'saveRepoState':
                            const saveRepoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
                            if (!saveRepoPath) {
                                log('No workspace folder found, cannot save state');
                                return;
                            }
                            context.globalState.update(`${saveRepoPath}:${message.key}`, message.value);
                            break;
                        case 'loadRepoState':
                            const loadRepoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
                            if (!loadRepoPath) {
                                log('No workspace folder found, cannot load state');
                                currentPanel?.webview.postMessage({
                                    type: 'repoStateLoaded',
                                    key: message.key,
                                    value: null
                                });
                                return;
                            }

                            const stateValue = context.globalState.get(`${loadRepoPath}:${message.key}`);
                            currentPanel?.webview.postMessage({
                                type: 'repoStateLoaded',
                                key: message.key,
                                value: stateValue ?? null
                            });
                            break;
                        case 'getConfig':
                            try {
                                const config = getConfig();
                                log('Successfully retrieved extension configuration');
                                currentPanel?.webview.postMessage({
                                    type: 'config',
                                    config: {
                                        rounded: config.rounded,
                                        autoOpenEnabled: config.autoOpenEnabled,
                                        pinTabEnabled: config.pinTabEnabled,
                                        branchCreateCheckout: config.branchCreateCheckout,
                                        branchDeleteForce: config.branchDeleteForce,
                                        branchPushSetUpstream: config.branchPushSetUpstream,
                                        branchRebaseIgnoreDate: config.branchRebaseIgnoreDate,
                                        mergeFastForwardIfPossible: config.mergeFastForwardIfPossible,
                                        mergeSquash: config.mergeSquash,
                                        mergeNoCommit: config.mergeNoCommit,
                                        cherryPickRecordOrigin: config.cherryPickRecordOrigin,
                                        cherryPickNoCommit: config.cherryPickNoCommit,
                                        revertNoCommit: config.revertNoCommit,
                                        remoteFetchForceFetch: config.remoteFetchForceFetch,
                                        stashIncludeUntracked: config.stashIncludeUntracked
                                    }
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting configuration: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getRepoName':
                            try {
                                const gitService = GitService.getInstance();
                                const repoName = await gitService.getRepoName();
                                log('Successfully retrieved repository name');
                                currentPanel?.webview.postMessage({
                                    type: 'repoName',
                                    name: repoName
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting repository name: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'getGitUserConfig':
                            try {
                                const gitService = GitService.getInstance();
                                const userConfig = await gitService.getGitUserConfig();
                                log('Successfully retrieved git user configuration');
                                currentPanel?.webview.postMessage({
                                    type: 'gitUserConfig',
                                    config: userConfig
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error getting git user config: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'setGitUserConfig':
                            try {
                                const gitService = GitService.getInstance();
                                await gitService.setGitUserConfig(message.config);
                                log('Successfully set git user configuration');
                                currentPanel?.webview.postMessage({
                                    type: 'gitUserConfigSet'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error setting git user config: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'addGitRemote':
                            try {
                                const gitService = GitService.getInstance();
                                await gitService.addGitRemote(message.remote);
                                log('Successfully added git remote');
                                currentPanel?.webview.postMessage({
                                    type: 'gitRemoteAdded'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error adding git remote: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'removeGitRemote':
                            try {
                                const gitService = GitService.getInstance();
                                await gitService.removeGitRemote(message.remoteName);
                                log('Successfully removed git remote');
                                currentPanel?.webview.postMessage({
                                    type: 'gitRemoteRemoved'
                                });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error removing git remote: ${errorMessage}`);
                                currentPanel?.webview.postMessage({
                                    type: 'gitError',
                                    error: errorMessage
                                });
                            }
                            break;
                        case 'openSettings':
                            try {
                                await vscode.commands.executeCommand('workbench.action.openSettings', message.query);
                                log('Successfully opened VS Code settings');
                                currentPanel?.webview.postMessage({ type: 'settingsOpened' });
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                log(`Error opening VS Code settings: ${errorMessage}`);
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

    const autoOpenGitGo = async () => {
        const config = getConfig();
        if (!config.autoOpenEnabled) {
            return;
        }

        // Check if Git extension is activated
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension?.isActive) {
            log('Git extension not yet activated, will retry...');
            return false; // Signal that we should retry
        }

        try {
            const gitService = GitService.getInstance();
            const isGitRepo = await gitService.isGitRepository();

            // Update status bar item with git repository status
            statusBarItem.setIsGitRepo(isGitRepo);

            if (isGitRepo) {
                log('Auto-opening Git Go as workspace is a git repository and auto-open is enabled');
                await vscode.commands.executeCommand('git-go.openGitGraph');
            }
            return true; // Signal success/completion
        } catch (error) {
            log(`Error during auto-open check: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return true; // Don't retry on other errors
        }
    };

    // Auto-open with retry logic for Git extension activation
    let retryCount = 0;
    const maxRetries = 100; // 5 seconds total (100 * 50ms)

    const interval = setInterval(async () => {
        const completed = await autoOpenGitGo();
        if (completed) {
            clearInterval(interval);
            return;
        }

        retryCount++;
        if (retryCount >= maxRetries) {
            clearInterval(interval);
            log('Auto-open retry limit reached, Git extension may not be available');
        }
    }, 50);

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
\t<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${standardiseCspSource(webview.cspSource)} 'unsafe-inline'; script-src 'nonce-${nonce}'; font-src data:; img-src data: https://secure.gravatar.com https://*.gravatar.com;">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="${styleUri}" rel="stylesheet">
	<title>Git Go</title>
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

function watchGitChanges(panel: vscode.WebviewPanel, log: (msg: string) => void) {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) {
        log('Git extension not found');
        return;
    }

    const git = gitExtension.getAPI(1);
    const disposables: vscode.Disposable[] = [];
    let debounceTimer: NodeJS.Timeout | undefined;

    const notifyChange = () => {
        if (!panel.visible) return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            panel.webview.postMessage({ type: 'gitChanged' });
            log('Git state changed — notified webview');
        }, 300);
    };

    for (const repo of git.repositories) {
        disposables.push(repo.state.onDidChange(notifyChange));
    }

    disposables.push(
        git.onDidOpenRepository((repo: any) => {
            disposables.push(repo.state.onDidChange(notifyChange));
        })
    );

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const gitRefsPattern = new vscode.RelativePattern(workspaceFolder, '.git/refs/**/*');
        const headPattern = new vscode.RelativePattern(workspaceFolder, '.git/HEAD');

        const refsWatcher = vscode.workspace.createFileSystemWatcher(gitRefsPattern);
        const headWatcher = vscode.workspace.createFileSystemWatcher(headPattern);

        const onRefChange = () => notifyChange();

        disposables.push(
            refsWatcher.onDidCreate(onRefChange),
            refsWatcher.onDidChange(onRefChange),
            refsWatcher.onDidDelete(onRefChange),
            headWatcher.onDidChange(onRefChange),
            refsWatcher,
            headWatcher
        );
    }

    panel.onDidDispose(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        disposables.forEach((d) => d.dispose());
    });

    disposables.push(
        panel.onDidChangeViewState((e) => {
            if (e.webviewPanel.visible) notifyChange();
        })
    );
}
