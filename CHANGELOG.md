# Change Log

## [Unreleased]

- Virtualize the commit list: only the rows in view are rendered, so scrolling stays smooth and memory stable no matter how many commits are loaded
- Draw only the visible window of the graph, with lines connecting seamlessly across it, and lay out newly loaded pages incrementally instead of recomputing the whole graph — already drawn rows never shift when a page arrives
- Keep the viewport anchored when a commit expanded above it collapses or another one expands
- Show the full commit message in the expanded commit panel: the body appears below the subject with its line breaks kept, and clicking either copies the whole message. The graph row keeps showing only the subject
- Show the committer in the expanded commit panel when it differs from the author
- Rename `git-go.graph.showCommitterName` to `git-go.graph.showAuthorName`, since it always showed the author. A value set under the old name keeps working until the new one is set
- Remove the deprecated `git-go.branch.delete.deleteOnRemote` setting entry, replaced by `git-go.branch.delete.onRemote` (a value set under the old name is still honored)
- Remove the unused internal diff document provider; diffs are served by VS Code's built-in git extension
- Close the graph tab left over from before an extension update or window reload, since it can no longer be revived and a fresh one opens next to it
- Find the git repositories inside the folders that are open, not only the folders themselves, and pick between them with a selector in the toolbar that appears as soon as there is more than one. Each repository keeps its own selected branches and hidden remotes, submodules are left out of the list, and `git-go.repo.scanDepth` sets how deep the search goes
- Keep the Git Go status bar item there whether or not the workspace has a repository, so opening it can say that neither the folder nor its subfolders hold one
- Hide the undo button and its shortcut when the last action is already pushed, so an undo does not rewrite published history. `git-go.undo.allowPushed` turns the offer back on, and undoing a pull is always offered since it only leaves the branch behind its upstream

## [1.0.0]

- Release
