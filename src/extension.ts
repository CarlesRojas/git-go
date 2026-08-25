// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AvatarService } from './avatarService';
import { getConfig } from './config';
import { GitService } from './gitService';
import { RepoService } from './repoService';
import { StatusBarItem } from './statusBarItem';
import { isGitHubUrl, resolveGitHubRemote } from './util/githubRepo';
import { probeUrl } from './util/probeUrl';

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

    const log = (message: string) => {
        const timestamp = new Date().toISOString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
    };

    const avatarService = new AvatarService(context.globalState);

    log('Starting Git Go extension...');

    const repoService = RepoService.getInstance();
    let gitWatcher: { watchActiveRepo: () => void } | undefined = undefined;

    // A graph tab from before this activation (an extension update or window reload) is dead and
    // cannot be revived, so close it rather than leave it next to the tab that opens fresh
    const leftoverGraphTabs = vscode.window.tabGroups.all
        .flatMap((group) => group.tabs)
        .filter((tab) => tab.input instanceof vscode.TabInputWebview && tab.input.viewType.includes('gitGoGraph'));

    if (leftoverGraphTabs.length > 0) {
        log(`Closing ${leftoverGraphTabs.length} Git Go tab(s) left over from a previous session`);
        vscode.window.tabGroups
            .close(leftoverGraphTabs, true)
            .then(undefined, (error) => log(`Could not close leftover Git Go tab(s): ${error}`));
    }

    /**
     * Look for the workspace's repositories again and keep every git command pointed at the one
     * being shown, which is the first one found while the user has not chosen another.
     */
    const syncActiveRepo = async () => {
        await repoService.discoverRepos(log);
        const activeRepo = repoService.getActiveRepo();
        GitService.getInstance().setActiveRepoPath(activeRepo?.path ?? null);
        return activeRepo;
    };

    /**
     * The path Git Go keeps a repository's own state under, so each repository remembers its own
     * selection of branches and remotes.
     */
    const getStatePath = () => repoService.getActiveRepo()?.path ?? null;

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('git-go')) {
                log('Configuration changed, updating webview...');

                // Refresh status bar item if its setting changed
                if (event.affectsConfiguration('git-go.statusBar.enabled')) {
                    statusBarItem.refresh();
                }

                // Scanning deeper or shallower can find a different set of repositories
                if (event.affectsConfiguration('git-go.repo.scanDepth')) {
                    currentPanel?.webview.postMessage({ type: 'reposChanged' });
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
                            fileTreeFolderCounts: config.fileTreeFolderCounts,
                            dragAndDropEnabled: config.dragAndDropEnabled,
                            dragAndDropBranchDefaultAction: config.dragAndDropBranchDefaultAction,
                            dragAndDropHoldDelay: config.dragAndDropHoldDelay,
                            dragAndDropHideDelay: config.dragAndDropHideDelay,
                            dragAndDropAutoMerge: config.dragAndDropAutoMerge,
                            dragAndDropAutoRebase: config.dragAndDropAutoRebase,
                            dragAndDropAutoCherryPick: config.dragAndDropAutoCherryPick,
                            dragAndDropAutoMergeCommit: config.dragAndDropAutoMergeCommit,
                            dragAndDropAutoPush: config.dragAndDropAutoPush,
                            dragAndDropAutoFetchIntoLocal: config.dragAndDropAutoFetchIntoLocal,
                            branchCreateCheckout: config.branchCreateCheckout,
                            branchDeleteForce: config.branchDeleteForce,
                            branchDeleteOnRemote: config.branchDeleteOnRemote,
                            branchPushSetUpstream: config.branchPushSetUpstream,
                            branchPushMode: config.branchPushMode,
                            mergeFastForwardIfPossible: config.mergeFastForwardIfPossible,
                            mergeSquash: config.mergeSquash,
                            mergeNoCommit: config.mergeNoCommit,
                            rebaseIgnoreDate: config.rebaseIgnoreDate,
                            rebaseAutoStash: config.rebaseAutoStash,
                            cherryPickRecordOrigin: config.cherryPickRecordOrigin,
                            cherryPickNoCommit: config.cherryPickNoCommit,
                            revertNoCommit: config.revertNoCommit,
                            rewordAllowPushed: config.rewordAllowPushed,
                            resetMode: config.resetMode,
                            remoteDefaultRemote: config.remoteDefaultRemote,
                            remoteFetchForceFetch: config.remoteFetchForceFetch,
                            remoteFetchCheckout: config.remoteFetchCheckout,
                            remoteFetchConfirmOnlyIfForceNeeded: config.remoteFetchConfirmOnlyIfForceNeeded,
                            stashIncludeUntracked: config.stashIncludeUntracked,
                            stashReinstateIndex: config.stashReinstateIndex,
                            tagType: config.tagType,
                            tagPushAllRemotes: config.tagPushAllRemotes,
                            tagDeleteOnRemotes: config.tagDeleteOnRemotes,
                            worktreeDefaultPath: config.worktreeDefaultPath,
                            worktreeOpenBehavior: config.worktreeOpenBehavior,
                            worktreeOpenAfterCreate: config.worktreeOpenAfterCreate,
                            worktreeRemoveForce: config.worktreeRemoveForce,
                            worktreeRemoveDeleteBranch: config.worktreeRemoveDeleteBranch,
                            githubCommitLinks: config.githubCommitLinks,
                            githubRefLinks: config.githubRefLinks,
                            githubFileLinks: config.githubFileLinks,
                            githubIssueLinks: config.githubIssueLinks,
                            githubCreatePullRequest: config.githubCreatePullRequest,
                            reflogEnabled: config.reflogEnabled,
                            undoEnabled: config.undoEnabled,
                            undoKeyboardShortcut: config.undoKeyboardShortcut,
                            undoShow: config.undoShow,
                            confirmMerge: config.confirmMerge,
                            confirmRebase: config.confirmRebase,
                            confirmPush: config.confirmPush,
                            confirmBranchDelete: config.confirmBranchDelete,
                            expandedCommitHeight: config.expandedCommitHeight,
                            joinUncommittedChanges: config.joinUncommittedChanges,
                            scrollToTopButton: config.scrollToTopButton,
                            scrollToCurrentBranchButton: config.scrollToCurrentBranchButton,
                            showAuthorName: config.showAuthorName,
                            theme: config.theme,
                            customColors: config.customColors
                        }
                    });
                }
            }
        })
    );

    // Adding or removing a workspace folder changes which repositories there are
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            currentPanel?.webview.postMessage({ type: 'reposChanged' });
        })
    );

    // Register the command to open the Git Graph webview
    context.subscriptions.push(
        vscode.commands.registerCommand('git-go.openGitGraph', async () => {
            log('Opening Git Graph webview');
            const columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;

            // Find the repositories before showing anything, so the panel opens on one of them
            // rather than on the workspace folder, which may not be a repository at all
            await syncActiveRepo();

            if (currentPanel) {
                (currentPanel as vscode.WebviewPanel).reveal(columnToShowIn);

                // Repositories may have come or gone since the panel last looked
                currentPanel.webview.postMessage({ type: 'reposChanged' });

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

            gitWatcher = watchGitChanges(currentPanel, log);
            currentPanel.onDidDispose(() => {
                gitWatcher = undefined;
            });

            if (config.remoteFetchOnOpen && RepoService.getInstance().getActiveRepo()) {
                GitService.getInstance()
                    .fetch(log, getConfig().remoteFetchPrune)
                    .catch((error) => log(`Could not fetch when opening the panel: ${error}`));
            }

            context.subscriptions.push(
                vscode.window.onDidChangeActiveColorTheme((theme) => {
                    const isDark =
                        theme.kind === vscode.ColorThemeKind.Dark || theme.kind === vscode.ColorThemeKind.HighContrast;
                    currentPanel?.webview.postMessage({ type: 'themeChanged', isDark });
                })
            );

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

                searchCommits: async (message) => {
                    const gitService = GitService.getInstance();
                    const term = message.term;
                    if (typeof term !== 'string' || !term.trim()) throw new Error('Search term is required');
                    const branches = message.branches || undefined;
                    const result = await gitService.searchCommits(log, term, branches);
                    return { type: 'searchResults', hashes: result.hashes };
                },

                cancelSearch: async () => {
                    GitService.getInstance().cancelSearch();
                    return { type: 'searchCancelled' };
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

                getAvatar: async (message) => {
                    const email = message.email;
                    if (!email || typeof email !== 'string') throw new Error('Email is required');

                    if (!getConfig().remoteAvatars) return { type: 'avatar', email, avatar: null };

                    const avatar = await avatarService.getAvatar(
                        email,
                        typeof message.commitHash === 'string' ? message.commitHash : undefined,
                        async () => {
                            const gitService = GitService.getInstance();
                            const remotes = await gitService.getGitRemotes(log);
                            const origin = remotes.find((remote) => remote.name === 'origin') ?? remotes[0];
                            return origin?.fetchUrl ?? null;
                        },
                        log
                    );
                    return { type: 'avatar', email, avatar };
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

                compareRefs: async (message) => {
                    const gitService = GitService.getInstance();
                    const { fromRef, toRef } = message;
                    if (!fromRef || !toRef) throw new Error('Both refs are required');

                    const comparison = await gitService.compareRefs(log, fromRef, toRef);
                    log(`Successfully compared '${fromRef}' with '${toRef}': ${comparison.files.length} file(s)`);
                    return { type: 'comparison', comparison };
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

                getRewordableCommits: async () => {
                    const gitService = GitService.getInstance();
                    const commits = await gitService.getRewordableCommits(log);
                    log(`Successfully retrieved ${commits.length} rewordable commit(s)`);
                    return { type: 'rewordableCommits', commits };
                },

                rewordCommit: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, message: newMessage, autoStash } = message;
                    if (!commitHash || typeof newMessage !== 'string') {
                        throw new Error('Commit hash and message are required');
                    }
                    await gitService.rewordCommit(log, commitHash, newMessage, autoStash === true);
                    log(`Successfully reworded commit ${commitHash.substring(0, 7)}`);
                    return { type: 'rewordCommitSuccess', success: true };
                },

                branchFromStash: async (message) => {
                    const gitService = GitService.getInstance();
                    const { stashSelector, branchName } = message;
                    if (!stashSelector || !branchName) {
                        throw new Error('Stash selector and branch name are required');
                    }
                    await gitService.branchFromStash(log, stashSelector, branchName);
                    log(`Successfully created branch '${branchName}' from ${stashSelector}`);
                    return { type: 'branchFromStashSuccess', success: true };
                },

                resetBranchToCommit: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, mode } = message;
                    if (!commitHash) {
                        throw new Error('Commit hash is required');
                    }
                    await gitService.resetBranchToCommit(log, commitHash, mode || 'mixed');
                    log(`Successfully reset current branch to commit ${commitHash.substring(0, 7)} (${mode || 'mixed'} mode)`);
                    return { type: 'branchResetToCommit', success: true };
                },

                rebaseBranchToCommit: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, ignoreDate, autoStash } = message;
                    if (!commitHash) {
                        throw new Error('Commit hash is required');
                    }
                    await gitService.rebaseBranchToCommit(log, commitHash, ignoreDate || false, autoStash || false);
                    log(`Successfully rebased current branch onto commit ${commitHash.substring(0, 7)}`);
                    return { type: 'branchRebasedToCommit', success: true };
                },

                mergeCommitIntoCurrentBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { commitHash, fastForwardIfPossible, squash, noCommit } = message;
                    if (!commitHash) {
                        throw new Error('Commit hash is required');
                    }
                    await gitService.mergeCommitIntoCurrentBranch(
                        log,
                        commitHash,
                        fastForwardIfPossible,
                        squash,
                        noCommit,
                        await resolveMergeCommitMessage(commitHash.substring(0, 7))
                    );
                    log(`Successfully merged commit ${commitHash.substring(0, 7)} into current branch`);
                    return { type: 'commitMergedIntoCurrentBranch', success: true };
                },

                checkoutLocalBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName } = message;
                    if (!branchName) {
                        throw new Error('Branch name is required');
                    }
                    await gitService.checkoutLocalBranch(log, branchName);
                    log(`Successfully checked out local branch: ${branchName}`);
                    await pullAfterCheckout(log);
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
                    await pullAfterCheckout(log);
                    return { type: 'branchCheckedOut', branchName: localBranchName, isLocal: false, remoteBranchName };
                },

                getCurrentBranch: async () => {
                    const gitService = GitService.getInstance();
                    const currentBranch = await gitService.getCurrentBranch(log);
                    log(`Successfully retrieved current branch: ${currentBranch || 'none (detached HEAD)'}`);
                    return { type: 'currentBranch', currentBranch };
                },

                getOperationInProgress: async () => {
                    const gitService = GitService.getInstance();
                    const operation = await gitService.getOperationInProgress(log);
                    log(`Operation in progress: ${operation ?? 'none'}`);
                    return { type: 'operationInProgress', operation };
                },

                abortOperation: async (message) => {
                    const gitService = GitService.getInstance();
                    const { operation } = message;
                    if (!operation) {
                        throw new Error('Operation is required');
                    }
                    await gitService.abortOperation(log, operation);
                    log(`Successfully aborted the ${operation}`);
                    return { type: 'abortOperationSuccess', success: true };
                },

                getUndoableAction: async () => {
                    const gitService = GitService.getInstance();
                    const undoableAction = await gitService.getUndoableAction(log);
                    log(`Undoable action: ${undoableAction ? undoableAction.description : 'none'}`);
                    return { type: 'undoableAction', undoableAction };
                },

                undoLastAction: async (message) => {
                    const gitService = GitService.getInstance();
                    const { previousHash, discardChanges } = message;
                    if (!previousHash) {
                        throw new Error('Previous hash is required');
                    }
                    const action = await gitService.undoLastAction(log, previousHash, discardChanges === true);
                    log(`Successfully undid '${action.description}' on ${action.branch}`);
                    return { type: 'undoLastActionSuccess', success: true };
                },

                getReflog: async (message) => {
                    const gitService = GitService.getInstance();
                    const ref = typeof message.ref === 'string' && message.ref.trim() ? message.ref.trim() : 'HEAD';
                    const maxCount = message.maxCount || 50;
                    const skip = message.skip || 0;
                    const result = await gitService.getReflog(log, ref, maxCount, skip);
                    log(`Successfully retrieved ${result.entries.length} reflog entries for ${ref}`);
                    return { type: 'reflog', entries: result.entries, hasMore: result.hasMore, skip };
                },

                getWorktrees: async () => {
                    const gitService = GitService.getInstance();
                    const worktrees = await gitService.getWorktrees(log);
                    log(`Successfully retrieved ${worktrees.length} worktrees`);
                    return { type: 'worktrees', worktrees };
                },

                addWorktree: async (message) => {
                    const gitService = GitService.getInstance();
                    const { worktreePath, branchName } = message;
                    if (!worktreePath || !branchName) {
                        throw new Error('Worktree path and branch name are required');
                    }
                    const resolvedPath = await gitService.addWorktree(log, worktreePath, branchName);
                    log(`Successfully created worktree at '${resolvedPath}' for branch '${branchName}'`);
                    return { type: 'worktreeAdded', worktreePath: resolvedPath };
                },

                removeWorktree: async (message) => {
                    const gitService = GitService.getInstance();
                    const { worktreePath, force, deleteBranch } = message;
                    if (!worktreePath) {
                        throw new Error('Worktree path is required');
                    }
                    await gitService.removeWorktree(log, worktreePath, force || false, deleteBranch);
                    log(`Successfully removed worktree at '${worktreePath}'`);
                    return { type: 'worktreeRemoved', success: true };
                },

                fetch: async () => {
                    const gitService = GitService.getInstance();
                    await gitService.fetch(log, getConfig().remoteFetchPrune);
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
                    await gitService.mergeBranch(
                        log,
                        branchName,
                        fastForwardIfPossible,
                        squash,
                        noCommit,
                        await resolveMergeCommitMessage(branchName)
                    );
                    log(`Successfully merged branch ${branchName}`);
                    return { type: 'mergeBranchSuccess' };
                },

                rebaseBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { branchName, ignoreDate, autoStash } = message;
                    await gitService.rebaseBranch(log, branchName, ignoreDate, autoStash || false);
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

                fetchIntoLocalBranchNeedsForce: async (message) => {
                    const gitService = GitService.getInstance();
                    const { remote, remoteBranch, localBranch } = message;
                    if (!remote || !remoteBranch || !localBranch) {
                        throw new Error('Remote, remote branch, and local branch are required');
                    }
                    const needsForce = await gitService.fetchIntoLocalBranchNeedsForce(
                        log,
                        remote,
                        remoteBranch,
                        localBranch
                    );
                    return { type: 'fetchIntoLocalBranchNeedsForce', needsForce };
                },

                fetchIntoLocalBranch: async (message) => {
                    const gitService = GitService.getInstance();
                    const { remote, remoteBranch, localBranch, forceFetch, checkout } = message;
                    if (!remote || !remoteBranch || !localBranch) {
                        throw new Error('Remote, remote branch, and local branch are required');
                    }
                    await gitService.fetchIntoLocalBranch(
                        log,
                        remote,
                        remoteBranch,
                        localBranch,
                        forceFetch || false,
                        checkout || false
                    );
                    log(
                        `Successfully fetched ${remote}/${remoteBranch} into local branch ${localBranch}${checkout ? ' and checked it out' : ''}`
                    );
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

                getTagRemotes: async () => {
                    const gitService = GitService.getInstance();
                    const tagRemotes = await gitService.getTagRemotes(log);
                    log(`Successfully retrieved remote tag status for ${tagRemotes.length} remote(s)`);
                    return { type: 'tagRemotes', tagRemotes };
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
                    const { tagName, deleteOnRemotes, deleteLocal } = message;
                    if (!tagName) {
                        throw new Error('Tag name is required');
                    }
                    const remotes: string[] = Array.isArray(deleteOnRemotes) ? deleteOnRemotes : [];
                    await gitService.deleteTag(log, tagName, remotes, deleteLocal !== false);
                    log(
                        `Successfully deleted tag ${tagName}${remotes.length > 0 ? ` from remote(s) ${remotes.join(', ')}` : ''}`
                    );
                    return { type: 'deleteTagSuccess', success: true };
                },

                resetUncommittedChanges: async (message) => {
                    const gitService = GitService.getInstance();
                    const { mode } = message;
                    const config = getConfig();
                    const discardUntracked = config.resetDiscardUntrackedFiles;
                    await gitService.resetUncommittedChanges(
                        log,
                        mode || 'mixed',
                        discardUntracked,
                        config.resetDiscardUntrackedDirectories
                    );
                    log(
                        `Successfully reset uncommitted changes${discardUntracked ? ' and cleaned untracked files' : ''} (${mode || 'mixed'} mode)`
                    );
                    return { type: 'resetUncommittedChangesSuccess', success: true };
                },

                getGitHubRepo: async () => {
                    const gitService = GitService.getInstance();
                    const remotes = await gitService.getGitRemotes(log);
                    const gitHubRemote = resolveGitHubRemote(remotes);

                    if (!gitHubRemote) {
                        log('No github.com remote, GitHub links are unavailable');
                        return { type: 'gitHubRepo', repo: null };
                    }

                    const defaultBranch = await gitService.getRemoteDefaultBranch(log, gitHubRemote.remote);
                    log(
                        `GitHub repository '${gitHubRemote.owner}/${gitHubRemote.repo}' on remote '${gitHubRemote.remote}'` +
                            ` (default branch: ${defaultBranch ?? 'unknown'})`
                    );
                    return { type: 'gitHubRepo', repo: { ...gitHubRemote, defaultBranch } };
                },

                getRepos: async () => {
                    const activeRepo = await syncActiveRepo();
                    gitWatcher?.watchActiveRepo();
                    log(`Successfully retrieved ${repoService.getRepos().length} repositories`);
                    return { type: 'repos', repos: repoService.getRepos(), activeRepo };
                },

                setActiveRepo: async (message) => {
                    const { repoPath } = message;
                    if (!repoPath || typeof repoPath !== 'string') throw new Error('Repository path is required');

                    const repo = repoService.setActiveRepo(repoPath);
                    if (!repo) throw new Error(`'${repoPath}' is not one of the repositories found in the workspace`);

                    GitService.getInstance().setActiveRepoPath(repo.path);
                    gitWatcher?.watchActiveRepo();
                    log(`Now showing the repository at '${repo.path}'`);
                    return { type: 'activeRepoChanged', activeRepo: repo };
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
                            fileTreeFolderCounts: config.fileTreeFolderCounts,
                            dragAndDropEnabled: config.dragAndDropEnabled,
                            dragAndDropBranchDefaultAction: config.dragAndDropBranchDefaultAction,
                            dragAndDropHoldDelay: config.dragAndDropHoldDelay,
                            dragAndDropHideDelay: config.dragAndDropHideDelay,
                            dragAndDropAutoMerge: config.dragAndDropAutoMerge,
                            dragAndDropAutoRebase: config.dragAndDropAutoRebase,
                            dragAndDropAutoCherryPick: config.dragAndDropAutoCherryPick,
                            dragAndDropAutoMergeCommit: config.dragAndDropAutoMergeCommit,
                            dragAndDropAutoPush: config.dragAndDropAutoPush,
                            dragAndDropAutoFetchIntoLocal: config.dragAndDropAutoFetchIntoLocal,
                            branchCreateCheckout: config.branchCreateCheckout,
                            branchDeleteForce: config.branchDeleteForce,
                            branchDeleteOnRemote: config.branchDeleteOnRemote,
                            branchPushSetUpstream: config.branchPushSetUpstream,
                            branchPushMode: config.branchPushMode,
                            mergeFastForwardIfPossible: config.mergeFastForwardIfPossible,
                            mergeSquash: config.mergeSquash,
                            mergeNoCommit: config.mergeNoCommit,
                            rebaseIgnoreDate: config.rebaseIgnoreDate,
                            rebaseAutoStash: config.rebaseAutoStash,
                            cherryPickRecordOrigin: config.cherryPickRecordOrigin,
                            cherryPickNoCommit: config.cherryPickNoCommit,
                            revertNoCommit: config.revertNoCommit,
                            rewordAllowPushed: config.rewordAllowPushed,
                            resetMode: config.resetMode,
                            remoteDefaultRemote: config.remoteDefaultRemote,
                            remoteFetchForceFetch: config.remoteFetchForceFetch,
                            remoteFetchCheckout: config.remoteFetchCheckout,
                            remoteFetchConfirmOnlyIfForceNeeded: config.remoteFetchConfirmOnlyIfForceNeeded,
                            stashIncludeUntracked: config.stashIncludeUntracked,
                            stashReinstateIndex: config.stashReinstateIndex,
                            tagType: config.tagType,
                            tagPushAllRemotes: config.tagPushAllRemotes,
                            tagDeleteOnRemotes: config.tagDeleteOnRemotes,
                            worktreeDefaultPath: config.worktreeDefaultPath,
                            worktreeOpenBehavior: config.worktreeOpenBehavior,
                            worktreeOpenAfterCreate: config.worktreeOpenAfterCreate,
                            worktreeRemoveForce: config.worktreeRemoveForce,
                            worktreeRemoveDeleteBranch: config.worktreeRemoveDeleteBranch,
                            githubCommitLinks: config.githubCommitLinks,
                            githubRefLinks: config.githubRefLinks,
                            githubFileLinks: config.githubFileLinks,
                            githubIssueLinks: config.githubIssueLinks,
                            githubCreatePullRequest: config.githubCreatePullRequest,
                            reflogEnabled: config.reflogEnabled,
                            undoEnabled: config.undoEnabled,
                            undoKeyboardShortcut: config.undoKeyboardShortcut,
                            undoShow: config.undoShow,
                            confirmMerge: config.confirmMerge,
                            confirmRebase: config.confirmRebase,
                            confirmPush: config.confirmPush,
                            confirmBranchDelete: config.confirmBranchDelete,
                            expandedCommitHeight: config.expandedCommitHeight,
                            joinUncommittedChanges: config.joinUncommittedChanges,
                            scrollToTopButton: config.scrollToTopButton,
                            scrollToCurrentBranchButton: config.scrollToCurrentBranchButton,
                            showAuthorName: config.showAuthorName,
                            theme: config.theme,
                            customColors: config.customColors
                        }
                    };
                },

                openSettings: async (message) => {
                    await vscode.commands.executeCommand('workbench.action.openSettings', message.query);
                    log('Successfully opened VS Code settings');
                    return { type: 'settingsOpened' };
                },

                getTheme: async () => {
                    const isDark =
                        vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ||
                        vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast;
                    return { type: 'theme', isDark };
                }
            };

            const specialHandlers: Record<string, (message: any) => void> = {
                saveRepoState: (message) => {
                    const saveRepoPath = getStatePath();
                    if (!saveRepoPath) {
                        log('No repository found, cannot save state');
                        return;
                    }
                    context.globalState.update(`${saveRepoPath}:${message.key}`, message.value);
                },

                loadRepoState: (message) => {
                    const loadRepoPath = getStatePath();
                    if (!loadRepoPath) {
                        log('No repository found, cannot load state');
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

                openExternal: async (message) => {
                    const url = message.url;
                    const fallbackUrl = message.fallbackUrl;

                    if (typeof url !== 'string' || !isGitHubUrl(url)) {
                        log(`Refusing to open '${url}': only github.com links are opened from the graph`);
                        return;
                    }

                    // A page that may not be there (a tag with no release) comes with the one that
                    // always is, so the link lands somewhere useful either way. When the question
                    // cannot be answered — offline, or the request blocked — the first URL wins.
                    let target = url;
                    if (typeof fallbackUrl === 'string' && isGitHubUrl(fallbackUrl)) {
                        const exists = await probeUrl(url);
                        if (exists === false) target = fallbackUrl;
                    }

                    try {
                        log(`Opening ${target} in the browser`);
                        await vscode.env.openExternal(vscode.Uri.parse(target));
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        log(`Error opening ${target}: ${errorMessage}`);
                        vscode.window.showErrorMessage(`Failed to open the link: ${errorMessage}`);
                    }
                },

                openWorktree: async (message) => {
                    const worktreePath = message.worktreePath;
                    if (!worktreePath || typeof worktreePath !== 'string') throw new Error('Worktree path is required');

                    const newWindow = message.newWindow !== false;
                    log(`Opening worktree '${worktreePath}'${newWindow ? ' in a new window' : ''}`);
                    try {
                        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(worktreePath), {
                            forceNewWindow: newWindow
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        log(`Error opening worktree: ${errorMessage}`);
                        vscode.window.showErrorMessage(`Failed to open worktree: ${errorMessage}`);
                    }
                },

                openFile: async (message) => {
                    const filePath = message.filePath;
                    const fileName = filePath.split('/').pop() || filePath;
                    const oldPath = message.oldPath;
                    const status = message.status;
                    const commitHash = message.commitHash;
                    const isRootCommit = message.isRootCommit ?? false;
                    const isStash = message.isStash ?? false;

                    if (!filePath) throw new Error('File path is required');

                    // Paths git reports are relative to the repository being shown, not the workspace
                    const workspaceUri = vscode.Uri.file(GitService.getInstance().getRepoPath());
                    const fileUri = vscode.Uri.joinPath(workspaceUri, filePath);

                    const makeGitUri = (path: string, ref: string) => {
                        const uri = vscode.Uri.joinPath(workspaceUri, path);
                        return uri.with({
                            scheme: 'git',
                            query: JSON.stringify({ path: uri.fsPath, ref })
                        });
                    };

                    const emptyUri = vscode.Uri.parse('untitled:empty');

                    // Open next to the graph: reuse an existing split group if there is one,
                    // otherwise create a new one beside the graph.
                    const resolveSplitViewColumn = (): vscode.ViewColumn => {
                        const panelColumn = currentPanel?.viewColumn;
                        if (panelColumn === undefined) return vscode.ViewColumn.Beside;

                        const otherColumns = vscode.window.tabGroups.all
                            .map((group) => group.viewColumn)
                            .filter((column) => column !== panelColumn);
                        const toTheRight = otherColumns
                            .filter((column) => column > panelColumn)
                            .sort((a, b) => a - b);
                        const toTheLeft = otherColumns
                            .filter((column) => column < panelColumn)
                            .sort((a, b) => b - a);
                        return toTheRight[0] ?? toTheLeft[0] ?? vscode.ViewColumn.Beside;
                    };

                    const showOptions: vscode.TextDocumentShowOptions = getConfig().fileOpenInSplitView
                        ? { viewColumn: resolveSplitViewColumn() }
                        : {};

                    // ── Comparison between two arbitrary refs ────────────────
                    const compareFrom = message.compareFrom;
                    const compareTo = message.compareTo;
                    if (compareFrom && compareTo) {
                        const range = `${compareFrom.substring(0, 7)} → ${compareTo.substring(0, 7)}`;

                        if (status === 'A') {
                            await vscode.commands.executeCommand(
                                'vscode.diff',
                                emptyUri,
                                makeGitUri(filePath, compareTo),
                                `${fileName} (added, ${range})`,
                                showOptions
                            );
                        } else if (status === 'D') {
                            await vscode.commands.executeCommand(
                                'vscode.diff',
                                makeGitUri(filePath, compareFrom),
                                emptyUri,
                                `${fileName} (deleted, ${range})`,
                                showOptions
                            );
                        } else if ((status === 'R' || status === 'C') && oldPath) {
                            const label =
                                status === 'R'
                                    ? `${fileName} (renamed, ${range})`
                                    : `${fileName} (copied from ${oldPath}, ${range})`;
                            await vscode.commands.executeCommand(
                                'vscode.diff',
                                makeGitUri(oldPath, compareFrom),
                                makeGitUri(filePath, compareTo),
                                label,
                                showOptions
                            );
                        } else {
                            await vscode.commands.executeCommand(
                                'vscode.diff',
                                makeGitUri(filePath, compareFrom),
                                makeGitUri(filePath, compareTo),
                                `${fileName} (${range})`,
                                showOptions
                            );
                        }

                        log(`Opened comparison diff for ${fileName} [${status}] ${range}`);
                        return;
                    }

                    if (commitHash) {
                        if (message.isUncommitted) {
                            // ── Uncommitted changes ──────────────────────────────────
                            if (status === 'A') {
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    emptyUri,
                                    fileUri,
                                    `${fileName} (new file)`,
                                    showOptions
                                );
                            } else if (status === 'D') {
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    makeGitUri(filePath, 'HEAD'),
                                    emptyUri,
                                    `${fileName} (deleted)`,
                                    showOptions
                                );
                            } else if ((status === 'R' || status === 'C') && oldPath) {
                                const label =
                                    status === 'R'
                                        ? `${oldPath} → ${fileName} (renamed)`
                                        : `${fileName} (copied from ${oldPath})`;
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    makeGitUri(oldPath, 'HEAD'),
                                    fileUri,
                                    label,
                                    showOptions
                                );
                            } else {
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    makeGitUri(filePath, 'HEAD'),
                                    fileUri,
                                    `${fileName} (uncommitted changes)`,
                                    showOptions
                                );
                            }
                        } else {
                            // ── Committed changes ────────────────────────────────────
                            const actualRef = message.sourceCommit || commitHash;

                            if (status === 'D') {
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    makeGitUri(filePath, `${actualRef}^`),
                                    emptyUri,
                                    `${fileName} (deleted in ${commitHash.substring(0, 7)})`,
                                    showOptions
                                );
                            } else if (status === 'A') {
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    emptyUri,
                                    makeGitUri(filePath, actualRef),
                                    `${fileName} (added in ${commitHash.substring(0, 7)})`,
                                    showOptions
                                );
                            } else if ((status === 'R' || status === 'C') && oldPath) {
                                const label =
                                    status === 'R'
                                        ? `${fileName} (renamed in ${commitHash.substring(0, 7)})`
                                        : `${fileName} (copied from ${oldPath} in ${commitHash.substring(0, 7)})`;
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    makeGitUri(oldPath, `${actualRef}^`),
                                    makeGitUri(filePath, actualRef),
                                    label,
                                    showOptions
                                );
                            } else {
                                const leftUri = isRootCommit ? emptyUri : makeGitUri(filePath, `${actualRef}^`);
                                await vscode.commands.executeCommand(
                                    'vscode.diff',
                                    leftUri,
                                    makeGitUri(filePath, actualRef),
                                    `${fileName} (${commitHash.substring(0, 7)})`,
                                    showOptions
                                );
                            }
                        }

                        log(
                            `Opened diff for ${fileName} [${status}] at ${commitHash.substring(0, 7)}${isStash ? ' (stash)' : ''}`
                        );
                    } else {
                        // ── No commit hash — open working copy directly ──────────
                        const document = await vscode.workspace.openTextDocument(fileUri);
                        await vscode.window.showTextDocument(document, showOptions);
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
            // A repository anywhere in the workspace is enough, it does not have to be its root
            const activeRepo = await syncActiveRepo();

            if (activeRepo) {
                log('Auto-opening Git Go as the workspace has a git repository and auto-open is enabled');
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

/**
 * Pull the branch that was just checked out, when the user asked for it and the branch has an upstream.
 * A failed pull must not fail the checkout that already succeeded, so errors are only logged.
 */
async function pullAfterCheckout(log: (message: string) => void): Promise<void> {
    if (!getConfig().branchPullAfterCheckout) return;

    const gitService = GitService.getInstance();

    try {
        if (!(await gitService.hasUpstreamBranch())) {
            log('Skipping the pull after checkout: the branch has no upstream');
            return;
        }

        await gitService.pullCurrentBranch(log);
    } catch (error) {
        log(`Could not pull after checkout: ${error}`);
    }
}

/**
 * Resolve the configured merge commit message template, or undefined when git should write the message itself.
 */
async function resolveMergeCommitMessage(source: string): Promise<string | undefined> {
    const template = getConfig().mergeCommitMessage.trim();
    if (!template) return undefined;

    const target = (await GitService.getInstance().getCurrentBranch(() => {})) ?? '';
    return template.replace(/{source}/g, source).replace(/{target}/g, target);
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

/**
 * Watch the repository Git Go is showing, so the webview is told whenever its state changes.
 * @returns A way to move the watchers onto another repository, for when the shown one changes.
 */
function watchGitChanges(panel: vscode.WebviewPanel, log: (msg: string) => void): { watchActiveRepo: () => void } {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;

    const disposables: vscode.Disposable[] = [];
    /** Watchers of the git dirs of the repository being shown, replaced when another one is shown */
    let repoDisposables: vscode.Disposable[] = [];
    let debounceTimer: NodeJS.Timeout | undefined;
    let disposed = false;
    /** Only the newest watching round may install watchers, as resolving the git dirs is async */
    let watchGeneration = 0;

    const notifyChange = () => {
        if (!panel.visible) return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            panel.webview.postMessage({ type: 'gitChanged' });
            log('Git state changed — notified webview');
        }, 300);
    };

    if (gitExtension) {
        const git = gitExtension.getAPI(1);

        for (const repo of git.repositories) {
            disposables.push(repo.state.onDidChange(notifyChange));
        }

        disposables.push(
            git.onDidOpenRepository((repo: any) => {
                disposables.push(repo.state.onDidChange(notifyChange));
            })
        );
    } else {
        log('Git extension not found');
    }

    const watchActiveRepo = () => {
        if (disposed) return;

        const generation = ++watchGeneration;
        repoDisposables.forEach((d) => d.dispose());
        repoDisposables = [];

        const repoPath = GitService.getInstance().tryGetRepoPath();
        if (!repoPath) return;

        const onRefChange = () => notifyChange();

        const watchAll = (base: vscode.Uri, glob: string) => {
            const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(base, glob));
            repoDisposables.push(
                watcher.onDidCreate(onRefChange),
                watcher.onDidChange(onRefChange),
                watcher.onDidDelete(onRefChange),
                watcher
            );
        };

        const addGitDirWatchers = (gitDir: vscode.Uri, commonDir: vscode.Uri) => {
            if (disposed || generation !== watchGeneration) return;

            // Refs live in the common git dir (shared across worktrees); HEAD is per-worktree
            watchAll(commonDir, 'refs/**/*');
            watchAll(commonDir, 'refs');
            watchAll(commonDir, 'packed-refs');
            watchAll(commonDir, 'worktrees/**');
            watchAll(gitDir, 'HEAD');
            watchAll(gitDir, 'logs/HEAD');

            // Markers for an operation halted mid-way, so the abort button appears and clears promptly
            watchAll(gitDir, 'MERGE_HEAD');
            watchAll(gitDir, 'CHERRY_PICK_HEAD');
            watchAll(gitDir, 'sequencer');
            watchAll(gitDir, 'sequencer/**');
            watchAll(gitDir, 'rebase-merge');
            watchAll(gitDir, 'rebase-merge/**');
            watchAll(gitDir, 'rebase-apply');
            watchAll(gitDir, 'rebase-apply/**');
        };

        // Resolve the real git dirs so watching works when the repository is a linked worktree
        // (where .git is a file pointing at <main>/.git/worktrees/<name>)
        GitService.getInstance()
            .getGitDirs()
            .then(({ gitDir, commonDir }) => {
                addGitDirWatchers(vscode.Uri.file(gitDir), vscode.Uri.file(commonDir));
                log(`Watching git dirs (git-dir: ${gitDir}, common-dir: ${commonDir})`);
            })
            .catch((error) => {
                log(`Could not resolve git dirs, falling back to the repository's .git watchers: ${error}`);
                const fallback = vscode.Uri.joinPath(vscode.Uri.file(repoPath), '.git');
                addGitDirWatchers(fallback, fallback);
            });
    };

    watchActiveRepo();

    panel.onDidDispose(() => {
        disposed = true;
        if (debounceTimer) clearTimeout(debounceTimer);
        disposables.forEach((d) => d.dispose());
        repoDisposables.forEach((d) => d.dispose());
    });

    disposables.push(
        panel.onDidChangeViewState((e) => {
            if (e.webviewPanel.visible) notifyChange();
        })
    );

    return { watchActiveRepo };
}
