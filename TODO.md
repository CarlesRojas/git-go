## TODO

## Bugs

- [ ] 🔴 **1. No request/response correlation in webview ↔ extension messages.** Every query in `panel/src/hook/useGitQueries.ts` listens for the same generic `'gitError'` type. If two operations are in flight and one fails, every in-flight queryFn rejects with that one error. Same problem with success messages: a stray `getGitCommits` and a `useInfiniteGitCommits` both fire on `'gitCommits'` and may resolve with each other's payload. **Fix:** add a `requestId` to every postMessage and route by it.

- [x] 🔴 **2. Expanded commit eats every keystroke.** `Graph.tsx:75-82` calls `event.preventDefault()` _before_ checking the key. While any commit is expanded, typing in inputs/dialogs/textareas loses arrow keys and any other intercepted keys. **Fix:** check the key first, only `preventDefault` for `ArrowUp`/`ArrowDown` and only when the target isn't an input/contenteditable. **FIXED** - Modified the keydown handler to check the key and target element first, only preventing default for arrow keys when the target isn't an input, textarea, or contenteditable element.

- [x] 🔴 **3. Argument injection via ref names beginning with `-`.** Every `spawnGit` call passes user/repo-supplied names (branch, tag, stash selector, remote name) as positional args without an `--` end-of-options sentinel. A branch literally named `--upload-pack=evil` lets git execute arbitrary commands. Reproducible: `git branch -- --foo`. **Fix:** insert `--` before user-controlled positional args everywhere in `gitService.ts` and validate ref names with `git check-ref-format`. **FIXED** - Added `validateRefName` method using `git check-ref-format` and inserted `--` separators before all user-controlled positional arguments in git commands. All vulnerable methods in `gitService.ts` have been secured.

- [-] 🔴 **4. Stashes disappear after scrolling past their base commit.** `gitService.ts:630-637` inserts each stash only if its parent is in the _current_ page (`commits.findIndex(c => c.hash === stash.parents[0])`). Once you paginate past that page, the stash silently vanishes from the graph. **Fix:** load all stashes once and merge them globally in the webview (or mark each stash with a synthetic anchor), independent of pagination.

- [x] 🔴 **5. `setInterval(async …)` re-entrancy in auto-open.** `extension.ts:1073-1085` polls every 50ms with an async callback that itself does git work. The async function easily takes >50ms, so multiple invocations stack and `git-go.openGitGraph` can run several times. **Fix:** await `gitExtension.activate()` directly, or use `setTimeout` re-armed only after the previous attempt resolves. **FIXED** - Replaced `setInterval` with a recursive `setTimeout` pattern that only schedules the next retry after the previous async operation completes, preventing re-entrancy issues.

- [x] 🟠 **6. Per-row context menus and dialogs are catastrophic for performance/correctness.** `useCommitContextMenu.tsx:27` defines `ContextMenuWrapper` _inside_ the hook — every parent render makes a new component identity, remounting the whole subtree for every commit. Worse, each `CommitItem` instantiates `useTagDialog` + `useBranchDialog` + `useCherryPickDialog` + `useRevertDialog`, each with `useState` + `@tanstack/react-form` + `useMutation`. With 200 visible commits that's ~800 form/mutation instances. **FIXED** - Completely eliminated component identity churn by replacing `ContextMenuWrapper` components with `renderWrapper` functions that return JSX directly. React now reconciles the same memoized component type across renders instead of new function identities. All context menu hooks now return render functions: `renderWrapper(children, enabled)` instead of `<ContextMenuWrapper enabled={enabled}>{children}</ContextMenuWrapper>`. Updated all consumers: CommitItem.tsx, BranchPill.tsx, StashTagPill.tsx.

- [x] 🟠 **7. `DiffDocProvider` leaks a workspace listener.** `diffDocProvider.ts:25` registers `vscode.workspace.onDidCloseTextDocument` and never stores/disposes the `Disposable`. **Fix:** push the disposable into a list and dispose in `dispose()`. **FIXED** - Added `onDidCloseTextDocumentDisposable` field to store the disposable and dispose it in the `dispose()` method.

- [x] 🟠 **8. Diff views show stale content after history rewrites.** `DiffDocProvider` caches by URI but never fires `onDidChangeEventEmitter`. After amend/rebase/reset/force-push, diffs render the old file content until the document is closed. **Fix:** fire `onDidChange(uri)` for every cached URI when git state changes.

