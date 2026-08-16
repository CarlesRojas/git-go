# Change Log

## [Unreleased]

- Close the graph tab left over from before an extension update or window reload, since it can no longer be revived and a fresh one opens next to it
- Find the git repositories inside the folders that are open, not only the folders themselves, and pick between them with a selector in the toolbar that appears as soon as there is more than one. Each repository keeps its own selected branches and hidden remotes, submodules are left out of the list, and `git-go.repo.scanDepth` sets how deep the search goes
- Keep the Git Go status bar item there whether or not the workspace has a repository, so opening it can say that neither the folder nor its subfolders hold one
- Hide the undo button and its shortcut when the last action is already pushed, so an undo does not rewrite published history. `git-go.undo.allowPushed` turns the offer back on, and undoing a pull is always offered since it only leaves the branch behind its upstream

## [1.0.0]

- Release
