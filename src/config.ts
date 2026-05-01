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
     * Get the value of the `git-go.remote.fetch.forceFetch` Extension Setting.
     */
    get remoteFetchForceFetch(): boolean {
        return !!this.config.get('remote.fetch.forceFetch', false);
    }

    /**
     * Get the value of the `git-go.stash.includeUntracked` Extension Setting.
     */
    get stashIncludeUntracked(): boolean {
        return !!this.config.get('stash.includeUntracked', true);
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
