import * as vscode from 'vscode';
import { getConfig } from './config';

// Global reference to track existing status bar item
let existingStatusBarItem: StatusBarItem | null = null;

/**
 * Manages the Git Go Status Bar Item, which allows users to open the Git Go Graph from the Visual Studio Code Status Bar.
 */
export class StatusBarItem {
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly log: (message: string) => void;
    private isVisible: boolean = false;
    private isGitRepo: boolean = false;

    /**
     * Creates the Git Go Status Bar Item.
     * @param log The logging function.
     */
    constructor(log: (message: string) => void) {
        this.log = log;

        // Dispose of any existing status bar item to prevent duplicates
        if (existingStatusBarItem) {
            this.log('Disposing existing status bar item to prevent duplicates');
            existingStatusBarItem.dispose();
            existingStatusBarItem = null;
        }

        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = 'Git Go';
        this.statusBarItem.command = 'git-go.openGitGraph';
        this.statusBarItem.tooltip = 'Open Git Go Graph';

        // Track this instance globally
        existingStatusBarItem = this;

        this.refresh();
    }

    /**
     * Set whether the current workspace is a git repository.
     * @param isGitRepo Whether the workspace is a git repository.
     */
    public setIsGitRepo(isGitRepo: boolean) {
        this.isGitRepo = isGitRepo;
        this.refresh();
    }

    /**
     * Refresh the status bar item visibility based on configuration and git repository status.
     */
    public refresh() {
        const shouldBeVisible = getConfig().statusBarEnabled && this.isGitRepo;

        if (this.isVisible !== shouldBeVisible) {
            if (shouldBeVisible) {
                this.statusBarItem.show();
                this.log('Showing "Git Go" Status Bar Item');
            } else {
                this.statusBarItem.hide();
                this.log('Hiding "Git Go" Status Bar Item');
            }
            this.isVisible = shouldBeVisible;
        }
    }

    /**
     * Dispose the status bar item.
     */
    public dispose() {
        this.statusBarItem.dispose();

        // Clear global reference if this is the tracked instance
        if (existingStatusBarItem === this) {
            existingStatusBarItem = null;
        }
    }
}
