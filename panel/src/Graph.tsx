import React, { useState, useMemo } from 'react'
import { CommitItem } from './components/CommitItem'
import { useGitCommits, useGitBranches } from './hooks/useGitQueries'

interface GraphProps {
  selectedBranches: string[]
}

export const Graph: React.FC<GraphProps> = ({ selectedBranches }) => {
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null)

  // Get all branches to convert base names to actual branch names
  const { data: branches = [] } = useGitBranches()

  // Convert selected branch names to actual git branch names
  const actualBranchNames = useMemo(() => {
    if (selectedBranches.length === 0) return undefined

    const actualNames: string[] = []
    selectedBranches.forEach(branchName => {
      // Check if this is already a full branch name (remote-only branches)
      const exactMatch = branches.find(branch => branch.name === branchName)
      if (exactMatch) {
        actualNames.push(branchName)
        return
      }

      // Otherwise, find matching branches by base name (local branches or local+remote)
      const matchingBranches = branches.filter(branch => {
        const branchBaseName = branch.remote ? branch.name.replace(/^[^/]+\//, '') : branch.name
        return branchBaseName === branchName
      })

      // Add all matching branch names
      matchingBranches.forEach(branch => {
        actualNames.push(branch.name)
      })
    })

    return actualNames.length > 0 ? actualNames : undefined
  }, [selectedBranches, branches])

  const { data: commits = [], isLoading: loading, error } = useGitCommits(actualBranchNames)

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

  return (
    <main className="flex flex-col overflow-y-auto">
      {commits.map(commit => (
        <CommitItem
          key={commit.hash}
          commit={commit}
          isExpanded={expandedCommitHash === commit.hash}
          onToggle={() => toggleCommit(commit.hash)}
        />
      ))}
    </main>
  )
}
