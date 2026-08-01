# Git Go

**A beautiful, interactive Git visualization extension for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.19-blue.svg)](package.json)
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
- **Undo the last action** on the current branch - commit, amend, merge, rebase, cherry-pick, revert, reset or pull - from a toolbar button that names what it will undo, or with `Ctrl+Z` / `Cmd+Z`, moving the branch back to where the reflog says it was
- **Reset the current branch** to any commit, soft, mixed or hard
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
- **Stash or discard** uncommitted changes from the working directory row
- **Open files** in VS Code editor at specific commits, in a split view next to the graph

### 🖱️ Drag and Drop

- **Drop a branch on a branch** to merge or rebase, with the default action set in the settings
- **Drop a commit on a branch** to cherry-pick, merge, or revert it
- **Hold over a pill** to open every action it accepts instead of taking the default one
- **Drag an item on its own** for the actions that need no target - push, delete, fetch into local, and apply, pop or drop a stash
- **Refused actions** stay visible with the reason, such as a branch checked out in another worktree
- **Auto mode** per action, to run it on drop with the values its dialog would have opened with

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

Or set the theme to `custom` and list your own colors in `git-go.graph.customColors`, up to 16 hex codes cycled through
as branches are drawn.

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
    - **Drag** a branch, commit, tag, or stash onto a branch, or hold over it for more actions
    - **Undo** the last one from the toolbar button, which names the action it will undo

4. **Keyboard shortcuts**:
    - `Ctrl+F` / `Cmd+F` focuses the search, `Esc` clears it
    - `↑` / `↓` move between commits while one is expanded
    - `Ctrl+Z` / `Cmd+Z` undoes the last action on the current branch

## ⚙️ Configuration

Git Go is configured through VS Code settings. Open them with the "Extension Global Settings" button in the Git Go
settings panel, or search for `git-go` in the Settings editor, where every option below appears under its own group.

### General

```json
{
    "git-go.autoOpen.enabled": false, // Open Git Go automatically when a window with a git repository starts
    "git-go.autoOpen.pinTab": true, // Pin the Git Go tab when it opens
    "git-go.statusBar.enabled": true, // Show a status bar item that opens Git Go when clicked
    "git-go.file.openInSplitView": true // Open files and diffs in a split view next to Git Go
}
```

### Graph

```json
{
    "git-go.graph.theme": "vibrant", // Color palette used for the branches and dots
    "git-go.graph.customColors": [], // Colors used when the theme is 'custom', up to 16 hex codes
    "git-go.graph.rounded": true, // Round the corners of the branches, pills and boxes
    "git-go.graph.showCommitterName": true, // Show who made each commit next to its message
    "git-go.graph.remoteAvatars": true, // Show author pictures from the remote, falling back to Gravatar
    "git-go.graph.expandedCommitHeight": 300 // Height in pixels of an expanded commit (200-800)
}
```

### Drag and Drop

```json
{
    "git-go.dragAndDrop.enabled": true, // Drag branches, commits, stashes and tags to act on them
    "git-go.dragAndDrop.branchOnBranch.defaultAction": "merge", // 'merge' | 'rebase' | 'none' on a branch drop
    "git-go.dragAndDrop.holdDelay": 300, // Milliseconds to hold before the extra actions appear
    "git-go.dragAndDrop.hideDelay": 300, // Milliseconds the actions stay once the pointer leaves
    "git-go.dragAndDrop.auto.merge": false, // Merge on drop instead of opening the dialog
    "git-go.dragAndDrop.auto.rebase": false, // Rebase on drop instead of opening the dialog
    "git-go.dragAndDrop.auto.mergeCommit": false, // Merge a commit on drop instead of opening the dialog
    "git-go.dragAndDrop.auto.cherryPick": false, // Cherry-pick on drop instead of opening the dialog
    "git-go.dragAndDrop.auto.push": false, // Push on drop instead of opening the dialog
    "git-go.dragAndDrop.auto.fetchIntoLocal": false // Fetch on drop instead of opening the dialog
}
```

Each `auto` option runs the action with the values its dialog would have opened with.

### Undo

```json
{
    "git-go.undo.enabled": true, // Offer to undo the last action on the current branch
    "git-go.undo.keyboardShortcut": true, // Also reach the undo from Ctrl+Z / Cmd+Z
    "git-go.undo.show.commit": true, // Offer to undo a commit
    "git-go.undo.show.amend": true, // Offer to undo an amend
    "git-go.undo.show.merge": true, // Offer to undo a merge
    "git-go.undo.show.rebase": true, // Offer to undo a rebase
    "git-go.undo.show.cherryPick": true, // Offer to undo a cherry-pick
    "git-go.undo.show.revert": true, // Offer to undo a revert
    "git-go.undo.show.reset": true, // Offer to undo a reset
    "git-go.undo.show.pull": true, // Offer to undo a pull
    "git-go.undo.show.other": true // Offer to undo an action Git Go could not name
}
```

