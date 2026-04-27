import type { GitBranch } from '@/../src/gitService'
import { faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, Fragment, useCallback, useMemo, useState } from 'react'
import { useEventListener, useIntersectionObserver } from 'usehooks-ts'
import { CommitItem } from './components/CommitItem'
import { useCommitHighlight } from './hooks/useCommitHighlight'
import { useInfiniteGitCommits, useWorkingChanges } from './hooks/useGitQueries'
import { ExpandedRow, useGitTree } from './hooks/useGitTree'

interface GraphProps {
  selectedBranches: GitBranch[]
}

export const Graph: FC<GraphProps> = ({ selectedBranches }) => {
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<ExpandedRow | undefined>()

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteGitCommits(selectedBranches)

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    onChange: isIntersecting => {
      if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
  })

  const { data: workingChangesData } = useWorkingChanges(true)

  const commits = useMemo(() => {
    const gitCommits = data?.pages.flatMap(page => page.commits) ?? []

    if (workingChangesData?.commit) return [workingChangesData.commit, ...gitCommits]

    return gitCommits
  }, [data, workingChangesData])

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow)

  const toggleCommit = (commitHash: string) => {
    setExpandedCommitHash(expandedCommitHash === commitHash ? null : commitHash)
    if (expandedCommitHash === commitHash) setExpandedRow(undefined)
  }

  const { onCommitHover } = useCommitHighlight()

  const navigateCommit = useCallback(
    (direction: 'up' | 'down') => {
      if (!expandedRow || commits.length === 0) return

      let nextIndex: number
      if (direction === 'up') nextIndex = expandedRow.row > 0 ? expandedRow.row - 1 : 0
      else nextIndex = expandedRow.row < commits.length - 1 ? expandedRow.row + 1 : commits.length - 1

      const nextCommit = commits[nextIndex]
      if (nextIndex === expandedRow.row || !nextCommit) return

      setExpandedCommitHash(nextCommit.hash)
      setExpandedRow({ row: nextIndex, extraHeight: expandedRow.extraHeight })
    },
    [expandedRow, commits],
  )

  useEventListener(
    'keydown',
    useCallback(
      (event: KeyboardEvent) => {
        if (!expandedRow) return
        event.preventDefault()

        if (event.key === 'ArrowUp') navigateCommit('up')
        else if (event.key === 'ArrowDown') navigateCommit('down')
      },
      [expandedRow, navigateCommit],
    ),
  )

  if (isLoading) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin" />
        <p className="text-xs">Loading git history...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faTimesCircle} className="size-4 text-(--vscode-errorForeground)" />
        <p className="text-xs text-(--vscode-errorForeground)">Error loading git history</p>
      </div>
    )
  }

  return (
    <Fragment>
      {commits.length > 0 && treeComponent}

      <div className="flex w-full flex-col py-3">
        {commits.map((commit, row) => (
          <CommitItem
            key={commit.hash}
            commit={commit}
            isExpanded={expandedCommitHash === commit.hash}
            onToggle={() => toggleCommit(commit.hash)}
            selectedBranches={selectedBranches}
            treeWidth={treeWidth}
            onCommitHover={onCommitHover}
            row={row}
            layout={rows.find(c => c.commit.hash === commit.hash)!}
            setExpandedRow={setExpandedRow}
            uncommitedFiles={commit.isUncommitted ? workingChangesData?.files : undefined}
          />
        ))}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="flex h-8 min-h-8 w-full items-center justify-center gap-2 opacity-80" />
        )}
      </div>
    </Fragment>
  )
}
