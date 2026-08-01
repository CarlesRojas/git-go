# Git Go

**A beautiful, interactive Git visualization extension for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.9-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.116.0+-blue.svg)](https://code.visualstudio.com/)

_Transform your Git workflow with an intuitive, feature-rich visual interface_

![Git Go Demo](https://github.com/CarlesRojas/git-go/raw/main/resource/git-go-demo.gif)

## ✨ Features

Git Go provides a comprehensive visual representation of your Git repository with powerful actions to manage every aspect of your Git workflow:

### 🌳 Visual Git Graph

- **Interactive commit timeline** with branching visualization
- **Real-time updates** when Git state changes
- **Infinite scrolling** for large repositories
- **Keyboard navigation** (↑/↓ arrows when commit is expanded)

### 🔍 Smart Search & Filtering

- **Search commits** by message, author, or hash
- **Filter by branches** - view specific branches or all at once
- **Toggle visibility** of stashes, tags, and remote branches
- **Advanced branch selector** with grouping

### 🌿 Branch Management

- **Create branches** from any commit
- **Checkout, rename, delete** branches with ease
- **Push/pull operations** with upstream tracking
- **Merge and rebase** with multiple strategies (fast-forward, squash, etc.)
- **Abort a merge, rebase, or cherry-pick** from a toolbar button that only appears while one is in progress
- **Force push** with safety options (force-with-lease)
- **Remote branch operations** - checkout, fetch, merge, delete

### 📦 Stash Operations

- **Create stashes** with optional messages and untracked files
- **Apply, pop, or drop** stashes
- **View stash contents** and file changes
- **Visual stash indicators** in the graph

### 🏷️ Tag Management

- **Create and delete** tags from any commit
- **Push tags** to remotes
- **View tag details** and associated commits
- **Visual tag indicators** in the commit graph

### 🪾 Worktree Support

- **Worktree indicators** on branches checked out in other worktrees
- **Create worktrees** from any local branch, with a configurable path template
- **Open worktrees** in a new window or the current one
- **Remove worktrees** with optional force and branch deletion
- **Worktree list** in the toolbar showing main, current, locked, and missing worktrees
- **Full support** for working inside a linked worktree, including live graph updates

### 🔄 Commit Operations

- **Cherry-pick commits** with origin tracking options
- **Revert commits** safely
- **Undo the last action** on the current branch - commit, amend, merge, rebase, cherry-pick, revert, reset or pull - from a toolbar button that names what it will undo, moving the branch back to where the reflog says it was
- **View detailed commit information** including:
    - File changes and diffs
    - Author and committer details
    - Parent commit relationships

### 🌐 Remote Management

- **Add and remove** Git remotes
- **Fetch from all remotes** or specific ones
- **Push/pull operations** to/from remotes
- **Remote branch tracking** and management

### 📁 File Operations

- **Browse repository** file tree at any commit or stash
- **View file diffs** between commits
- **See working directory changes** with uncommitted files
- **Open files** in VS Code editor at specific commits

### ⚙️ Git Configuration

- **Local and global** Git user configuration
- **Override Git user** per repository
- **Repository settings** panel for quick access
- **Extension configuration** through VS Code settings

## Themes

Choose from multiple color themes for the commit graph:

![Vibrant Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/vibrant.png)
![Spring Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/spring.png)
![Ocean Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/ocean.png)
![Sunset Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/sunset.png)
![Pastel Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/pastel.png)
![Coast Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/coast.png)
![Cloud Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/cloud.png)
![Forest Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/forest.png)
![Rainbow Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/rainbow.png)
![Earth Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/earth.png)
![Float Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/float.png)
![Dusk Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/dusk.png)
![Coral Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/coral.png)

## 🚀 Getting Started

### Installation From VS Code Marketplace:

    - Open VS Code
    - Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
    - Search for "Git Go"
    - Click Install

### Usage

1. **Open Git Go**:
    - Use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
    - Run "Git Go - Open Graph"
    - Or click the "Git Go" button in the bottom status bar

2. **Navigate your repository**:
    - Browse commits in the visual timeline
    - Click on commits to expand and see details
    - Use the search bar to find specific commits
    - Select branches to filter the view

3. **Perform Git operations**:
    - **Right-click** on commits, branches, stashes, or tags for context menus

## ⚙️ Configuration

Git Go can be customized through VS Code settings. Here are all available configuration options:

### 🎨 Graph Appearance

```json
{
    "git-go.graph.rounded": true, // Use rounded corners for graph elements
    "git-go.graph.theme": "vibrant", // Color theme for branch visualization
    "git-go.graph.customColors": [], // Palette used when the theme is 'custom' (hex colors, up to 16)
    "git-go.graph.expandedCommitHeight": 300, // Height in pixels for expanded commit details (200-800)
    "git-go.graph.showCommitterName": true, // Show the committer name next to each commit
    "git-go.graph.remoteAvatars": true // Show author pictures from the remote (GitHub), falling back to Gravatar
}
```

### 🚀 Auto-Open Behavior

```json
{
    "git-go.autoOpen.enabled": false, // Automatically open Git Go when VS Code opens in a git repository
    "git-go.autoOpen.pinTab": true // Automatically pin the Git Go tab when opened
}
```

### 📊 Interface Elements

```json
{
    "git-go.statusBar.enabled": true // Show a Status Bar Item that opens Git Go when clicked
}
```

### 📄 File Operations

```json
{
    "git-go.file.openInSplitView": true // Open files and diffs in a split view next to Git Go, reusing an existing split view
}
```

### 🖱️ Drag and Drop

```json
{
    "git-go.dragAndDrop.enabled": true, // Enable dragging branches, commits, stashes and tags
    "git-go.dragAndDrop.branchOnBranch.defaultAction": "merge", // 'merge' | 'rebase' | 'none' when dropping a branch onto another
    "git-go.dragAndDrop.holdDelay": 300, // Milliseconds to hold over a branch before its extra actions appear
    "git-go.dragAndDrop.hideDelay": 300, // Milliseconds the actions linger after the pointer moves away
    "git-go.dragAndDrop.auto.merge": false, // Merge on drop without showing the dialog
    "git-go.dragAndDrop.auto.rebase": false, // Rebase on drop without showing the dialog
    "git-go.dragAndDrop.auto.cherryPick": false, // Cherry-pick on drop without showing the dialog
    "git-go.dragAndDrop.auto.mergeCommit": false, // Merge a commit on drop without showing the dialog
    "git-go.dragAndDrop.auto.push": false, // Push on drop without showing the dialog
    "git-go.dragAndDrop.auto.fetchIntoLocal": false // Fetch into local on drop without showing the dialog
}
```

### 🌿 Branch Operations

```json
{
    "git-go.branch.create.checkout": true, // Default 'Checkout new branch' when creating a branch
    "git-go.branch.delete.force": false, // Default 'Force delete' when deleting a branch
    "git-go.branch.delete.deleteOnRemote": false, // Default 'Also delete on remote' when the branch tracks an upstream
    "git-go.branch.checkout.pullAfterCheckout": false, // Pull from the upstream right after checking a branch out
    "git-go.branch.push.setUpstream": true, // Default 'Set upstream' when pushing a branch
    "git-go.branch.push.mode": "normal", // Default 'Push Mode': 'normal' | 'force-with-lease' | 'force'
    "git-go.branch.rebase.ignoreDate": true // Default 'Ignore date' when rebasing a branch
}
```

### 🔄 Merge Operations

```json
{
    "git-go.merge.fastForwardIfPossible": true, // Default 'Fast forward if possible' when merging
    "git-go.merge.squash": false, // Default 'Squash commits' when merging branches
    "git-go.merge.noCommit": false, // Default 'Don't commit automatically' when merging
    "git-go.merge.commitMessage": "" // Merge commit message template, with {source} and {target} placeholders
}
```

### 📐 Rebase Operations

```json
{
    "git-go.rebase.autoStash": false // Default 'Autostash uncommitted changes' when rebasing
}
```

### 🍒 Cherry-Pick Operations

```json
{
    "git-go.cherryPick.recordOrigin": false, // Default 'Record origin' when cherry-picking
    "git-go.cherryPick.noCommit": true // Default 'Don't commit automatically' when cherry-picking
}
```

### ↩️ Revert Operations

```json
{
    "git-go.revert.noCommit": true // Default 'Don't commit automatically' when reverting commits
}
```

### ⏪ Reset Operations

```json
{
    "git-go.reset.mode": "mixed", // Default reset mode ('soft' | 'mixed' | 'hard') when resetting to a commit
    "git-go.reset.discardUntrackedFiles": true, // Also delete untracked files when discarding all changes
    "git-go.reset.discardUntrackedDirectories": true // Also delete untracked directories when discarding all changes
}
```

### 🌐 Remote Operations

```json
{
    "git-go.remote.defaultRemote": "origin", // Remote preselected when pushing branches and tags
    "git-go.fetch.onOpen": false, // Fetch from every remote when the Git Go panel opens
    "git-go.remote.fetch.prune": false, // Delete remote-tracking branches that no longer exist on the remote
    "git-go.remote.fetch.forceFetch": false, // Default 'Force fetch' when fetching remote branches
    "git-go.remote.fetch.checkout": true, // Default 'Checkout branch after fetch' when fetching remote branches
    "git-go.remote.fetch.confirmOnlyIfForceNeeded": false // Only confirm the fetch when it needs to be forced
}
```

### 📦 Stash Operations

```json
{
    "git-go.stash.includeUntracked": true, // Default 'Include untracked files' when creating stashes
    "git-go.stash.reinstateIndex": false // Restore the staged state of the files when applying or popping a stash
}
```

### 🏷️ Tag Operations

```json
{
    "git-go.tag.type": "annotated", // 'annotated' | 'lightweight' tags created from the tag dialog
    "git-go.tag.push.allRemotes": false, // Preselect every remote when pushing a tag
    "git-go.tag.delete.onRemotes": false // Preselect the remotes that have the tag when deleting a tag
}
```

### 🪾 Worktree Operations

```json
{
    "git-go.worktree.defaultPath": "../{repo}.worktrees/{branch}", // Path template for new worktrees
    "git-go.worktree.openNewWindow": true, // Open worktrees in a new window by default
    "git-go.worktree.openBehavior": "ask", // 'ask' | 'newWindow' | 'currentWindow' when opening a worktree
    "git-go.worktree.create.openAfterCreate": true, // Default 'Open after creating' when creating a worktree
    "git-go.worktree.remove.force": false, // Default 'Force Remove' when removing a worktree
    "git-go.worktree.remove.deleteBranch": false // Default 'Also delete branch' when removing a worktree
}
```

### ✅ Confirmation Dialogs

```json
{
    "git-go.confirm.merge": true, // Ask before merging a branch or a commit
    "git-go.confirm.rebase": true, // Ask before rebasing onto a branch or a commit
    "git-go.confirm.push": true, // Ask before pushing a branch
    "git-go.confirm.branchDelete": true // Ask before deleting a local branch
}
```

Disabling one of these runs the action straight away with the configured defaults, skipping its dialog. Deleting a
branch on a remote always asks.

### Repository Settings

Access via the settings button in the Git Go interface:

- Toggle visibility of stashes, tags, and remotes
- Configure Git user name and email (local/global)
- Manage remote repositories
- Open extension settings

## 🔧 Requirements

- **VS Code** version 1.116.0 or higher
- **Git** installed and available in PATH
- A **Git repository** in your workspace

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Inspired by the excellent [Git Graph](https://github.com/mhutchie/vscode-git-graph/tree/develop) extension
- Built with modern web technologies and the VS Code Extension API

---

<div align="center">

[Report Bug](https://github.com/CarlesRojas/git-go/issues) · [Request Feature](https://github.com/CarlesRojas/git-go/issues) · [Contribute](https://github.com/CarlesRojas/git-go/pulls)

</div>
