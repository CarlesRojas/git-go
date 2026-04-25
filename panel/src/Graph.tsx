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
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current"></div>
        <p>Loading git history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-red-400">
        <p>Error loading git history:</p>
        <p className="font-mono text-sm">{error.message}</p>
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