- [-] 🟠 **9. Numstat lookup mismatch for renamed files.** Status output (with `-M`) gives `R100\told\tnew`; numstat gives `5\t3\told => new` (or `5\t3\t{old => new}/sub`). Current parsing in `getCommitFiles`/`getWorkingChanges`/`getStashFiles` keys statsMap by the literal `"old => new"` string but looks it up with the new path → renames always show 0/0 additions/deletions. **Fix:** use `-z` (NUL-separated) and parse the dual-name rename format properly.

- [-] 🟠 **10. `getStashFiles` shows only unstaged stashed changes.** A stash has up to 3 parents (base, index, untracked). `git diff baseHash stashHash` (`gitService.ts:725-728`) only captures the working-tree-vs-base diff. Files staged at the time of `git stash` are missed. **Fix:** use `git stash show -u --raw stash@{N}` or diff against parents 1 and 2 separately.

- [x] 🟠 **11. Merge-commit file lists incomplete.** `getCommitFiles` (`gitService.ts:662`) calls `diff-tree --root` without `-c`/`--cc`, so for merge commits only the first-parent diff is shown — actual merge-resolution edits are invisible. **Fix:** add `-m --first-parent` or `--cc` when the commit has >1 parent. **FIXED** - Modified `getCommitFiles` to detect merge commits and use `--cc` flag to show combined diff including merge resolution changes.

- [-] 🟠 **12. `cachedGitExecutable` is never invalidated.** `gitService.ts:64,1536` defines `clearCache()` but nothing calls it. Changing `git.path` requires VS Code restart. The config-change handler in `extension.ts:40-75` only refreshes the status bar.

- [-] 🟠 **13. Multi-root workspaces operate on the wrong repo.** Every method uses `vscode.workspace.workspaceFolders?.[0]`. Users with several folders in one workspace always see folder #0. **Fix:** track the active repo (e.g. by the active editor's URI) or scope the panel to a chosen workspace folder.

- [x] 🟠 **14. `O(n²)` layout join in `Graph.tsx`.** Line 131: `rows.find(c => c.commit.hash === commit.hash)!` runs per row. For 200 commits that's 40k scans per render. The non-null assertion also crashes if working-changes-commit is in `commits` but not in `rows`. **Fix:** build a `Map<hash, CommitLayout>` once. **FIXED** - Built a `layoutMap` using `useMemo` to create a hash-to-layout mapping once, replaced the O(n²) `rows.find()` with O(1) map lookup, and added null check to prevent crashes when layout is missing.

- [x] 🟠 **15. `showStashes=false` ignored when working changes exist.** `Graph.tsx:36-44` returns early on `workingChangesData?.commit` without applying the stash filter, so toggling stashes off does nothing while you have uncommitted changes. **FIXED** - Restructured the commits filtering logic to apply the stash filter first, then add working changes commit, ensuring the showStashes setting is respected regardless of working changes state.

- [ ] 🟠 **16. File watcher misses packed-refs.** `extension.ts:1184-1199` watches `.git/refs/**/*` and `.git/HEAD`. After `git gc`/`git pack-refs`, individual ref files vanish and updates land in `.git/packed-refs`, which isn't watched → graph stops auto-refreshing. **Fix:** also watch `.git/packed-refs`, `.git/refs`, and `.git/logs/HEAD`.

