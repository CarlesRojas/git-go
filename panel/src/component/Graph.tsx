import { CommitItem } from '@/component/CommitItem'
import { useCompare } from '@/context/CompareContext'
import { useSearch } from '@/context/SearchContext'
import { useSettings } from '@/context/SettingsContext'
import { useCommitHighlight } from '@/hook/useCommitHighlight'
import { useCommitSearch } from '@/hook/useCommitSearch'
import { useGitBranches, useInfiniteGitCommits, useWorkingChanges } from '@/hook/useGitQueries'
import { LIST_PADDING, ROW_HEIGHT, useGitTree } from '@/hook/useGitTree'
import { faCircleNotch, faCodeBranch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { commitSide, hashSide } from '@/util/compare'
import { GitBranch } from '@git/gitService'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FC, RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

/** Start fetching the next page when fewer than this many loaded rows remain below the viewport */
const LOAD_MORE_THRESHOLD = 40

interface GraphProps {
  selectedBranches: GitBranch[]
  searchTerm?: string
  scrollRef: RefObject<HTMLElement | null>
}

export const Graph: FC<GraphProps> = ({ selectedBranches, searchTerm = '', scrollRef }) => {
  const [expandedHash, setExpandedHash] = useState<string | null>(null)
  const { settings } = useSettings()

  // Set by search jumps so the pages crossing the gap to a far-away match come in big chunks
  const jumpPageSizeRef = useRef<number | null>(null)

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useInfiniteGitCommits(selectedBranches, 200, jumpPageSizeRef)

  const { data: workingChangesData } = useWorkingChanges(true)
  const { data: branches = [], error: gitError, isLoading: isBranchesLoading } = useGitBranches()

  const commits = useMemo(() => {
    const gitCommits = data?.pages.flatMap(page => page.commits) ?? []
    const filteredCommits = settings.showStashes ? gitCommits : gitCommits.filter(c => !c.isStash)

    if (workingChangesData?.commit) return [workingChangesData.commit, ...filteredCommits]

    return filteredCommits
  }, [data, workingChangesData, settings.showStashes])

  // Derived from the current list so the expanded gap tracks the commit when new rows appear (e.g. after a fetch)
  const expandedRow = useMemo(() => {
    if (expandedHash === null) return undefined
    const row = commits.findIndex(commit => commit.hash === expandedHash)
    return row === -1 ? undefined : row
  }, [commits, expandedHash])

  const expandedCommitHeight = settings.expandedCommitHeight

  const virtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: useCallback(
      (index: number) => (index === expandedRow ? ROW_HEIGHT + expandedCommitHeight : ROW_HEIGHT),
      [expandedRow, expandedCommitHeight],
    ),
    getItemKey: useCallback((index: number) => commits[index]?.hash ?? index, [commits]),
    overscan: 10,
    paddingStart: LIST_PADDING,
    paddingEnd: LIST_PADDING,
  })

  // How the expansion last changed: a click animates the commit into view, while arrow-key
  // navigation pans the scroll itself. The pending object marks a keyboard move (its presence
  // skips the anchor compensation); target is the absolute scrollTop to jump to, or null when
  // the new selection already fits and no scroll is needed. The pinned offset anchors where a
  // run of pinning presses keeps the selection on screen: computed once in layout units when
  // the run starts, so neither scroll quantization nor webview zoom can drift it press by
  // press (rect measurements are zoom-scaled and must not enter this math).
  const expandAnimationRef = useRef<'click' | 'keyboard' | null>(null)
  const pendingNavScrollRef = useRef<{ target: number | null } | null>(null)
  const pinnedNavOffsetRef = useRef<number | null>(null)
  const lastNavTargetRef = useRef<number | null>(null)

  // A manual scroll (wheel, scrollbar...) between presses ends the pinning run: the next press
  // re-anchors to wherever the selection sits then. Our own jumps land on the last target.
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onScroll = () => {
      if (pinnedNavOffsetRef.current === null) return
      const expected = lastNavTargetRef.current
      if (expected === null || Math.abs(container.scrollTop - expected) > 2) pinnedNavOffsetRef.current = null
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [scrollRef])

  // Row sizes are derived, not measured, so a changed expanded row must flush the size cache.
  // When the resized row sits above the viewport, shifting the scroll offset by the same amount
  // keeps the rows on screen exactly where they were.
  const previousExpandedRef = useRef<{ row: number | undefined; height: number } | null>(null)
  useLayoutEffect(() => {
    const previous = previousExpandedRef.current
    previousExpandedRef.current = { row: expandedRow, height: expandedCommitHeight }
    if (previous === null) return
    if (previous.row === expandedRow && previous.height === expandedCommitHeight) return

    virtualizer.measure()

    const container = scrollRef.current
    if (!container) {
      pendingNavScrollRef.current = null
      return
    }

    // Arrow-key navigation: jump to the precomputed absolute offset, instantly, and skip the
    // anchor compensation below — the jump itself is what keeps the selected commit in place
    if (pendingNavScrollRef.current !== null) {
      const { target } = pendingNavScrollRef.current
      pendingNavScrollRef.current = null
      if (target !== null) container.scrollTop = target
      return
    }

    const rowTop = (row: number, expanded: number | undefined, height: number) =>
      LIST_PADDING + row * ROW_HEIGHT + (expanded !== undefined && row > expanded ? height : 0)

    // The first row fully at/below the old viewport top anchors the viewport: whatever offset
    // it gained or lost from the resize is applied to the scroll position too
    const scrollTop = container.scrollTop
    let low = 0
    let high = commits.length - 1
    let anchor = commits.length
    while (low <= high) {
      const mid = (low + high) >> 1
      if (rowTop(mid, previous.row, previous.height) >= scrollTop) {
        anchor = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }
    if (anchor >= commits.length) return

    const delta = rowTop(anchor, expandedRow, expandedCommitHeight) - rowTop(anchor, previous.row, previous.height)
    if (delta !== 0) container.scrollTop = scrollTop + delta
  }, [expandedRow, expandedCommitHeight, virtualizer, scrollRef, commits.length])

  const virtualItems = virtualizer.getVirtualItems()
  const firstVirtualRow = virtualItems[0]
  const lastVirtualRow = virtualItems[virtualItems.length - 1]

  const range = useMemo(
    () => ({ startRow: firstVirtualRow?.index ?? 0, endRow: lastVirtualRow?.index ?? -1 }),
    [firstVirtualRow?.index, lastVirtualRow?.index],
  )

  // Infinite loading, driven by the last rendered row instead of a sentinel element. A failed
  // page fetch stops the loading (instead of retrying on every render) until the next refetch.
  const lastVirtualIndex = lastVirtualRow?.index
  useEffect(() => {
    if (lastVirtualIndex === undefined) return
    if (lastVirtualIndex < commits.length - LOAD_MORE_THRESHOLD) return
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage()
  }, [lastVirtualIndex, commits.length, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage])

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow, range)

  const { onCommitHover } = useCommitHighlight({ enabled: searchTerm.trim() === '' })

  const scrollToRow = useCallback((row: number) => virtualizer.scrollToIndex(row, { align: 'center' }), [virtualizer])

  const {
    isMatch,
    currentMatchHash,
    matchState,
    navigate: navigateSearch,
  } = useCommitSearch({
    searchTerm,
    selectedBranches,
    branches,
    commits,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    scrollToRow,
    jumpPageSizeRef,
  })

  // Publish the match counter and the prev/next navigator to the toolbar's search input
  const { setMatchState, registerNavigator } = useSearch()
  useEffect(() => {
    setMatchState(matchState)
    return () => setMatchState(null)
  }, [matchState, setMatchState])
  useEffect(() => {
    registerNavigator(navigateSearch)
    return () => registerNavigator(null)
  }, [navigateSearch, registerNavigator])

  const toggleCommit = useCallback((hash: string) => {
    expandAnimationRef.current = 'click'
    pinnedNavOffsetRef.current = null
    setExpandedHash(prev => (prev === hash ? null : hash))
  }, [])

  // The expanded commit is what "compare with selected" starts from, wherever it is invoked
  const { comparison, selected, setSelected, compare } = useCompare()

  const expandedCommit = expandedRow === undefined ? undefined : commits[expandedRow]
  useEffect(() => {
    setSelected(expandedCommit && !expandedCommit.isUncommitted ? commitSide(expandedCommit) : null)
  }, [expandedCommit, setSelected])

  // Ctrl/Cmd+click a second commit to compare it with the expanded one, rather than expanding it.
  // Keyed by hash rather than the commit, so a page fetch does not re-render every mounted row.
  const compareWithExpanded = useCallback(
    (hash: string) => {
      if (!selected || selected.hash === hash) return
      compare(selected, hashSide(hash))
    },
    [selected, compare],
  )

  // Consumed once by the newly expanded row: only a click plays the scroll-into-view animation
  const consumeExpandAnimation = useCallback(() => {
    const source = expandAnimationRef.current
    expandAnimationRef.current = null
    return source === 'click'
  }, [])

  const navigateCommit = useCallback(
    (direction: 'up' | 'down') => {
      if (expandedRow === undefined || commits.length === 0) return

      let nextIndex: number
      if (direction === 'up') nextIndex = expandedRow > 0 ? expandedRow - 1 : 0
      else nextIndex = expandedRow < commits.length - 1 ? expandedRow + 1 : commits.length - 1

      const nextCommit = commits[nextIndex]
      if (nextIndex === expandedRow || !nextCommit) return

      // If the newly selected commit and its panel won't fit in the viewport as-is, pin it to
      // the screen position the selection had when this run of presses started crossing the
      // edge — every press targets an absolute scrollTop derived from that one anchor, so the
      // selection lands in exactly the same place press after press
      let target: number | null = null
      const container = scrollRef.current
      if (container) {
        const sectionHeight = ROW_HEIGHT + expandedCommitHeight
        const newTop = LIST_PADDING + nextIndex * ROW_HEIGHT
        const viewTop = container.scrollTop
        const viewHeight = container.clientHeight

        if (newTop < viewTop || newTop + sectionHeight > viewTop + viewHeight) {
          if (pinnedNavOffsetRef.current === null) {
            // Where the current selection sits now, clamped so the pin lands fully in view
            const currentOffset = LIST_PADDING + expandedRow * ROW_HEIGHT - viewTop
            const maxOffset = Math.max(0, viewHeight - sectionHeight)
            pinnedNavOffsetRef.current = Math.max(0, Math.min(currentOffset, maxOffset))
          }

          target = newTop - pinnedNavOffsetRef.current
          lastNavTargetRef.current = target
        } else {
          pinnedNavOffsetRef.current = null
        }
      }

      expandAnimationRef.current = 'keyboard'
      pendingNavScrollRef.current = { target }
      setExpandedHash(nextCommit.hash)
    },
    [expandedRow, commits, scrollRef, expandedCommitHeight],
  )

  useEventListener(
    'keydown',
    useCallback(
      (event: KeyboardEvent) => {
        if (expandedHash === null) return
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return

        const target = event.target as HTMLElement | null
        if (!target) return
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest(
            '[role="dialog"], [role="menu"], [role="menuitem"], [role="listbox"], [role="combobox"], [role="grid"]',
          )
        )
          return

        event.preventDefault()
        navigateCommit(event.key === 'ArrowUp' ? 'up' : 'down')
      },
      [expandedHash, navigateCommit],
    ),
  )

  if ((isLoading || isBranchesLoading) && !data) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin" />
        <p className="text-xs">Loading git history...</p>
      </div>
    )
  }

  const isNoGitRepo = gitError?.message === 'Not a git repository'
  if (isNoGitRepo) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <div className="flex min-w-0 flex-row items-center gap-2">
          <FontAwesomeIcon icon={faCodeBranch} className="text-vsc-error-fg size-4" />
          No git repository found
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faTimesCircle} className="text-vsc-error-fg size-4" />
        <p className="text-vsc-error-fg text-xs">Error loading git history</p>
      </div>
    )
  }

  return (
    // shrink-0: the scroll container is a flex column, and this div's height is entirely
    // absolutely-positioned rows — without it, flex would shrink it to the viewport
    <div className="relative w-full shrink-0" style={{ height: virtualizer.getTotalSize() }}>
      {commits.length > 0 && treeComponent}

      {virtualItems.map(virtualRow => {
        const commit = commits[virtualRow.index]
        const layout = rows[virtualRow.index]
        if (!commit || !layout) return null

        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            <CommitItem
              commit={commit}
              isExpanded={expandedHash === commit.hash}
              onToggle={toggleCommit}
              onCompareWithSelected={compareWithExpanded}
              canCompare={!!selected && selected.hash !== commit.hash && !commit.isUncommitted}
              compareRole={
                comparison?.from.hash === commit.hash ? 'from' : comparison?.to.hash === commit.hash ? 'to' : undefined
              }
              shouldAnimateIntoView={consumeExpandAnimation}
              selectedBranches={selectedBranches}
              treeWidth={treeWidth}
              onCommitHover={onCommitHover}
              row={virtualRow.index}
              layout={layout}
              uncommitedFiles={commit.isUncommitted ? workingChangesData?.files : undefined}
              dimmed={!isMatch(commit)}
              isCurrentSearchMatch={currentMatchHash === commit.hash}
            />
          </div>
        )
      })}
    </div>
  )
}
