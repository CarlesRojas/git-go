# Next Features

Planned work, grouped into batches that make sense to build in a single AI chat session. Groups are ordered so that dependencies come first (Group 2 → Group 3 is the only hard dependency); Groups 4–7 are independent of each other.

---

## Group 1 — Housekeeping & commit body

Small, low-risk changes. Good warm-up batch, touches the data layer lightly.

### 1.1 Remove `DiffDocProvider` dead code

- `src/diffDocProvider.ts` is registered in `src/extension.ts` but never used: `openFile` builds `git:`-scheme URIs handled by VS Code's built-in git extension instead. `encodeDiffDocUri` has no callers; the only live call is `invalidate()` on FS change.
- Remove the provider, its registration, and the `invalidate()` call site. Verify diffs still open for: modified files, added files, deleted files, renamed files, root commits, stashes (including untracked files from the stash's third parent), and the working directory row.

### 1.2 Show the full commit message body

- Today only `%s` (subject) is fetched; multi-line bodies are invisible everywhere.
- Fetch the full message (`%B`) in the log format in `src/gitService.ts`. Watch out: the log parser splits on record/field separators, so the body must be the last field or the separators must be chosen to survive newlines inside a field.
- Graph row (`CommitItem`) keeps showing only the subject — no change on the main line.
- The expanded commit panel shows the full message: subject styled as it is now, body below it in a scrollable block, preserving line breaks. Click still copies (copy the full message).
- Tooltips/aria labels keep using the subject only.

### 1.3 README corrections

Fix the claims that don't match the code:

- "Author and committer details" → only the author is shown (name/email/avatar). Either fix the README wording, or (preferred) also fetch `%cn/%ce` and show committer when it differs from the author in the expanded panel. Decide when implementing; if committer is added, it belongs in this group.
- "Parent commit relationships" → parents are never rendered. Remove the claim (rendering parents is not planned).
- `git-go.graph.showCommitterName` actually shows the **author** name. Rename the setting to `git-go.graph.showAuthorName` (keep reading the old key as a fallback for existing users) and fix its description.
- While in `package.json`: `git-go.branch.delete.onRemote` and `git-go.branch.delete.deleteOnRemote` both exist — one is legacy. Remove the dead one (check which is read in `src/config.ts`).

---

## Group 2 — Virtualization

One focused performance chat. **Prerequisite for Group 3 (search).**

### 2.1 Virtualize the commit list

- Problem: infinite scroll mounts every loaded row (200/page, unbounded DOM growth), and `computeGraphLayout` re-runs over the entire accumulated commit array on every page fetch.
- Use `@tanstack/react-virtual` (fits the existing TanStack Query stack) with dynamic row measurement — rows have two sizes (collapsed and expanded via `git-go.graph.expandedCommitHeight`), so measurement must react to expand/collapse.
- The SVG graph (`useGitTree`) must render only the visible window: either slice the precomputed layout per visible range, or split the single big SVG into per-row segments so lines connect seamlessly across virtualized rows. Branch-line hover highlighting (`useCommitHighlight`) must keep working across the window.
- Make `computeGraphLayout` incremental: appending a page should extend the previous layout, not recompute from scratch (the algorithm is sequential top-to-bottom, so carrying over the open-branch state from the last row should be enough).
- Keep: IntersectionObserver/sentinel infinite loading (now driven by the virtualizer's last visible index), keyboard ↑/↓ navigation between commits (must scroll the virtualizer), scroll position stability when a row above the viewport expands/collapses.
- Acceptance: smooth scrolling with 10k+ loaded commits, stable memory, no visual difference in the graph rendering.

---

## Group 3 — Real search

Depends on Group 2 (jumping to old matches loads many pages; without virtualization that would blow up the DOM).

### 3.1 Git-side search with highlight + prev/next navigation

- Keep the current UX shape (matches are **highlighted**, non-matches dimmed — the graph never collapses), and add a match counter with prev/next buttons and Enter / Shift+Enter shortcuts.
- Backend: run the search in `GitService` over the **whole** history, not just loaded pages. Run `git log` with the same ref set the graph uses, returning matching hashes only:
    - plain term → `--grep=<term> -i --fixed-strings`, plus separate matching by author (`--author`) and hash prefix, OR-ed client-side;
    - `author:<x>` prefix → `--author`;
    - `file:<path>` prefix → pathspec (`-- <path>`);
    - `hash:<x>` prefix → hash prefix match.
- Fix `cleanSearchTerm`: stop stripping non-alphanumerics — `feat/foo`, `v1.2.3`, and file paths must be searchable literally. Client-side matching (for refs/tags/branch pills of loaded rows) stays, merged with the git-side hash set.
- Prev/next jump: if the target match is not loaded yet, fetch pages until its row exists (`rev-list --count <target>..HEAD`-style index math can tell how many pages), then scroll the virtualizer to it and highlight it.
- Debounce (~300ms), cancel in-flight searches (`AbortController` on the spawn), show "n of m" while partial.
- Esc clears search (as today), Ctrl/Cmd+F focuses it (as today).

---

## Group 4 — Rewrite actions: reword + branch from stash

Both are "new action wired into context menu + drag-and-drop stack + dialog + GitService", so they share all the plumbing patterns. One chat.

### 4.1 Reword / amend commit message

- **Entry points**: commit context menu ("Edit commit message…") and the commit's drag-and-drop hold stack (drag-alone action, like push/delete are for branches).
- **Scope**: any commit on the current branch that is **not pushed** to its upstream.
    - HEAD → `git commit --amend -m <msg>` (use `--only` with no paths so staged changes are NOT swept into the amend; message change only).
    - Older commit → scripted non-interactive rebase: `GIT_SEQUENCE_EDITOR` rewrites the todo (`pick` → `reword` for the target), `GIT_EDITOR`/`core.editor` override supplies the new message (or use `pick` + `exec git commit --amend`). Refuse when: working tree is dirty (offer autostash), the range HEAD..target crosses a merge commit, or an operation is already in progress.
- **Pushed guard**: hide the action when the commit is reachable from the upstream (reuse the `isPublished` logic from undo). New setting `git-go.reword.allowPushed` (default `false`) shows it anyway, with a force-push warning in the dialog.
- **Dialog**: textarea prefilled with the current full message (subject + body, needs Group 1.2's `%B`), Save/Cancel. Show "this will rewrite N descendant commits" when the target is not HEAD.
- **Undo integration**: a reword is a rewrite — after it, the Undo button should recognize it (reflog subjects are `commit (amend)` / `rebase`), so verify `getUndoableAction` labels it sensibly.

### 4.2 Branch from stash

- **Entry points**: stash context menu ("Create branch from stash…") and the stash drag-and-drop hold stack (drag-alone action, joining apply/pop/drop).
- Runs `git stash branch <name> <stash>` — creates the branch at the stash's base commit, checks it out, applies and drops the stash on success.
- **Dialog**: branch name input (validated with the existing ref-name validation), shows which commit the branch will start at, notes that the stash will be applied and removed.
- Refuse (with drag-refusal reason, like existing refused actions) when the working tree is dirty or an operation is in progress.

---

## Group 5 — Compare two commits/refs

One chat: selection state + overlay panel + all three entry points.

### 5.1 Compare A → B

- **Entry points** (all three):
    1. **Ctrl/Cmd+click** a commit while another is selected/expanded → compares the two (Git Graph-style).
    2. **Drag a commit onto another commit** → "Compare" appears in the drop stack (extends `dragAndDrop.ts` with commit-on-commit targets).
    3. **Context menu**: "Compare with selected…" on commits; also on branch pills and tags (compare their tip commits).
- **Result: overlay panel** (same pattern as settings/worktree overlays):
    - Header: `A → B` with short hashes/ref names, a swap-direction button, and total `+adds/−dels`.
    - Body: the same file tree component used in expanded commits (`buildFileTree`/`Tree`), fed by `git diff --numstat --name-status A B`.
    - Clicking a file opens the VS Code diff of that file between A and B (extend the `openFile` handler to accept two arbitrary refs — today it only knows commit-vs-parent).
    - Esc or close button dismisses; comparing again replaces the panel content.
- While a comparison is open, both compared rows in the graph get a subtle marker.
- No persistence needed (no "pinned comparisons" for now).

---

## Group 6 — GitHub links

One chat: URL building + settings section + several small UI touchpoints.

### 6.1 GitHub integration links

- **Settings** — individual toggles under a new **GitHub** section (`git-go.github.*`), all default `true` except noted; the section only takes effect when the repo has a `github.com` remote (SSH or HTTPS; parse like `avatarService` does):
    - `git-go.github.commitLinks` — icon next to the hash in the expanded commit panel → opens `https://github.com/<owner>/<repo>/commit/<hash>`; plus "Open on GitHub" in the commit context menu.
    - `git-go.github.refLinks` — context-menu "Open on GitHub" for branches (`/tree/<branch>`) and tags (`/releases/tag/<tag>` with fallback `/tree/<tag>`).
    - `git-go.github.fileLinks` — hover icon on files in the expanded tree → `/blob/<hash>/<path>`.
    - `git-go.github.issueLinks` — linkify `#123` in commit messages (subject in the expanded panel + body) → `/issues/123` (GitHub redirects PRs automatically).
    - `git-go.github.createPullRequest` — "Create Pull Request" in the local-branch context menu (branch must have an upstream) → opens `/compare/<base>...<branch>?expand=1`. Icon + label rendered as `{github icon} PR`-style, minimal.
- **UI principle**: minimal — the GitHub mark icon alone where the context makes it obvious (hash, file hover); icon + a one-word label ("PR") where it wouldn't be. No full-text "Open on GitHub" buttons outside context menus.
- Links open with `vscode.env.openExternal` (message from webview → extension host).
- Multi-remote: prefer `origin` if it's GitHub, else the first GitHub remote.

---

## Group 7 — Reflog browser

One chat: builds on the undo/reflog parsing that already exists in `GitService`.

### 7.1 Reflog browser overlay

- **Entry point**: toolbar button next to the Undo button.
- **Overlay panel** listing reflog entries, newest first, with a selector to switch between `HEAD` and any local branch's reflog (`git reflog show <ref> --format=...`, paginated).
- Each entry shows: index (`HEAD@{n}`), action kind (reuse/extend the undo parser's kind detection: commit, amend, merge, rebase, cherry-pick, revert, reset, pull, checkout…), subject, short hash, relative date.
- **"Recoverable" badge** on entries whose commit is no longer reachable from any ref (check with `git merge-base --is-ancestor` against branch tips, or batch via `rev-list --all`) — these are the lost commits the browser exists to rescue.
- **Actions per entry** (context menu and/or inline buttons):
    - Create branch here (prefilled name like `recovered-<shorthash>`)
    - Reset current branch here (soft/mixed/hard — reuse the existing reset dialog)
    - Cherry-pick this commit
    - Copy hash
- Destructive actions (reset hard) get the same confirmation treatment as elsewhere; everything refuses while an operation is in progress.

---

## Suggested order

1. **Group 1** (housekeeping) — quick wins, unblocks `%B` for reword.
2. **Group 2** (virtualization) — required before search; biggest risk item, do it early.
3. **Group 3** (search) — right after virtualization while that code is fresh.
4. **Groups 4–7** — independent; any order. Group 4 before Group 7 is slightly nicer (reword exercises the reflog parsing that Group 7 extends).
