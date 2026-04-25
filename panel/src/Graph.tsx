import { faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useState } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'
import type { GitBranch } from '../../src/gitService'
import { CommitItem } from './components/CommitItem'
import { useInfiniteGitCommits } from './hooks/useGitQueries'

interface GraphProps {
  selectedBranches: GitBranch[]
}

export const Graph: React.FC<GraphProps> = ({ selectedBranches }) => {
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteGitCommits(
    selectedBranches,
    50,
  )

  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    onChange: isIntersecting => {
      console.log('Is Intersecting', isIntersecting)
      if (isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
  })

  // Flatten the pages into a single array of commits
  const commits = data?.pages.flatMap(page => page.commits) ?? []

  const toggleCommit = (commitHash: string) => {
    setExpandedCommitHash(expandedCommitHash === commitHash ? null : commitHash)
  }

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
    <>
      {commits.map(commit => (
        <CommitItem
          key={commit.hash}
          commit={commit}
          isExpanded={expandedCommitHash === commit.hash}
          onToggle={() => toggleCommit(commit.hash)}
          selectedBranches={selectedBranches}
        />
      ))}

      {hasNextPage && !isFetchingNextPage && (
        <div ref={loadMoreRef} className="flex h-8 min-h-8 w-full items-center justify-center gap-2 opacity-80" />
      )}
    </>
  )
}
