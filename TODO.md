## TODO

## Bugs

## Improvements (performance / stability / maintainability)

- [ ] 🔴 **3. Lift dialogs and shared queries out of every row.** Currently every `CommitItem` calls `useGitBranches`, `useCurrentBranch`, four dialog hooks, and two context-menu hooks. Move dialogs to an app-level `<DialogsProvider>` exposing `openTagDialog(commit)` etc.; pass `currentBranch`/`branches` down from `Graph` as props. Cuts hook count per row from ~10 to ~2.

- [ ] 🟠 **6. Pre-index branches by commit hash for search.** `searchCommits.ts` filters all branches for each commit on every keystroke. Memoize `Map<hash, GitBranch[]>` once at the `Graph` level and pass to `matchesSearch`.

- [ ] 🟠 **7. Memoize per-commit derived strings.** `cleanSearchTerm(commit.message)` etc. run for every commit on every render. Compute a `searchableFields` blob alongside each commit once after fetch.

- [ ] 🟡 **15. Mutation deduplication.** Wrap `useMutation` calls so a second click is ignored while one is pending. Today, hammering "Fetch" runs N sequential `git fetch --all` calls.

- [ ] 🟡 **21. Use `Set<string>` for branch lookups.** `branches.some(...)` calls in `CommitItem.tsx:139` and similar are O(n) per pill.

### Maybe

- [ ] Better git errors
- [ ] Search subfolders for git repos and show a dropdown to select one
- [ ] Show if tag it pushed to the remote
