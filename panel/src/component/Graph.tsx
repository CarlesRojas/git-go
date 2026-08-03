import { CommitItem } from '@/component/CommitItem'
import { useSettings } from '@/context/SettingsContext'
import { useCommitHighlight } from '@/hook/useCommitHighlight'
import { useGitBranches, useInfiniteGitCommits, useWorkingChanges } from '@/hook/useGitQueries'
import { ROW_HEIGHT, useGitTree } from '@/hook/useGitTree'
import { matchesSearch } from '@/util/searchCommits'
import { faCircleNotch, faCodeBranch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useVirtualizer } from '@tanstack/react-virtual'
import { FC, Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

/** Rows kept mounted on either side of the window, so scrolling does not race the render */
const OVERSCAN = 12

/** How coarsely the tree is told which rows are on screen, in rows */
const ROW_BLOCK = 256

interface GraphProps {
  selectedBranches: GitBranch[]
  searchTerm?: string
}

export const Graph: FC<GraphProps> = ({ selectedBranches, searchTerm = '' }) => {
  const [expandedHash, setExpandedHash] = useState<string | null>(null)
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)
  const { settings } = useSettings()

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
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

  // The graph scrolls inside the container the toolbar leaves it, which the rows are nested in
  // rather than owning. A stable callback keeps React from re-running it on every render
  const scrollElementRef = useCallback((element: HTMLDivElement | null) => {
    setScrollElement(element?.closest<HTMLElement>('[data-drag-scroll-container]') ?? null)
  }, [])

  // Every row is exactly one row tall, except the expanded one, which the commit itself pins to
  // the configured height. Sizes are therefore known without measuring anything
  const estimateSize = useCallback(
    (index: number) => ROW_HEIGHT + (index === expandedRow ? settings.expandedCommitHeight : 0),
    [expandedRow, settings.expandedCommitHeight],
  )

  // Stable identities matter here: the virtualizer rebuilds the size of every row it knows about
  // whenever one of these changes, so a fresh function each render is a fresh pass over the
  // whole history on every frame of a scroll
  const getItemKey = useCallback((index: number) => commits[index]?.hash ?? index, [commits])

  const virtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => scrollElement,
    estimateSize,
    overscan: OVERSCAN,
    getItemKey,
  })

  const virtualRows = virtualizer.getVirtualItems()

  // Sizes are cached, so expanding a commit or changing how tall an expanded commit is has to say
  // that the cache is stale
  useEffect(() => {
    virtualizer.measure()
  }, [virtualizer, expandedRow, settings.expandedCommitHeight])

  // The window is rounded out to whole blocks of rows before the tree sees it. Handing over the
  // exact window instead would redraw the tree on every frame of a scroll, which costs more than
  // the rows the drawing saves
  const firstIndex = virtualRows[0]?.index
  const lastIndex = virtualRows[virtualRows.length - 1]?.index

  const visibleRows = useMemo(() => {
    if (firstIndex === undefined || lastIndex === undefined) return undefined

    return {
      start: Math.floor(firstIndex / ROW_BLOCK) * ROW_BLOCK,
      end: (Math.floor(lastIndex / ROW_BLOCK) + 1) * ROW_BLOCK - 1,
    }
  }, [firstIndex, lastIndex])

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow, visibleRows)

  // Reaching the last row is what asks for the next page, now that there is no sentinel element
  // sitting at the bottom of the list to scroll into view
  useEffect(() => {
    const last = virtualRows[virtualRows.length - 1]
    if (!last) return
    if (last.index < commits.length - 1) return
    if (!hasNextPage || isFetchingNextPage) return

    fetchNextPage()
  }, [virtualRows, commits.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  const layoutMap = useMemo(() => {
    const map = new Map()

    for (const row of rows) map.set(row.commit.hash, row)

    return map
  }, [rows])

  const { onCommitHover } = useCommitHighlight({ enabled: searchTerm.trim() === '' })

  const toggleExpanded = useCallback((hash: string) => {
    setExpandedHash(prev => (prev === hash ? null : hash))
  }, [])

  const navigateCommit = useCallback(
    (direction: 'up' | 'down') => {
      if (expandedRow === undefined || commits.length === 0) return

      let nextIndex: number
      if (direction === 'up') nextIndex = expandedRow > 0 ? expandedRow - 1 : 0
      else nextIndex = expandedRow < commits.length - 1 ? expandedRow + 1 : commits.length - 1

      const nextCommit = commits[nextIndex]
      if (nextIndex === expandedRow || !nextCommit) return

      setExpandedHash(nextCommit.hash)

      // The next row may not be mounted, so it cannot scroll itself into view
      virtualizer.scrollToIndex(nextIndex, { align: 'auto' })
    },
    [expandedRow, commits, virtualizer],
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
    <Fragment>
      {commits.length > 0 && treeComponent}

      <div className="w-full py-3" ref={scrollElementRef}>
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualRows.map(virtualRow => {
            const commit = commits[virtualRow.index]
            const layout = commit ? layoutMap.get(commit.hash) : undefined
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
                  onToggle={toggleExpanded}
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
      </div>
    </Fragment>
  )
}
