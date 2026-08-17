import { SearchMatchState } from '@/context/SearchContext'
import { getVSCodeApi } from '@/hook/useGitQueries'
import { matchesSearch } from '@/util/searchCommits'
import { sendCorrelatedMessage } from '@/util/sendCorrelatedMessage'
import type { GitBranch, GitCommit } from '@git/gitService'
import { useQuery } from '@tanstack/react-query'
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'

/** The first oversized page a jump fetches; each further page while still jumping doubles it */
const INITIAL_JUMP_PAGE_SIZE = 1000
const MAX_JUMP_PAGE_SIZE = 5000

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
  /** Shared with useInfiniteGitCommits so a jump can cross the gap in a few big pages */
  jumpPageSizeRef: RefObject<number | null>
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
  jumpPageSizeRef,
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
    jumpPageSizeRef.current = null
  }, [term, jumpPageSizeRef])

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
        jumpPageSizeRef.current = null
        scrollToRow(row)
      } else {
        jumpPageSizeRef.current = null // each jump starts its page growth over
        setPendingHash(target)
      }
    },
    [matchHashes, currentMatchHash, loadedMatchRows, scrollToRow, jumpPageSizeRef],
  )

  useEffect(() => {
    if (pendingHash === null) return

    const row = commits.findIndex(commit => commit.hash === pendingHash)
    if (row !== -1) {
      setPendingHash(null)
      jumpPageSizeRef.current = null
      scrollToRow(row)
      return
    }

    if (isFetchingNextPage) return
    if (hasNextPage) {
      // Cross the gap in a few growing pages instead of hundreds of regular ones
      jumpPageSizeRef.current =
        jumpPageSizeRef.current === null
          ? INITIAL_JUMP_PAGE_SIZE
          : Math.min(MAX_JUMP_PAGE_SIZE, jumpPageSizeRef.current * 2)
      fetchNextPage()
    } else {
      setPendingHash(null) // every page is loaded and the hash never appeared: give up
      jumpPageSizeRef.current = null
    }
  }, [pendingHash, commits, isFetchingNextPage, hasNextPage, fetchNextPage, scrollToRow, jumpPageSizeRef])

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
