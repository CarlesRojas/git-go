import { faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import type { GitBranch } from '../../src/gitService'
import { CommitItem } from './components/CommitItem'
import { useGitCommits } from './hooks/useGitQueries'

interface GraphProps {
  selectedBranches: GitBranch[]
}

export const Graph: React.FC<GraphProps> = ({ selectedBranches }) => {
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)

  const { data: commits = [], isLoading: loading, error } = useGitCommits(selectedBranches)

  const toggleCommit = (commitHash: string) => {
    setExpandedCommitHash(expandedCommitHash === commitHash ? null : commitHash)
  }

  if (loading) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faCircleNotch} className="size-4 animate-spin" />
        <p className="text-xs">Loading git history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex size-full w-full flex-col items-center justify-center gap-2 bg-transparent p-8 opacity-80">
        <FontAwesomeIcon icon={faTimesCircle} className="size-4 text-(--vscode-errorForeground)" />
        <p className="text-xs text-(--vscode-errorForeground)">Error loading git history</p>
      </div>
    )
  }

  return commits.map(commit => (
    <CommitItem
      key={commit.hash}
      commit={commit}
      isExpanded={expandedCommitHash === commit.hash}
      onToggle={() => toggleCommit(commit.hash)}
      selectedBranches={selectedBranches}
    />
  ))
}