- [ ] 🟠 **17. `findGitExecutable` swallows the original error.** `gitService.ts:84-110` — when both the configured path and the `git` fallback fail, the original error is dropped (the comment "Continue to throw original error" is wrong; it isn't rethrown). User sees only the generic "Unable to find Git executable…" with no diagnostic detail.

- [ ] 🟠 **18. `getGitCommits` separator can collide with subjects.** `gitService.ts:59` uses a hand-rolled separator; the format includes `%s` (subject) and `%D` (refs), both arbitrary text. A commit message containing the literal separator string corrupts parsing for that line. **Fix:** use `-z`/`%x00` with NUL-terminated records.

- [ ] 🟡 **19. `getStashCommits` runs N+1 git calls sequentially.** `gitService.ts:357-380` does one `git log -1` per stash. Should be a single `git log <stash1> <stash2> …` or `for-each-ref refs/stash`.

- [ ] 🟡 **20. `useResizable` reads `window.innerHeight` once.** `CommitItem.tsx:68` — viewport resize doesn't update the initial height and rows opened after a resize use stale geometry.

- [ ] 🟡 **21. `searchCommits` strips non-ASCII letters.** `searchCommits.ts:9` regex `[^a-zA-Z0-9\s]` removes everything outside ASCII alphanumerics, so commits in any non-Latin script can't be searched. Diacritic stripping above only helps Latin-1.

- [ ] 🟡 **22. Empty annotated tag.** `addTag` (`gitService.ts:822-823`) sends `-m ''` when no message is provided; some git versions reject this. **Fix:** if no message, create a lightweight tag instead, or require a message in the dialog.

- [ ] 🟡 **23. Webview can't be restored across VS Code restarts.** No `WebviewPanelSerializer` registered (`extension.ts:95`). Closing the window loses the panel even though `retainContextWhenHidden` is set.

- [ ] 🟡 **24. `getNonce()` uses `Math.random()`.** `extension.ts:1139` — not crypto-safe. Use `crypto.randomBytes(16).toString('base64')`.

- [ ] 🟡 **25. CSP wildcard is too loose.** `extension.ts:1102` — `https://*.gravatar.com` allows any subdomain. Pin to `https://www.gravatar.com` and `https://secure.gravatar.com`.

- [ ] 🟢 **26. `setTimeout` in `CommitItem.tsx:88-100` has no cleanup.** Component unmount within 100ms still runs the callback (the ref-null check papers over it).

- [ ] 🟢 **27. CommitItem React keys may collide.** `Graph.tsx:123` uses `commit.hash`. The synthetic `'working-changes'` hash is unique, but two stashes with the same base hash can collide if you ever change the de-dup logic. Prefer `${hash}-${refs ?? row}`.

- [ ] 🟢 **28. Vite alias `@git` resolves to a non-existent path.** `vite.config.ts:11` → `panel/@/src`. It only works because every `@git/...` import is currently a type-only import that TS erases. The first value import will break the build.

- [ ] 🟢 **29. Pagination via `--skip` re-walks history.** `gitService.ts:534` — fine for small repos, slow for big ones. Use `--max-count` plus a `--before <last-seen-hash>` cursor.

- [ ] 🟢 **30. `fastFordwardIfPossible` typo** carried through extension.ts and gitService.ts.

## Improvements (performance / stability / maintainability)

- [ ] 🔴 **1. Replace the 880-line switch in `extension.ts` with a dispatch table.** Each case is the same `try / await gitService.X / postMessage / catch / postMessage 'gitError'` shape. Define `const handlers: Record<string, (msg, log) => Promise<{type, …}>>` and have a single 10-line wrapper that runs them, attaches `requestId`, logs, and forwards errors. Eliminates ~700 lines of boilerplate and gives you one place to fix message correlation (Bug #1).

- [ ] 🔴 **2. Memoize the SVG tree.** `useGitTree.tsx:142-300` builds the full SVG inline, so any parent rerender (hover, search-typing, etc.) reflows the entire graph. Wrap `treeComponent` in `useMemo` keyed on `[layout, expandedRow, treeWidth]`.

- [ ] 🔴 **3. Lift dialogs and shared queries out of every row.** Currently every `CommitItem` calls `useGitBranches`, `useCurrentBranch`, four dialog hooks, and two context-menu hooks. Move dialogs to an app-level `<DialogsProvider>` exposing `openTagDialog(commit)` etc.; pass `currentBranch`/`branches` down from `Graph` as props. Cuts hook count per row from ~10 to ~2.

- [ ] 🟠 **4. Add a stable webview RPC layer.** Wrap the postMessage dance once: `rpc.call('getGitCommits', payload, { timeout })` returns a Promise; reuses a single `'message'` listener and routes by `requestId`. Removes the boilerplate from every `useGitQueries` hook (~1500 of 1683 lines) and fixes Bug #1.

- [ ] 🟠 **5. Build a `hash → layout` map in `Graph.tsx`.** One pass over `rows` before the render loop fixes the O(n²) lookup (Bug #14) and the related crash on missing entries.

- [ ] 🟠 **6. Pre-index branches by commit hash for search.** `searchCommits.ts` filters all branches for each commit on every keystroke. Memoize `Map<hash, GitBranch[]>` once at the `Graph` level and pass to `matchesSearch`.

- [ ] 🟠 **7. Memoize per-commit derived strings.** `cleanSearchTerm(commit.message)` etc. run for every commit on every render. Compute a `searchableFields` blob alongside each commit once after fetch.

- [ ] 🟠 **8. Consolidate file watching and reduce refresh thrash.** Today: `repo.state.onDidChange` + 3 file-system watchers (refs/HEAD) + view-state changes all funnel through a 300ms debounce that invalidates _all_ `'git'` queries. After `git fetch` you re-pull commits, branches, remotes, tags, and working changes simultaneously. Invalidate selectively: refs change → branches/commits; HEAD change → currentBranch/commits; status change → workingChanges.

- [ ] 🟠 **9. Switch to `-z` + NUL parsing in gitService.** Fixes Bug #9, Bug #18, and a class of latent path bugs (filenames with tabs/newlines). Single change with broad payoff.

- [ ] 🟠 **10. Wire `clearCache()` to `vscode.workspace.onDidChangeConfiguration` for `git.path`.** One-line fix to Bug #12.

- [ ] 🟠 **11. Trim `.vscodeignore`.** The packaged `.vsix` currently includes `git-go-demo.mov` (12M), `git-go-demo.gif` (3.6M), `git-go-graph.png`, `icon.af`, `output.txt`, `TODO.md`, `PUBLISH.md`, `.instructions.md`. Add them to `.vscodeignore` — should drop the bundle by ~16M.

- [ ] 🟡 **12. Register a `WebviewPanelSerializer`.** Needed to make `retainContextWhenHidden` actually mean something across VS Code restarts.

- [ ] 🟡 **13. Replace `setInterval` polling with `extension.activate()`.** Cleaner and removes the re-entrancy bug.

- [ ] 🟡 **14. Single batched git log for stashes.** Replaces N+1 calls in `getStashCommits`.

- [ ] 🟡 **15. Mutation deduplication.** Wrap `useMutation` calls so a second click is ignored while one is pending. Today, hammering "Fetch" runs N sequential `git fetch --all` calls.

- [ ] 🟡 **16. Move BRANCH_COLORS to CSS variables.** Hardcoded hex colors in `useGitTree.tsx:6-15` ignore VS Code themes. Use `--vscode-charts-*` tokens.

- [ ] 🟡 **17. Memoize `buildFileTree`.** `CommitItem.tsx:390` rebuilds the tree per render.

- [ ] 🟡 **18. Type the webview message protocol.** Define `type ExtToWebMessage = { type: 'gitCommits'; commits: …; requestId: … } | …` and `type WebToExtMessage = …`. Today the message envelope is `any`-typed on both sides; renames silently miss handlers.

- [ ] 🟡 **19. Use `import type` consistently.** Webview imports interfaces from `@git/gitService`; some are `import type`, some plain `import`. Make them all `import type` so a future value import doesn't trip Vite's broken alias (Bug #28). Or fix the alias to `path.resolve(__dirname, '../src')`.

- [ ] 🟡 **20. Replace the singleton `GitService` with one per repo.** Combined with multi-root support (Bug #13), this naturally scopes caching.

- [ ] 🟡 **21. Use `Set<string>` for branch lookups.** `branches.some(...)` calls in `CommitItem.tsx:139` and similar are O(n) per pill.

- [ ] 🟢 **22. Fix the `fastFordwardIfPossible` typo.** Then deprecate the misspelled config key.

- [ ] 🟢 **23. Align React versions.** `panel/package.json` ships React 18 with `@types/react@19`. Upgrade React to 19 or pin types to 18.

- [ ] 🟢 **24. Replace inline `new Date()` in `CommitItem`.** Compute the formatter outside the component; reuse `Intl.DateTimeFormat` instances.

- [ ] 🟢 **25. Remove dev artifacts from the repo.** `output.txt`, `TODO.md`, `.instructions.md` either belong in `.gitignore` or in `docs/`.

- [ ] 🟢 **26. ESLint/typescript versions in `package.json`** — `eslint ^10.2.1` and `typescript ^6.0.3` look like fictional versions. Pin to a real installable range.

- [ ] 🟢 **27. Status-bar item global singleton.** `statusBarItem.ts:5` keeps a module-level `existingStatusBarItem` to deduplicate across activations. With one-instance-per-extension that's unnecessary; the disposal pattern in `activate` already handles it.

### Maybe

- [ ] Better git errors
- [ ] Search subfolders for git repos and show a dropdown to select one
- [ ] Show if tag it pushed to the remote
