import { CommitItem } from '@/component/CommitItem'
import { useSettings } from '@/context/SettingsContext'
import { useCommitHighlight } from '@/hook/useCommitHighlight'
import { useGitBranches, useInfiniteGitCommits, useWorkingChanges } from '@/hook/useGitQueries'
import { LIST_PADDING, ROW_HEIGHT, useGitTree } from '@/hook/useGitTree'
import { matchesSearch } from '@/util/searchCommits'
import { faCircleNotch, faCodeBranch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useInfiniteGitCommits(selectedBranches)

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
  // the new selection already fits and no scroll is needed.
  const expandAnimationRef = useRef<'click' | 'keyboard' | null>(null)
  const pendingNavScrollRef = useRef<{ target: number | null } | null>(null)

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

  const toggleCommit = useCallback((hash: string) => {
    expandAnimationRef.current = 'click'
    setExpandedHash(prev => (prev === hash ? null : hash))
  }, [])

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

      // If the newly selected commit and its panel won't fit in the viewport as-is, pin the
      // new section to the exact screen position the old one occupies: the target scrollTop is
      // computed from the old section's measured position, so repeated presses cannot drift by
      // rounding (a relative pan would accumulate sub-pixel quantization on scaled displays)
      let target: number | null = null
      const container = scrollRef.current
      if (container) {
        const newTop = LIST_PADDING + nextIndex * ROW_HEIGHT
        const newBottom = newTop + ROW_HEIGHT + expandedCommitHeight
        const viewTop = container.scrollTop
        const viewBottom = viewTop + container.clientHeight

        if (newTop < viewTop || newBottom > viewBottom) {
          const oldSection = container.querySelector(`[data-commit-row="${expandedRow}"]`)
          const currentOffset = oldSection
            ? oldSection.getBoundingClientRect().top - container.getBoundingClientRect().top
            : LIST_PADDING + expandedRow * ROW_HEIGHT - viewTop

          target = newTop - currentOffset
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
              shouldAnimateIntoView={consumeExpandAnimation}
              selectedBranches={selectedBranches}
              treeWidth={treeWidth}
              onCommitHover={onCommitHover}
              row={virtualRow.index}
              layout={layout}
              uncommitedFiles={commit.isUncommitted ? workingChangesData?.files : undefined}
              dimmed={!matchesSearch(commit, branches, searchTerm)}
            />
          </div>
        )
      })}
    </div>
  )
}
