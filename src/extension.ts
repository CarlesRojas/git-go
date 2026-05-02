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
                            stashIncludeUntracked: config.stashIncludeUntracked,
                            expandedCommitHeight: config.expandedCommitHeight,
                            theme: config.theme
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

            currentPanel.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resource/webview-icon.svg');

            const config = getConfig();
            if (config.pinTabEnabled) {
                vscode.commands.executeCommand('workbench.action.pinEditor');
            }

            watchGitChanges(currentPanel, log, diffDocProvider);

            if (!currentPanel) return;

            const scriptUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js')
            );
            const styleUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.css')
            );

            type MessageHandler = (
                message: any,
                log: (msg: string) => void
            ) => Promise<{ type: string; [key: string]: any }>;

            const handlers: Record<string, MessageHandler> = {
                getGitCommits: async (message) => {
                    const gitService = GitService.getInstance();
                    const branches = message.branches || undefined;
                    const maxCount = message.maxCount || 100;
                    const skip = message.skip || 0;
                    const result = await gitService.getGitCommits(log, branches, maxCount, skip);
                    log(`Successfully retrieved ${result.commits.length} commits (hasMore: ${result.hasMore})`);
                    return {
                        type: 'gitCommits',
                        commits: result.commits,
                        hasMore: result.hasMore,
                        skip: skip,
                        maxCount: maxCount
                    };
                },

                getGitBranches: async () => {
                    const gitService = GitService.getInstance();
                    const branches = await gitService.getGitBranches(log);
                    log(`Successfully retrieved ${branches.length} branches`);
                    return { type: 'gitBranches', branches };
                },

                getGitRemotes: async () => {
                    const gitService = GitService.getInstance();
                    const remotes = await gitService.getGitRemotes(log);
                    log(`Successfully retrieved ${remotes.length} remotes`);
                    return { type: 'gitRemotes', remotes };
                },

                getCommitFiles: async (message) => {
                    const gitService = GitService.getInstance();
                    const commitHash = message.commitHash;
                    const isStash = message.isStash ?? false;
                    if (!commitHash) {
                        throw new Error('Commit hash is required');
                    }
                    const files = await gitService.getCommitFiles(log, commitHash, isStash);
                    const commitType = isStash ? 'stash' : 'commit';
                    log(`Successfully retrieved ${files.length} files for ${commitType} ${commitHash.substring(0, 7)}`);
                    return { type: 'gitCommitFiles', files, commitHash };
                },

                getWorkingChanges: async (message) => {
                    const gitService = GitService.getInstance();
                    const includeFiles = message.includeFiles ?? false;
                    const workingChanges = await gitService.getWorkingChanges(log, includeFiles);
                    log(
                        `Successfully retrieved working changes: ${workingChanges ? `found changes (${workingChanges.files?.length || 0} files)` : 'no changes'}`
                    );
                    return { type: 'workingChanges', workingChanges };
                },

                addTag: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, tagName, tagMessage, tagType } = message;
                    if (!commitHash || !tagName) {
                        throw new Error('Commit hash and tag name are required');
                    }
                    await gitService.addTag(log, commitHash, tagName, tagMessage, tagType);
                    const typeText = tagType === 'lightweight' ? 'lightweight' : 'annotated';
                    log(`Successfully created ${typeText} tag '${tagName}' at commit ${commitHash.substring(0, 7)}`);
                    return { type: 'tagCreated', success: true };
                },

                createBranchFromCommit: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, branchName, checkout } = message;
                    if (!commitHash || !branchName) {
                        throw new Error('Commit hash and branch name are required');
                    }
                    await gitService.createBranchFromCommit(log, commitHash, branchName, checkout);
                    const action = checkout ? 'created and checked out' : 'created';
                    log(`Successfully ${action} branch '${branchName}' from commit ${commitHash.substring(0, 7)}`);
                    return { type: 'branchCreated', success: true };
                },

                cherryPickCommit: async (message) => {
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
                    return { type: 'commitCherryPicked', success: true };
                },

                revertCommit: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, noCommit } = message;
                    if (!commitHash) {
                        throw new Error('Commit hash is required');
                    }
                    await gitService.revertCommit(log, commitHash, noCommit);
                    const action = noCommit ? 'staged revert changes for' : 'reverted';
                    log(`Successfully ${action} commit ${commitHash.substring(0, 7)}`);
                    return { type: 'commitReverted', success: true };
                },

                checkoutLocalBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName } = message;
                    if (!branchName) {
                        throw new Error('Branch name is required');
                    }
                    await gitService.checkoutLocalBranch(log, branchName);
                    log(`Successfully checked out local branch: ${branchName}`);
                    return { type: 'branchCheckedOut', branchName, isLocal: true };
                },

                checkoutRemoteBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { remoteBranchName, localBranchName } = message;
                    if (!remoteBranchName || !localBranchName) {
                        throw new Error('Both remote and local branch names are required');
                    }
                    await gitService.checkoutRemoteBranch(log, remoteBranchName, localBranchName);
                    log(`Successfully created and checked out branch: ${localBranchName}`);
                    return { type: 'branchCheckedOut', branchName: localBranchName, isLocal: false, remoteBranchName };
                },

                getCurrentBranch: async () => {
                    const gitService = GitService.getInstance();
                    const currentBranch = await gitService.getCurrentBranch(log);
                    log(`Successfully retrieved current branch: ${currentBranch || 'none (detached HEAD)'}`);
                    return { type: 'currentBranch', currentBranch };
                },

                fetch: async () => {
                    const gitService = GitService.getInstance();
                    await gitService.fetch(log);
                    log('Successfully fetched from remotes');
                    return { type: 'fetchComplete', success: true };
                },

                pushBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, remote, setUpstream, pushMode } = message;
                    await gitService.pushBranch(log, branchName, remote, setUpstream, pushMode);
                    log(`Successfully pushed branch ${branchName}`);
                    return { type: 'pushBranchSuccess' };
                },

                renameBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { oldName, newName } = message;
                    await gitService.renameBranch(log, oldName, newName);
                    log(`Successfully renamed branch ${oldName} to ${newName}`);
                    return { type: 'renameBranchSuccess' };
                },

                deleteBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, force } = message;
                    await gitService.deleteBranch(log, branchName, force);
                    log(`Successfully deleted branch ${branchName}`);
                    return { type: 'deleteBranchSuccess' };
                },

                mergeBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, fastForwardIfPossible, squash, noCommit } = message;
                    await gitService.mergeBranch(log, branchName, fastForwardIfPossible, squash, noCommit);
                    log(`Successfully merged branch ${branchName}`);
                    return { type: 'mergeBranchSuccess' };
                },

                rebaseBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, ignoreDate } = message;
                    await gitService.rebaseBranch(log, branchName, ignoreDate);
                    log(`Successfully rebased onto ${branchName}`);
                    return { type: 'rebaseBranchSuccess' };
                },

                applyStash: async (message) => {
                    const gitService = GitService.getInstance();
                    const { stashSelector, reinstateIndex } = message;
                    if (!stashSelector) {
                        throw new Error('Stash selector is required');
                    }
                    await gitService.applyStash(log, stashSelector, reinstateIndex);
                    log(`Successfully applied stash ${stashSelector}`);
                    return { type: 'applyStashSuccess', success: true };
                },

                popStash: async (message) => {
                    const gitService = GitService.getInstance();
                    const { stashSelector, reinstateIndex } = message;
                    if (!stashSelector) {
                        throw new Error('Stash selector is required');
                    }
                    await gitService.popStash(log, stashSelector, reinstateIndex);
                    log(`Successfully popped stash ${stashSelector}`);
                    return { type: 'popStashSuccess', success: true };
                },

                dropStash: async (message) => {
                    const gitService = GitService.getInstance();
                    const { stashSelector } = message;
                    if (!stashSelector) {
                        throw new Error('Stash selector is required');
                    }
                    await gitService.dropStash(log, stashSelector);
                    log(`Successfully dropped stash ${stashSelector}`);
                    return { type: 'dropStashSuccess', success: true };
                },

                createStash: async (message) => {
                    const gitService = GitService.getInstance();
                    const { message: stashMessage, includeUntracked } = message;
                    await gitService.createStash(log, stashMessage || '', includeUntracked || false);
                    log(`Successfully created stash${stashMessage ? ` with message: ${stashMessage}` : ''}`);
                    return { type: 'createStashSuccess', success: true };
                },

                deleteRemoteBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, remote } = message;
                    if (!branchName || !remote) {
                        throw new Error('Branch name and remote are required');
                    }
                    await gitService.deleteRemoteBranch(log, branchName, remote);
                    log(`Successfully deleted remote branch ${branchName} on ${remote}`);
                    return { type: 'deleteRemoteBranchSuccess', success: true };
                },

                fetchIntoLocalBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { remote, remoteBranch, localBranch, forceFetch } = message;
                    if (!remote || !remoteBranch || !localBranch) {
                        throw new Error('Remote, remote branch, and local branch are required');
                    }
                    await gitService.fetchIntoLocalBranch(log, remote, remoteBranch, localBranch, forceFetch || false);
                    log(`Successfully fetched ${remote}/${remoteBranch} into local branch ${localBranch}`);
                    return { type: 'fetchIntoLocalBranchSuccess', success: true };
                },

                getTagDetails: async (message) => {
                    const gitService = GitService.getInstance();
                    const { tagName } = message;
                    if (!tagName) {
                        throw new Error('Tag name is required');
                    }
                    const tagDetails = await gitService.getTagDetails(log, tagName);
                    log(`Successfully retrieved details for tag ${tagName}`);
                    return { type: 'tagDetails', details: tagDetails };
                },

                pushTag: async (message) => {
                    const gitService = GitService.getInstance();
                    const { tagName, remotes } = message;
                    if (!tagName || !remotes || !Array.isArray(remotes)) {
                        throw new Error('Tag name and remotes array are required');
                    }
                    await gitService.pushTag(log, tagName, remotes);
                    log(`Successfully pushed tag ${tagName} to ${remotes.join(', ')}`);
                    return { type: 'pushTagSuccess', success: true };
                },

                deleteTag: async (message) => {
                    const gitService = GitService.getInstance();
                    const { tagName, deleteOnRemote } = message;
                    if (!tagName) {
                        throw new Error('Tag name is required');
                    }
                    await gitService.deleteTag(log, tagName, deleteOnRemote);
                    log(`Successfully deleted tag ${tagName}${deleteOnRemote ? ` from remote ${deleteOnRemote}` : ''}`);
                    return { type: 'deleteTagSuccess', success: true };
                },

                resetUncommittedChanges: async (message) => {
                    const gitService = GitService.getInstance();
                    const { mode } = message;
                    await gitService.resetUncommittedChanges(log, mode || 'mixed');
                    log(`Successfully reset uncommitted changes and cleaned untracked files (${mode || 'mixed'} mode)`);
                    return { type: 'resetUncommittedChangesSuccess', success: true };
                },

                getRepoName: async () => {
                    const gitService = GitService.getInstance();
                    const repoName = await gitService.getRepoName();
                    log('Successfully retrieved repository name');
                    return { type: 'repoName', name: repoName };
                },

                getGitUserConfig: async () => {
                    const gitService = GitService.getInstance();
                    const userConfig = await gitService.getGitUserConfig();
                    log('Successfully retrieved git user configuration');
                    return { type: 'gitUserConfig', config: userConfig };
                },

                setGitUserConfig: async (message) => {
                    const gitService = GitService.getInstance();
                    await gitService.setGitUserConfig(message.config);
                    log('Successfully set git user configuration');
                    return { type: 'gitUserConfigSet' };
                },

                addGitRemote: async (message) => {
                    const gitService = GitService.getInstance();
                    await gitService.addGitRemote(message.remote);
                    log('Successfully added git remote');
                    return { type: 'gitRemoteAdded' };
                },

                removeGitRemote: async (message) => {
                    const gitService = GitService.getInstance();
                    await gitService.removeGitRemote(message.remoteName);
                    log('Successfully removed git remote');
                    return { type: 'gitRemoteRemoved' };
                },

                getConfig: async () => {
                    const config = getConfig();
                    log('Successfully retrieved extension configuration');
                    return {
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
                            stashIncludeUntracked: config.stashIncludeUntracked,
                            expandedCommitHeight: config.expandedCommitHeight,
                            theme: config.theme
                        }
                    };
                },

                openSettings: async (message) => {
                    await vscode.commands.executeCommand('workbench.action.openSettings', message.query);
                    log('Successfully opened VS Code settings');
                    return { type: 'settingsOpened' };
                }
            };

            const specialHandlers: Record<string, (message: any) => void> = {
                saveRepoState: (message) => {
                    const saveRepoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
                    if (!saveRepoPath) {
                        log('No workspace folder found, cannot save state');
                        return;
                    }
                    context.globalState.update(`${saveRepoPath}:${message.key}`, message.value);
                },

                loadRepoState: (message) => {
                    const loadRepoPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? null;
                    if (!loadRepoPath) {
                        log('No workspace folder found, cannot load state');
                        currentPanel?.webview.postMessage({
                            type: 'repoStateLoaded',
                            key: message.key,
                            value: null,
                            requestId: message.requestId
                        });
                        return;
                    }

                    const stateValue = context.globalState.get(`${loadRepoPath}:${message.key}`);
                    currentPanel?.webview.postMessage({
                        type: 'repoStateLoaded',
                        key: message.key,
                        value: stateValue ?? null,
                        requestId: message.requestId
                    });
                },

                openFile: async (message) => {
                    const filePath = message.filePath;
                    const fileName = filePath.split('/').pop() || filePath;
                    const oldPath = message.oldPath;
                    const status = message.status;
                    const commitHash = message.commitHash;
                    const isRootCommit = message.isRootCommit ?? false;
                    const isStash = message.isStash ?? false;
                    const sourceCommit = message.sourceCommit;

                    if (!filePath) throw new Error('File path is required');

                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (!workspaceFolders || workspaceFolders.length === 0)
                        throw new Error('No workspace folder found');

                    const workspaceUri = workspaceFolders[0].uri;
                    const fileUri = vscode.Uri.joinPath(workspaceUri, filePath);

                    if (commitHash) {
                        const actualCommitHash = sourceCommit || commitHash;

                        if (message.isUncommitted) {
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
                                await vscode.commands.executeCommand('vscode.diff', leftUri, fileUri, label);
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
                                await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, label);
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
                }
            };

            currentPanel.webview.onDidReceiveMessage(
                async (message) => {
                    log(
                        `Received message from webview: ${message.type}${message.requestId ? ` (${message.requestId})` : ''}`
                    );

                    if (specialHandlers[message.type]) {
                        try {
                            specialHandlers[message.type](message);
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                            log(`Error handling ${message.type}: ${errorMessage}`);
                            if (message.type === 'openFile') {
                                vscode.window.showErrorMessage(`Failed to open file: ${errorMessage}`);
                            }
                        }
                        return;
                    }

                    const handler = handlers[message.type];
                    if (handler) {
                        try {
                            const response = await handler(message, log);
                            if (message.requestId) response.requestId = message.requestId;

                            currentPanel?.webview.postMessage(response);
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                            log(`Error ${message.type}: ${errorMessage}`);
                            currentPanel?.webview.postMessage({
                                type: 'gitError',
                                error: errorMessage,
                                requestId: message.requestId
                            });
                        }
                    } else {
                        log(`Unknown message type: ${message.type}`);
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

    let retryCount = 0;
    const maxRetries = 100; // 10 seconds total (100 * 100ms)

    const scheduleRetry = () => {
        setTimeout(async () => {
            try {
                const completed = await autoOpenGitGo();
                if (completed) return;

                retryCount++;
                if (retryCount >= maxRetries) {
                    log('Auto-open retry limit reached, Git extension may not be available');
                    return;
                }

                scheduleRetry();
            } catch (err) {
                log(`Auto-open retry crashed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }, 100);
    };

    scheduleRetry();

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

function watchGitChanges(panel: vscode.WebviewPanel, log: (msg: string) => void, diffDocProvider: DiffDocProvider) {
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
            diffDocProvider.invalidate();
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
        const packedRefsPattern = new vscode.RelativePattern(workspaceFolder, '.git/packed-refs');
        const refsDirectoryPattern = new vscode.RelativePattern(workspaceFolder, '.git/refs');
        const headLogPattern = new vscode.RelativePattern(workspaceFolder, '.git/logs/HEAD');

        const refsWatcher = vscode.workspace.createFileSystemWatcher(gitRefsPattern);
        const headWatcher = vscode.workspace.createFileSystemWatcher(headPattern);
        const packedRefsWatcher = vscode.workspace.createFileSystemWatcher(packedRefsPattern);
        const refsDirectoryWatcher = vscode.workspace.createFileSystemWatcher(refsDirectoryPattern);
        const headLogWatcher = vscode.workspace.createFileSystemWatcher(headLogPattern);

        const onRefChange = () => notifyChange();

        disposables.push(
            refsWatcher.onDidCreate(onRefChange),
            refsWatcher.onDidChange(onRefChange),
            refsWatcher.onDidDelete(onRefChange),
            headWatcher.onDidChange(onRefChange),
            packedRefsWatcher.onDidCreate(onRefChange),
            packedRefsWatcher.onDidChange(onRefChange),
            packedRefsWatcher.onDidDelete(onRefChange),
            refsDirectoryWatcher.onDidCreate(onRefChange),
            refsDirectoryWatcher.onDidChange(onRefChange),
            refsDirectoryWatcher.onDidDelete(onRefChange),
            headLogWatcher.onDidChange(onRefChange),
            refsWatcher,
            headWatcher,
            packedRefsWatcher,
            refsDirectoryWatcher,
            headLogWatcher
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
