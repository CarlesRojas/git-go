import * as vscode from 'vscode';

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
     * Get the value of the `git-go.branch.push.setUpstream` Extension Setting.
     */
    get branchPushSetUpstream(): boolean {
        return !!this.config.get('branch.push.setUpstream', true);
    }

    /**
     * Get the value of the `git-go.branch.rebase.ignoreDate` Extension Setting.
     */
    get branchRebaseIgnoreDate(): boolean {
        return !!this.config.get('branch.rebase.ignoreDate', true);
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
     * Get the value of the `git-go.worktree.defaultPath` Extension Setting.
     */
    get worktreeDefaultPath(): string {
        return this.config.get('worktree.defaultPath', '../{repo}.worktrees/{branch}');
    }

    /**
     * Get the value of the `git-go.worktree.openNewWindow` Extension Setting.
     */
    get worktreeOpenNewWindow(): boolean {
        return !!this.config.get('worktree.openNewWindow', true);
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
     * Get the value of the `git-go.graph.expandedCommitHeight` Extension Setting.
     */
    get expandedCommitHeight(): number {
        return this.config.get('graph.expandedCommitHeight', 300);
    }

    /**
     * Get the value of the `git-go.graph.showCommitterName` Extension Setting.
     */
    get showCommitterName(): boolean {
        return !!this.config.get('graph.showCommitterName', true);
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
