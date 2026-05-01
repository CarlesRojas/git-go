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
}

/**
 * Get a Config instance for retrieving the user's configuration of Git Go Extension Settings.
 * @param resourcePath An optional path to a workspace folder (for workspace-specific settings).
 * @returns A Config instance.
 */
export function getConfig(resourcePath?: string): Config {
    return new Config(resourcePath);
}
