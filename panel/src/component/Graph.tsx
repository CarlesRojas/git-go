import { CommitItem } from '@/component/CommitItem'
import { useSettings } from '@/context/SettingsContext'
import { useCommitHighlight } from '@/hook/useCommitHighlight'
import { useGitBranches, useInfiniteGitCommits, useWorkingChanges } from '@/hook/useGitQueries'
import { ExpandedRow, useGitTree } from '@/hook/useGitTree'
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
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<ExpandedRow | undefined>()
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

    if (workingChangesData?.commit) return [workingChangesData.commit, ...gitCommits]

    if (!settings.showStashes) return gitCommits.filter(c => !c.isStash)

    return gitCommits
  }, [data, workingChangesData, settings.showStashes])

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow)

  const toggleCommit = (commitHash: string) => {
    setExpandedCommitHash(expandedCommitHash === commitHash ? null : commitHash)
    if (expandedCommitHash === commitHash) setExpandedRow(undefined)
  }

  const { onCommitHover } = useCommitHighlight({ enabled: searchTerm.trim() === '' })

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

  if (isLoading || isBranchesLoading) {
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
            dimmed={!matchesSearch(commit, branches, searchTerm)}
          />
        ))}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="flex h-8 min-h-8 w-full items-center justify-center gap-2 opacity-80" />
        )}
      </div>
    </Fragment>
  )
}
