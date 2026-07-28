import { CommitItem } from '@/component/CommitItem'
import { useSettings } from '@/context/SettingsContext'
import { useCommitHighlight } from '@/hook/useCommitHighlight'
import { useGitBranches, useInfiniteGitCommits, useWorkingChanges } from '@/hook/useGitQueries'
import { useGitTree } from '@/hook/useGitTree'
import { matchesSearch } from '@/util/searchCommits'
import { faCircleNotch, faCodeBranch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { FC, Fragment, useCallback, useMemo, useState } from 'react'
import { useEventListener, useIntersectionObserver } from 'usehooks-ts'

interface GraphProps {
  selectedBranches: GitBranch[]
  searchTerm?: string
}

export const Graph: FC<GraphProps> = ({ selectedBranches, searchTerm = '' }) => {
  const [expandedHash, setExpandedHash] = useState<string | null>(null)
  const { settings } = useSettings()

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteGitCommits(selectedBranches)

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    onChange: isIntersecting => {
      if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
  })

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

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow)

  const layoutMap = useMemo(() => {
    const map = new Map()

    for (const row of rows) map.set(row.commit.hash, row)

    return map
  }, [rows])

  const { onCommitHover } = useCommitHighlight({ enabled: searchTerm.trim() === '' })

  const navigateCommit = useCallback(
    (direction: 'up' | 'down') => {
      if (expandedRow === undefined || commits.length === 0) return

      let nextIndex: number
      if (direction === 'up') nextIndex = expandedRow > 0 ? expandedRow - 1 : 0
      else nextIndex = expandedRow < commits.length - 1 ? expandedRow + 1 : commits.length - 1

      const nextCommit = commits[nextIndex]
      if (nextIndex === expandedRow || !nextCommit) return

      setExpandedHash(nextCommit.hash)
    },
    [expandedRow, commits],
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

      <div className="flex w-full flex-col py-3">
        {commits.map((commit, row) => {
          const layout = layoutMap.get(commit.hash)
          if (!layout) return null

          return (
            <CommitItem
              key={commit.hash}
              commit={commit}
              isExpanded={expandedHash === commit.hash}
              onToggle={() => setExpandedHash(prev => (prev === commit.hash ? null : commit.hash))}
              selectedBranches={selectedBranches}
              treeWidth={treeWidth}
              onCommitHover={onCommitHover}
              row={row}
              layout={layout}
              uncommitedFiles={commit.isUncommitted ? workingChangesData?.files : undefined}
              dimmed={!matchesSearch(commit, branches, searchTerm)}
            />
          )
        })}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="flex h-8 min-h-8 w-full items-center justify-center gap-2 opacity-80" />
        )}
      </div>
    </Fragment>
  )
}
