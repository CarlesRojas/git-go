# Change Log

## [Unreleased]

- Compare any two commits or refs. A comparison is picked in two steps, so it is never tangled up with which commit happens to be expanded: `Ctrl`/`Cmd`+click a commit, or pick "Select to compare" in the context menu of a commit, a branch pill or a tag, and that side is marked `A` in the graph. The same gesture on anything else then compares the two, and repeating it on the marked side takes the selection back. Dropping one commit onto another compares them outright. A branch or a tag compares the commit it points at, keeping its own name in the header
- Show the comparison in a panel beside the graph rather than over it, listing the changed files in the same tree the expanded commit uses, with the total additions and deletions, a button to swap the direction, and `Esc` or the close button to dismiss. Both compared rows stay visible in the graph, marked `A` and `B`
- Open a file's diff between the two compared commits by clicking it in that tree, including files added, deleted or renamed between them

- Edit a commit's message from its context menu or by dragging the commit: the tip of the branch is amended in place, and an older commit is reworded by replaying its descendants onto the amended copy — a rewrite that cannot conflict, since only the message changes. Offered for commits on the current branch that are not pushed to its upstream and whose path to the tip does not cross a merge; the dialog says how many descendants will be rewritten and offers to autostash uncommitted changes. `git-go.reword.allowPushed` offers the action for pushed commits too, with a force-push warning
- Create a branch from a stash, from its context menu or by dragging it: the branch starts at the commit the stash was made from and is checked out, and the stash is applied onto it and dropped on success. Refused while the working tree has uncommitted changes or an operation is in progress
- Keep a stash visible in the graph when the commit it was made on is no longer reachable from any ref — rewording, resetting or undoing the commit under a stash used to make the stash disappear from the graph even though it still existed

- Virtualize the commit list: only the rows in view are rendered, so scrolling stays smooth and memory stable no matter how many commits are loaded
- Draw only the visible window of the graph, with lines connecting seamlessly across it, and lay out newly loaded pages incrementally instead of recomputing the whole graph — already drawn rows never shift when a page arrives
- Keep the viewport anchored when a commit expanded above it collapses or another one expands
- Keep the loaded history and the scroll position when a branch ref appears or disappears — creating a branch, pushing it (its remote counterpart appearing), or fetching new remote refs no longer resets the graph to the top
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
