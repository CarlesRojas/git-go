## TODO

## Bugs

- [ ] 🔴 **1. No request/response correlation in webview ↔ extension messages.** Every query in `panel/src/hook/useGitQueries.ts` listens for the same generic `'gitError'` type. If two operations are in flight and one fails, every in-flight queryFn rejects with that one error. Same problem with success messages: a stray `getGitCommits` and a `useInfiniteGitCommits` both fire on `'gitCommits'` and may resolve with each other's payload. **Fix:** add a `requestId` to every postMessage and route by it.

- [ ] 🟢 **26. `setTimeout` in `CommitItem.tsx:88-100` has no cleanup.** Component unmount within 100ms still runs the callback (the ref-null check papers over it).

- [ ] 🟢 **29. Pagination via `--skip` re-walks history.** `gitService.ts:534` — fine for small repos, slow for big ones. Use `--max-count` plus a `--before <last-seen-hash>` cursor.

## Improvements (performance / stability / maintainability)

- [ ] 🔴 **1. Replace the 880-line switch in `extension.ts` with a dispatch table.** Each case is the same `try / await gitService.X / postMessage / catch / postMessage 'gitError'` shape. Define `const handlers: Record<string, (msg, log) => Promise<{type, …}>>` and have a single 10-line wrapper that runs them, attaches `requestId`, logs, and forwards errors. Eliminates ~700 lines of boilerplate and gives you one place to fix message correlation (Bug #1).

- [ ] 🔴 **2. Memoize the SVG tree.** `useGitTree.tsx:142-300` builds the full SVG inline, so any parent rerender (hover, search-typing, etc.) reflows the entire graph. Wrap `treeComponent` in `useMemo` keyed on `[layout, expandedRow, treeWidth]`.

- [ ] 🔴 **3. Lift dialogs and shared queries out of every row.** Currently every `CommitItem` calls `useGitBranches`, `useCurrentBranch`, four dialog hooks, and two context-menu hooks. Move dialogs to an app-level `<DialogsProvider>` exposing `openTagDialog(commit)` etc.; pass `currentBranch`/`branches` down from `Graph` as props. Cuts hook count per row from ~10 to ~2.

- [ ] 🟠 **4. Add a stable webview RPC layer.** Wrap the postMessage dance once: `rpc.call('getGitCommits', payload, { timeout })` returns a Promise; reuses a single `'message'` listener and routes by `requestId`. Removes the boilerplate from every `useGitQueries` hook (~1500 of 1683 lines) and fixes Bug #1.

- [ ] 🟠 **5. Build a `hash → layout` map in `Graph.tsx`.** One pass over `rows` before the render loop fixes the O(n²) lookup (Bug #14) and the related crash on missing entries.

- [ ] 🟠 **6. Pre-index branches by commit hash for search.** `searchCommits.ts` filters all branches for each commit on every keystroke. Memoize `Map<hash, GitBranch[]>` once at the `Graph` level and pass to `matchesSearch`.

- [ ] 🟠 **7. Memoize per-commit derived strings.** `cleanSearchTerm(commit.message)` etc. run for every commit on every render. Compute a `searchableFields` blob alongside each commit once after fetch.

- [ ] 🟠 **8. Consolidate file watching and reduce refresh thrash.** Today: `repo.state.onDidChange` + 3 file-system watchers (refs/HEAD) + view-state changes all funnel through a 300ms debounce that invalidates _all_ `'git'` queries. After `git fetch` you re-pull commits, branches, remotes, tags, and working changes simultaneously. Invalidate selectively: refs change → branches/commits; HEAD change → currentBranch/commits; status change → workingChanges.

- [-] 🟠 **9. Switch to `-z` + NUL parsing in gitService.** Fixes Bug #9, Bug #18, and a class of latent path bugs (filenames with tabs/newlines). Single change with broad payoff. **PARTIAL:** Fixed Bug #18 (`getGitCommits`). Still need to apply to other methods (`getCommitFiles`, `getWorkingChanges`, `getStashFiles`).

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

- [ ] 🟢 **23. Align React versions.** `panel/package.json` ships React 18 with `@types/react@19`. Upgrade React to 19 or pin types to 18.

- [ ] 🟢 **24. Replace inline `new Date()` in `CommitItem`.** Compute the formatter outside the component; reuse `Intl.DateTimeFormat` instances.

- [ ] 🟢 **25. Remove dev artifacts from the repo.** `output.txt`, `TODO.md`, `.instructions.md` either belong in `.gitignore` or in `docs/`.

- [ ] 🟢 **26. ESLint/typescript versions in `package.json`** — `eslint ^10.2.1` and `typescript ^6.0.3` look like fictional versions. Pin to a real installable range.

- [ ] 🟢 **27. Status-bar item global singleton.** `statusBarItem.ts:5` keeps a module-level `existingStatusBarItem` to deduplicate across activations. With one-instance-per-extension that's unnecessary; the disposal pattern in `activate` already handles it.

### Maybe

- [ ] Better git errors
- [ ] Search subfolders for git repos and show a dropdown to select one
- [ ] Show if tag it pushed to the remote
