import * as vscode from 'vscode';
import type { GitUndoActionKind } from './gitService';

/**
 * Represents the user's configuration of Git Go Extension Settings.
 */
export class Config {
    private readonly config: vscode.WorkspaceConfiguration;

    /**
     * Creates a Config instance.
     * @param resourcePath An optional path to a workspace folder (for workspace-specific settings).
     */
    constructor(resourcePath?: string) {
        const resource = resourcePath ? vscode.Uri.file(resourcePath) : undefined;
        this.config = vscode.workspace.getConfiguration('git-go', resource);
    }

    /**
     * Read a setting that used to live under a different name, so a value set before the rename keeps working.
     * The current name wins as soon as it is set anywhere, and the old one is only read while it is not.
     * @param section The current name of the setting, without the `git-go.` prefix.
     * @param deprecatedSection The name the setting used to have, without the `git-go.` prefix.
     * @param defaultValue The value to fall back to when neither name is set.
     */
    private getRenamed<T>(section: string, deprecatedSection: string, defaultValue: T): T {
        if (!this.isSet(section)) {
            const deprecated = this.config.get<T>(deprecatedSection);
            if (this.isSet(deprecatedSection) && deprecated !== undefined) return deprecated;
        }

        return this.config.get(section, defaultValue);
    }

    /**
     * Whether a setting has a value of its own anywhere, rather than just its default.
     */
    private isSet(section: string): boolean {
        const inspected = this.config.inspect(section);
        if (!inspected) return false;

        return (
            inspected.globalValue !== undefined ||
            inspected.workspaceValue !== undefined ||
            inspected.workspaceFolderValue !== undefined ||
            inspected.globalLanguageValue !== undefined ||
            inspected.workspaceLanguageValue !== undefined ||
            inspected.workspaceFolderLanguageValue !== undefined
        );
    }

    /**
     * Get the value of the `git-go.graph.rounded` Extension Setting.
     */
    get rounded(): boolean {
        return !!this.config.get('graph.rounded', true);
    }

    /**
     * Get the value of the `git-go.autoOpen.enabled` Extension Setting.
     */
    get autoOpenEnabled(): boolean {
        return !!this.config.get('autoOpen.enabled', false);
    }

    /**
     * Get the value of the `git-go.autoOpen.pinTab` Extension Setting.
     */
    get pinTabEnabled(): boolean {
        return !!this.config.get('autoOpen.pinTab', true);
    }

    /**
     * Get the value of the `git-go.statusBar.enabled` Extension Setting.
     */
    get statusBarEnabled(): boolean {
        return !!this.config.get('statusBar.enabled', true);
    }

    /**
     * Get the value of the `git-go.file.openInSplitView` Extension Setting.
     */
    get fileOpenInSplitView(): boolean {
        return !!this.config.get('file.openInSplitView', true);
    }

    /**
     * Get the value of the `git-go.repo.scanDepth` Extension Setting.
     */
    get repoScanDepth(): number {
        const value = this.config.get('repo.scanDepth', 3);
        return Number.isFinite(value) ? Math.max(0, Math.min(8, Math.floor(value))) : 3;
    }

