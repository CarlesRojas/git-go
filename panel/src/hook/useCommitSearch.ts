import { SearchMatchState } from '@/context/SearchContext'
import { getVSCodeApi } from '@/hook/useGitQueries'
import { matchesSearch } from '@/util/searchCommits'
import { sendCorrelatedMessage } from '@/util/sendCorrelatedMessage'
import type { GitBranch, GitCommit } from '@git/gitService'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UseCommitSearchProps {
  searchTerm: string
  selectedBranches: GitBranch[]
  branches: GitBranch[]
  /** The loaded rows, in graph order (working changes and stashes included) */
  commits: GitCommit[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  scrollToRow: (row: number) => void
}

interface UseCommitSearchResult {
  /** Whether a row matches the active search; always true while there is no search */
  isMatch: (commit: GitCommit) => boolean
  currentMatchHash: string | null
  matchState: SearchMatchState | null
  navigate: (direction: 'next' | 'prev') => void
}

/**
 * The active search over the graph: matches come from the git-side search of the whole history
 * (message, author, hash, or a `file:` pathspec) merged with client-side matching of the loaded
 * rows (which also sees branch pills, tags and stashes). Prev/next walks the matches in graph
 * order; jumping to a match beyond the loaded pages keeps fetching until its row exists, then
 * scrolls the virtualizer to it.
 */
export const useCommitSearch = ({
  searchTerm,
  selectedBranches,
  branches,
  commits,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  scrollToRow,
}: UseCommitSearchProps): UseCommitSearchResult => {
  const term = searchTerm.trim()
  const active = term.length > 0
  const branchNames = selectedBranches.map(branch => branch.name)

  const { data: gitHashes, isFetching: isSearchFetching } = useQuery({
    queryKey: ['git', 'search', { term, branches: branchNames }],
    queryFn: async (): Promise<string[]> => {
      const response = await sendCorrelatedMessage<{ hashes: string[] }>(
        'searchCommits',
        { term, branches: branchNames.length > 0 ? branchNames : undefined },
        30_000,
      )
      return response.hashes
    },
    enabled: active,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    // A superseded search is aborted extension-side and rejects; retrying would race the newer one
    retry: false,
  })

  // Clearing the term stops the extension-side search still in flight
  const wasActiveRef = useRef(false)
  useEffect(() => {
    if (wasActiveRef.current && !active) getVSCodeApi().postMessage({ type: 'cancelSearch' })
    wasActiveRef.current = active
  }, [active])

  const gitMatchSet = useMemo(() => (gitHashes ? new Set(gitHashes) : null), [gitHashes])

  const isMatch = useCallback(
    (commit: GitCommit): boolean => {
      if (!active) return true
      return matchesSearch(commit, branches, term) || (gitMatchSet?.has(commit.hash) ?? false)
    },
    [active, branches, term, gitMatchSet],
  )

  // Every match ordered as the graph shows them: the matching loaded rows first (they are a
  // prefix of the log order), then the git-side matches whose pages are not loaded yet
  const { matchHashes, loadedMatchRows } = useMemo(() => {
    const rows = new Map<string, number>()
    const ordered: string[] = []
    if (!active) return { matchHashes: ordered, loadedMatchRows: rows }

    commits.forEach((commit, row) => {
      if (isMatch(commit)) {
        ordered.push(commit.hash)
        rows.set(commit.hash, row)
      }
    })

    if (gitHashes) {
      const loaded = new Set(commits.map(commit => commit.hash))
      for (const hash of gitHashes) if (!loaded.has(hash)) ordered.push(hash)
    }

    return { matchHashes: ordered, loadedMatchRows: rows }
  }, [active, commits, gitHashes, isMatch])

  const [currentMatchHash, setCurrentMatchHash] = useState<string | null>(null)
  /** A jump whose match is beyond the loaded pages, fetching until its row exists */
  const [pendingHash, setPendingHash] = useState<string | null>(null)

  useEffect(() => {
    setCurrentMatchHash(null)
    setPendingHash(null)
  }, [term])

  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (matchHashes.length === 0) return

      const index = currentMatchHash ? matchHashes.indexOf(currentMatchHash) : -1
      let next: number
      if (index === -1) next = direction === 'next' ? 0 : matchHashes.length - 1
      else if (direction === 'next') next = (index + 1) % matchHashes.length
      else next = (index - 1 + matchHashes.length) % matchHashes.length

      const target = matchHashes[next]
      if (!target) return

      setCurrentMatchHash(target)

      const row = loadedMatchRows.get(target)
      if (row !== undefined) {
        setPendingHash(null)
        scrollToRow(row)
      } else {
        setPendingHash(target)
      }
    },
    [matchHashes, currentMatchHash, loadedMatchRows, scrollToRow],
  )

  useEffect(() => {
    if (pendingHash === null) return

    const row = commits.findIndex(commit => commit.hash === pendingHash)
    if (row !== -1) {
      setPendingHash(null)
      scrollToRow(row)
      return
    }

    if (isFetchingNextPage) return
    if (hasNextPage) fetchNextPage()
    else setPendingHash(null) // every page is loaded and the hash never appeared: give up
  }, [pendingHash, commits, isFetchingNextPage, hasNextPage, fetchNextPage, scrollToRow])

  const currentIndex = currentMatchHash ? matchHashes.indexOf(currentMatchHash) : -1

  const matchState = useMemo<SearchMatchState | null>(() => {
    if (!active) return null
    return {
      current: currentIndex + 1,
      total: matchHashes.length,
      isSearching: isSearchFetching || pendingHash !== null,
    }
  }, [active, currentIndex, matchHashes.length, isSearchFetching, pendingHash])

  return { isMatch, currentMatchHash, matchState, navigate }
}
