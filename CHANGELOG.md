# Change Log

## [Unreleased]

- Browse the reflog from a new toolbar button beside the undo button: a panel beside the graph listing everywhere a ref has been, newest first, with a selector to switch between `HEAD` — which records checkouts too — and any local branch, loading further entries a page at a time. Each entry names the action it recorded (commit, amend, merge, rebase, cherry-pick, revert, reset, pull, checkout, branch, clone), with its `HEAD@{n}` index, short hash and how long ago it was
- Mark the reflog entries no branch or tag reaches any more as **Recoverable** — the commits an amend, a reset or a rebase left behind, which the graph no longer shows and only the reflog still points at
- Act on any reflog entry from its context menu: create a branch there (prefilled `recovered-<hash>`), cherry-pick it, reset the current branch to it (soft, mixed or hard, through the usual reset dialog), or copy its hash. Everything but copying is refused while a merge, rebase or cherry-pick is in progress

- Link to GitHub from the graph when the repository has a `github.com` remote — `origin` when it is one, otherwise the first that is. The GitHub mark next to a commit's hash opens the commit, files in the expanded tree open at that commit when hovered, and the context menus of commits, branches and tags open them on GitHub. A tag opens its release page, falling back to its tree when there is no release for it
- Turn `#123` in a commit message into a link to that issue, in the subject and the body of the expanded commit
- Open GitHub's pull request form for a local branch from its context menu, comparing the branch against the branch the remote's HEAD points at. Shown for branches that have an upstream on the GitHub remote and are not that default branch themselves
- Add `git-go.github.commitLinks`, `git-go.github.refLinks`, `git-go.github.fileLinks`, `git-go.github.issueLinks` and `git-go.github.createPullRequest` to turn each of these off on its own. All are on by default, and none of them shows anything unless the repository is on GitHub

- Scroll the file list in the comparison panel instead of cutting it off: a comparison touching more files than fit in the panel used to show only the first few, with the rest unreachable

- Compare any two commits or refs. A comparison is picked in two steps, so it is never tangled up with which commit happens to be expanded: `Ctrl`/`Cmd`+click a commit, or pick "Select to compare" in the context menu of a commit, a branch pill or a tag, and that side is marked `A` in the graph. The same gesture on anything else then compares the two, and repeating it steps back one pick at a time: on the `B` side it drops that side and leaves `A` armed for another, on `A` it clears the selection entirely. Dropping one commit onto another compares them outright. A branch or a tag compares the commit it points at, keeping its own name in the header
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
