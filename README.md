# Git Go

**A beautiful, interactive Git visualization extension for VS Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.116.0+-blue.svg)](https://code.visualstudio.com/)

_Transform your Git workflow with an intuitive, feature-rich visual interface_

![Git Go Demo](https://github.com/CarlesRojas/git-go/raw/main/git-go-demo-small.gif)

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

Git Go can be customized through VS Code settings:

```json
{
    "git-go.graph.rounded": true // Use rounded corners for graph elements
}
```

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