Each `show` option covers the button and its shortcut together, so an action turned off here has no undo at all.

### Confirmations

```json
{
    "git-go.confirm.merge": true, // Ask before merging a branch or a commit
    "git-go.confirm.rebase": true, // Ask before rebasing onto a branch or a commit
    "git-go.confirm.push": true, // Ask before pushing a branch
    "git-go.confirm.branchDelete": true // Ask before deleting a local branch
}
```

Turning one off runs the action straight away with the defaults configured below. Deleting a branch on a remote always
asks.

### Branches

```json
{
    "git-go.branch.create.checkout": true, // Default 'Checkout new branch' when creating a branch
    "git-go.branch.checkout.pullAfterCheckout": false, // Pull from the upstream right after checking out
    "git-go.branch.push.mode": "normal", // Default 'Push Mode': 'normal' | 'force-with-lease' | 'force'
    "git-go.branch.push.setUpstream": true, // Default 'Set upstream' when pushing a branch
    "git-go.branch.delete.force": false, // Default 'Force Delete' when deleting a branch
    "git-go.branch.delete.onRemote": false // Default 'Also delete on the remote' for a tracked branch
}
```

### Merge

```json
{
    "git-go.merge.fastForwardIfPossible": true, // Default 'Fast forward if possible' when merging
    "git-go.merge.squash": false, // Default 'Squash commits' when merging
    "git-go.merge.noCommit": false, // Default "Don't commit automatically" when merging
    "git-go.merge.commitMessage": "" // Merge commit message, with {source} and {target} placeholders
}
```

### Rebase

```json
{
    "git-go.rebase.ignoreDate": true, // Default 'Ignore date' when rebasing
    "git-go.rebase.autoStash": false // Default 'Autostash uncommitted changes' when rebasing
}
```

### Cherry-Pick and Revert

```json
{
    "git-go.cherryPick.recordOrigin": false, // Default 'Record origin' when cherry-picking
    "git-go.cherryPick.noCommit": true, // Default "Don't commit automatically" when cherry-picking
    "git-go.revert.noCommit": true // Default "Don't commit automatically" when reverting
}
```

### Reset and Discard

```json
{
    "git-go.reset.mode": "mixed", // Default reset mode: 'soft' | 'mixed' | 'hard'
    "git-go.reset.discardUntrackedFiles": true, // Delete untracked files when discarding all changes
    "git-go.reset.discardUntrackedDirectories": true // Delete untracked directories when discarding all changes
}
```

### Stashes

```json
{
    "git-go.stash.includeUntracked": true, // Default 'Include untracked files' when creating a stash
    "git-go.stash.reinstateIndex": false // Restore which files were staged when applying or popping
}
```

### Tags

```json
{
    "git-go.tag.type": "annotated", // 'annotated' | 'lightweight' tags created from the tag dialog
    "git-go.tag.push.allRemotes": false, // Preselect every remote when pushing a tag
    "git-go.tag.delete.onRemotes": false // Preselect the remotes that already have the tag when deleting it
}
```

### Remotes

```json
{
    "git-go.remote.defaultRemote": "origin", // Remote preselected when pushing a branch or a tag
    "git-go.remote.fetch.onOpen": false, // Fetch from every remote when Git Go opens
    "git-go.remote.fetch.prune": false, // Delete remote-tracking branches that are gone from the remote
    "git-go.remote.fetch.checkout": true, // Default 'Checkout branch after fetch' when fetching into a local branch
    "git-go.remote.fetch.forceFetch": false, // Default 'Force fetch' when fetching into a local branch
    "git-go.remote.fetch.confirmOnlyIfForceNeeded": false // Only ask when the fetch has to be forced
}
```

### Worktrees

```json
{
    "git-go.worktree.defaultPath": "../{repo}.worktrees/{branch}", // Where new worktrees are created
    "git-go.worktree.openBehavior": "ask", // 'ask' | 'newWindow' | 'currentWindow' when opening a worktree
    "git-go.worktree.create.openAfterCreate": true, // Default 'Open after creating' when creating a worktree
    "git-go.worktree.remove.force": false, // Default 'Force Remove' when removing a worktree
    "git-go.worktree.remove.deleteBranch": false // Default 'Also delete branch' when removing a worktree
}
```

### Renamed Settings

These settings still work, and are read whenever their replacement is not set. VS Code hides them from the Settings
editor unless you have one configured.

| Old setting                          | Use instead                       |
| ------------------------------------ | --------------------------------- |
| `git-go.branch.rebase.ignoreDate`    | `git-go.rebase.ignoreDate`        |
| `git-go.branch.delete.deleteOnRemote`| `git-go.branch.delete.onRemote`   |
| `git-go.fetch.onOpen`                | `git-go.remote.fetch.onOpen`      |
| `git-go.worktree.openNewWindow`      | `git-go.worktree.openBehavior`    |


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
