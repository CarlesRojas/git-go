import { faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment, useMemo, useState } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'
import type { GitBranch } from '../../src/gitService'
import { CommitItem } from './components/CommitItem'
import { useCommitHighlight } from './hooks/useCommitHighlight'
import { useInfiniteGitCommits } from './hooks/useGitQueries'
import { useGitTree } from './hooks/useGitTree'

interface GraphProps {
  selectedBranches: GitBranch[]
}

export const Graph: React.FC<GraphProps> = ({ selectedBranches }) => {
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)
  const [panelHeight, setPanelHeight] = useState<number>(0)

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteGitCommits(selectedBranches)

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    onChange: isIntersecting => {
      if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
  })

  const commits = data?.pages.flatMap(page => page.commits) ?? []
  const expandedRow = useMemo(() => {
    if (!expandedCommitHash || panelHeight === 0) return undefined
    const idx = commits.findIndex(c => c.hash === expandedCommitHash)
    if (idx === -1) return undefined
    return { row: idx, extraHeight: panelHeight }
  }, [expandedCommitHash, commits, panelHeight])

  const { treeComponent, treeWidth, rows } = useGitTree(commits, expandedRow)

  const toggleCommit = (commitHash: string) => {
    setExpandedCommitHash(expandedCommitHash === commitHash ? null : commitHash)
  }

  const { onCommitHover } = useCommitHighlight()

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
            setPanelHeight={setPanelHeight}
          />
        ))}

        {hasNextPage && !isFetchingNextPage && (
          <div ref={loadMoreRef} className="flex h-8 min-h-8 w-full items-center justify-center gap-2 opacity-80" />
        )}
      </div>
    </Fragment>
  )
}