    /**
     * Get the value of the `git-go.dragAndDrop.enabled` Extension Setting.
     */
    get dragAndDropEnabled(): boolean {
        return !!this.config.get('dragAndDrop.enabled', true);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.branchOnBranch.defaultAction` Extension Setting.
     */
    get dragAndDropBranchDefaultAction(): 'merge' | 'rebase' | 'none' {
        const value = this.config.get<string>('dragAndDrop.branchOnBranch.defaultAction', 'merge');
        if (value === 'merge' || value === 'rebase' || value === 'none') {
            return value;
        }
        return 'merge';
    }

    /**
     * Get the value of the `git-go.dragAndDrop.holdDelay` Extension Setting.
     */
    get dragAndDropHoldDelay(): number {
        return this.config.get('dragAndDrop.holdDelay', 300);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.hideDelay` Extension Setting.
     */
    get dragAndDropHideDelay(): number {
        return this.config.get('dragAndDrop.hideDelay', 300);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.merge` Extension Setting.
     */
    get dragAndDropAutoMerge(): boolean {
        return !!this.config.get('dragAndDrop.auto.merge', false);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.rebase` Extension Setting.
     */
    get dragAndDropAutoRebase(): boolean {
        return !!this.config.get('dragAndDrop.auto.rebase', false);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.cherryPick` Extension Setting.
     */
    get dragAndDropAutoCherryPick(): boolean {
        return !!this.config.get('dragAndDrop.auto.cherryPick', false);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.mergeCommit` Extension Setting.
     */
    get dragAndDropAutoMergeCommit(): boolean {
        return !!this.config.get('dragAndDrop.auto.mergeCommit', false);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.push` Extension Setting.
     */
    get dragAndDropAutoPush(): boolean {
        return !!this.config.get('dragAndDrop.auto.push', false);
    }

    /**
     * Get the value of the `git-go.dragAndDrop.auto.fetchIntoLocal` Extension Setting.
     */
    get dragAndDropAutoFetchIntoLocal(): boolean {
        return !!this.config.get('dragAndDrop.auto.fetchIntoLocal', false);
    }

    /**
     * Get the value of the `git-go.branch.create.checkout` Extension Setting.
     */
    get branchCreateCheckout(): boolean {
        return !!this.config.get('branch.create.checkout', true);
    }

    /**
     * Get the value of the `git-go.branch.delete.force` Extension Setting.
     */
    get branchDeleteForce(): boolean {
        return !!this.config.get('branch.delete.force', false);
    }

    /**
     * Get the value of the `git-go.branch.delete.onRemote` Extension Setting.
     */
    get branchDeleteOnRemote(): boolean {
        return !!this.getRenamed('branch.delete.onRemote', 'branch.delete.deleteOnRemote', false);
    }

    /**
     * Get the value of the `git-go.branch.checkout.pullAfterCheckout` Extension Setting.
     */
    get branchPullAfterCheckout(): boolean {
        return !!this.config.get('branch.checkout.pullAfterCheckout', false);
    }

    /**
     * Get the value of the `git-go.branch.push.setUpstream` Extension Setting.
     */
    get branchPushSetUpstream(): boolean {
        return !!this.config.get('branch.push.setUpstream', true);
    }

    /**
     * Get the value of the `git-go.branch.push.mode` Extension Setting.
     */
    get branchPushMode(): 'normal' | 'force-with-lease' | 'force' {
        const value = this.config.get<string>('branch.push.mode', 'normal');
        if (value === 'normal' || value === 'force-with-lease' || value === 'force') {
            return value;
        }
        return 'normal';
    }

    /**
     * Get the value of the `git-go.merge.fastForwardIfPossible` Extension Setting.
     */
    get mergeFastForwardIfPossible(): boolean {
        return !!this.config.get('merge.fastForwardIfPossible', true);
    }

    /**
     * Get the value of the `git-go.merge.squash` Extension Setting.
     */
    get mergeSquash(): boolean {
        return !!this.config.get('merge.squash', false);
    }

    /**
     * Get the value of the `git-go.merge.noCommit` Extension Setting.
     */
    get mergeNoCommit(): boolean {
        return !!this.config.get('merge.noCommit', false);
    }

    /**
     * Get the value of the `git-go.merge.commitMessage` Extension Setting.
     */
    get mergeCommitMessage(): string {
        return this.config.get('merge.commitMessage', '');
    }

    /**
     * Get the value of the `git-go.rebase.ignoreDate` Extension Setting.
     */
    get rebaseIgnoreDate(): boolean {
        return !!this.getRenamed('rebase.ignoreDate', 'branch.rebase.ignoreDate', true);
    }

    /**
     * Get the value of the `git-go.rebase.autoStash` Extension Setting.
     */
    get rebaseAutoStash(): boolean {
        return !!this.config.get('rebase.autoStash', false);
    }

    /**
     * Get the value of the `git-go.cherryPick.recordOrigin` Extension Setting.
     */
    get cherryPickRecordOrigin(): boolean {
        return !!this.config.get('cherryPick.recordOrigin', false);
    }

    /**
     * Get the value of the `git-go.cherryPick.noCommit` Extension Setting.
     */
    get cherryPickNoCommit(): boolean {
        return !!this.config.get('cherryPick.noCommit', true);
    }

    /**
     * Get the value of the `git-go.revert.noCommit` Extension Setting.
     */
    get revertNoCommit(): boolean {
        return !!this.config.get('revert.noCommit', true);
    }

    /**
     * Get the value of the `git-go.reword.allowPushed` Extension Setting.
     */
    get rewordAllowPushed(): boolean {
        return !!this.config.get('reword.allowPushed', false);
    }

    /**
     * Get the value of the `git-go.reset.mode` Extension Setting.
     */
    get resetMode(): 'soft' | 'mixed' | 'hard' {
        const value = this.config.get<string>('reset.mode', 'mixed');
        if (value === 'soft' || value === 'mixed' || value === 'hard') {
            return value;
        }
        return 'mixed';
    }

    /**
     * Get the value of the `git-go.reset.discardUntrackedFiles` Extension Setting.
     */
    get resetDiscardUntrackedFiles(): boolean {
        return !!this.config.get('reset.discardUntrackedFiles', true);
    }

    /**
     * Get the value of the `git-go.reset.discardUntrackedDirectories` Extension Setting.
     */
    get resetDiscardUntrackedDirectories(): boolean {
        return !!this.config.get('reset.discardUntrackedDirectories', true);
    }

    /**
     * Get the value of the `git-go.remote.defaultRemote` Extension Setting.
     */
    get remoteDefaultRemote(): string {
        return this.config.get('remote.defaultRemote', 'origin');
    }

    /**
     * Get the value of the `git-go.remote.fetch.onOpen` Extension Setting.
     */
    get remoteFetchOnOpen(): boolean {
        return !!this.getRenamed('remote.fetch.onOpen', 'fetch.onOpen', false);
    }

    /**
     * Get the value of the `git-go.remote.fetch.prune` Extension Setting.
     */
    get remoteFetchPrune(): boolean {
        return !!this.config.get('remote.fetch.prune', false);
    }

    /**
     * Get the value of the `git-go.remote.fetch.forceFetch` Extension Setting.
     */
    get remoteFetchForceFetch(): boolean {
        return !!this.config.get('remote.fetch.forceFetch', false);
    }

    /**
     * Get the value of the `git-go.remote.fetch.checkout` Extension Setting.
     */
    get remoteFetchCheckout(): boolean {
        return !!this.config.get('remote.fetch.checkout', true);
    }

    /**
     * Get the value of the `git-go.remote.fetch.confirmOnlyIfForceNeeded` Extension Setting.
     */
    get remoteFetchConfirmOnlyIfForceNeeded(): boolean {
        return !!this.config.get('remote.fetch.confirmOnlyIfForceNeeded', false);
    }

    /**
     * Get the value of the `git-go.stash.includeUntracked` Extension Setting.
     */
    get stashIncludeUntracked(): boolean {
        return !!this.config.get('stash.includeUntracked', true);
    }

    /**
     * Get the value of the `git-go.stash.reinstateIndex` Extension Setting.
     */
    get stashReinstateIndex(): boolean {
        return !!this.config.get('stash.reinstateIndex', false);
    }

    /**
     * Get the value of the `git-go.tag.type` Extension Setting.
     */
    get tagType(): 'annotated' | 'lightweight' {
        const value = this.config.get<string>('tag.type', 'annotated');
        if (value === 'annotated' || value === 'lightweight') {
            return value;
        }
        return 'annotated';
    }

    /**
     * Get the value of the `git-go.tag.push.allRemotes` Extension Setting.
     */
    get tagPushAllRemotes(): boolean {
        return !!this.config.get('tag.push.allRemotes', false);
    }

    /**
     * Get the value of the `git-go.tag.delete.onRemotes` Extension Setting.
     */
    get tagDeleteOnRemotes(): boolean {
        return !!this.config.get('tag.delete.onRemotes', false);
    }

    /**
     * Get the value of the `git-go.worktree.defaultPath` Extension Setting.
     */
    get worktreeDefaultPath(): string {
        return this.config.get('worktree.defaultPath', '../{repo}.worktrees/{branch}');
    }

    /**
     * Get the value of the `git-go.worktree.openBehavior` Extension Setting.
     */
    get worktreeOpenBehavior(): 'ask' | 'newWindow' | 'currentWindow' {
        const value = this.config.get<string>('worktree.openBehavior', 'ask');
        if (value === 'ask' || value === 'newWindow' || value === 'currentWindow') {
            return value;
        }
        return 'ask';
    }

    /**
     * Get the value of the `git-go.worktree.create.openAfterCreate` Extension Setting.
     */
    get worktreeOpenAfterCreate(): boolean {
        return !!this.config.get('worktree.create.openAfterCreate', true);
    }

    /**
     * Get the value of the `git-go.worktree.remove.force` Extension Setting.
     */
    get worktreeRemoveForce(): boolean {
        return !!this.config.get('worktree.remove.force', false);
    }

    /**
     * Get the value of the `git-go.worktree.remove.deleteBranch` Extension Setting.
     */
    get worktreeRemoveDeleteBranch(): boolean {
        return !!this.config.get('worktree.remove.deleteBranch', false);
    }

    /**
     * Get the value of the `git-go.github.commitLinks` Extension Setting.
     */
    get githubCommitLinks(): boolean {
        return !!this.config.get('github.commitLinks', true);
    }

    /**
     * Get the value of the `git-go.github.refLinks` Extension Setting.
     */
    get githubRefLinks(): boolean {
        return !!this.config.get('github.refLinks', true);
    }

    /**
     * Get the value of the `git-go.github.fileLinks` Extension Setting.
     */
    get githubFileLinks(): boolean {
        return !!this.config.get('github.fileLinks', true);
    }

    /**
     * Get the value of the `git-go.github.issueLinks` Extension Setting.
     */
    get githubIssueLinks(): boolean {
        return !!this.config.get('github.issueLinks', true);
    }

    /**
     * Get the value of the `git-go.github.createPullRequest` Extension Setting.
     */
    get githubCreatePullRequest(): boolean {
        return !!this.config.get('github.createPullRequest', true);
    }

    /**
     * Get the value of the `git-go.reflog.enabled` Extension Setting.
     */
    get reflogEnabled(): boolean {
        return !!this.config.get('reflog.enabled', true);
    }

    /**
     * Get the value of the `git-go.undo.enabled` Extension Setting.
     */
    get undoEnabled(): boolean {
        return !!this.config.get('undo.enabled', true);
    }

    /**
     * Get the value of the `git-go.undo.keyboardShortcut` Extension Setting.
     */
    get undoKeyboardShortcut(): boolean {
        return !!this.config.get('undo.keyboardShortcut', true);
    }

    /**
     * Get the value of the `git-go.undo.allowPushed` Extension Setting.
     */
    get undoAllowPushed(): boolean {
        return !!this.config.get('undo.allowPushed', false);
    }

    /**
     * Get the value of every `git-go.undo.show.*` Extension Setting, keyed by the action it covers.
     */
    get undoShow(): Record<GitUndoActionKind, boolean> {
        return {
            commit: !!this.config.get('undo.show.commit', true),
            amend: !!this.config.get('undo.show.amend', true),
            merge: !!this.config.get('undo.show.merge', true),
            rebase: !!this.config.get('undo.show.rebase', true),
            'cherry-pick': !!this.config.get('undo.show.cherryPick', true),
            revert: !!this.config.get('undo.show.revert', true),
            reset: !!this.config.get('undo.show.reset', true),
            pull: !!this.config.get('undo.show.pull', true),
            other: !!this.config.get('undo.show.other', true)
        };
    }

    /**
     * Get the value of the `git-go.confirm.merge` Extension Setting.
     */
    get confirmMerge(): boolean {
        return !!this.config.get('confirm.merge', true);
    }

    /**
     * Get the value of the `git-go.confirm.rebase` Extension Setting.
     */
    get confirmRebase(): boolean {
        return !!this.config.get('confirm.rebase', true);
    }

    /**
     * Get the value of the `git-go.confirm.push` Extension Setting.
     */
    get confirmPush(): boolean {
        return !!this.config.get('confirm.push', true);
    }

    /**
     * Get the value of the `git-go.confirm.branchDelete` Extension Setting.
     */
    get confirmBranchDelete(): boolean {
        return !!this.config.get('confirm.branchDelete', true);
    }

    /**
     * Get the value of the `git-go.graph.expandedCommitHeight` Extension Setting.
     */
    get expandedCommitHeight(): number {
        return this.config.get('graph.expandedCommitHeight', 300);
    }

    /**
     * Get the value of the `git-go.graph.joinUncommittedChanges` Extension Setting.
     */
    get joinUncommittedChanges(): boolean {
        return !!this.config.get('graph.joinUncommittedChanges', true);
    }

    /**
     * Get the value of the `git-go.graph.showAuthorName` Extension Setting.
     */
    get showAuthorName(): boolean {
        return !!this.getRenamed('graph.showAuthorName', 'graph.showCommitterName', true);
    }

    /**
     * Get the value of the `git-go.graph.remoteAvatars` Extension Setting.
     */
    get remoteAvatars(): boolean {
        return !!this.config.get('graph.remoteAvatars', true);
    }

    /**
     * Get the value of the `git-go.graph.theme` Extension Setting.
     */
    get theme(): string {
        return this.config.get('graph.theme', 'vibrant');
    }

    /**
     * Get the value of the `git-go.graph.customColors` Extension Setting.
     */
    get customColors(): string[] {
        return this.config.get('graph.customColors', []);
    }
}

/**
 * Get a Config instance for retrieving the user's configuration of Git Go Extension Settings.
 * @param resourcePath An optional path to a workspace folder (for workspace-specific settings).
 * @returns A Config instance.
 */
export function getConfig(resourcePath?: string): Config {
    return new Config(resourcePath);
}
