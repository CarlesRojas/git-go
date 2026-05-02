# Git Go

**A beautiful, interactive Git visualization extension for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.116.0+-blue.svg)](https://code.visualstudio.com/)

_Transform your Git workflow with an intuitive, feature-rich visual interface_

![Git Go Demo](https://github.com/CarlesRojas/git-go/raw/main/git-go-demo.gif)

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

### 🔄 Commit Operations

- **Cherry-pick commits** with origin tracking options
- **Revert commits** safely
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
    "git-go.graph.expandedCommitHeight": 300 // Height in pixels for expanded commit details (200-800)
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

### 🌿 Branch Operations

```json
{
    "git-go.branch.create.checkout": true, // Default 'Checkout new branch' when creating a branch
    "git-go.branch.delete.force": false, // Default 'Force delete' when deleting a branch
    "git-go.branch.push.setUpstream": true, // Default 'Set upstream' when pushing a branch
    "git-go.branch.rebase.ignoreDate": true // Default 'Ignore date' when rebasing a branch
}
```

### 🔄 Merge Operations

```json
{
    "git-go.merge.fastForwardIfPossible": true, // Default 'Fast forward if possible' when merging
    "git-go.merge.squash": false, // Default 'Squash commits' when merging branches
    "git-go.merge.noCommit": false // Default 'Don't commit automatically' when merging
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

### 🌐 Remote Operations

```json
{
    "git-go.remote.fetch.forceFetch": false // Default 'Force fetch' when fetching remote branches
}
```

### 📦 Stash Operations

```json
{
    "git-go.stash.includeUntracked": true // Default 'Include untracked files' when creating stashes
}
```

### Theme Options

Choose from multiple color themes for the commit graph:

#### **Vibrant** (default)

Bright, energetic colors perfect for high-energy development sessions.

![Vibrant Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/vibrant.png)

#### **Spring**

Warm earth tones flowing into cool teals, like nature's seasonal transition.

![Spring Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/spring.png)

#### **Ocean**

Deep blues and teals reminiscent of deep ocean waters.

![Ocean Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/ocean.png)

#### **Sunset**

Warm purples, pinks, and oranges like a beautiful evening sky.

![Sunset Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/sunset.png)

#### **Pastel**

Soft, gentle colors that are easy on the eyes for long coding sessions.

![Pastel Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/pastel.png)

#### **Coast**

Cool greens and blues inspired by coastal waters and beaches.

![Coast Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/coast.png)

#### **Cloud**

Dreamy purples and soft tones like floating in the clouds.

![Cloud Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/cloud.png)

#### **Forest**

Earth-toned palette transitioning from forest greens to rich browns.

![Forest Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/forest.png)

#### **Rainbow**

Vibrant spectrum colors that bring joy to your commit history.

![Rainbow Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/rainbow.png)

#### **Earth**

Natural, muted tones inspired by soil, sand, and stone.

![Earth Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/earth.png)

#### **Float**

Mysterious purples and muted tones for a calming experience.

![Float Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/float.png)

#### **Dusk**

Warm beiges transitioning through twilight grays into cool sage greens, capturing the serene evening hour.

![Dusk Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/dusk.png)

#### **Coral**

Vibrant blues blending into warm coral tones.

![Coral Theme](https://github.com/CarlesRojas/git-go/raw/main/resource/coral.png)

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
