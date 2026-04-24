import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faStar, faCircleDot } from '@fortawesome/free-solid-svg-icons'
import { Combobox } from './Combobox'
import { useGitBranches } from '../hooks/useGitQueries'
import { GitBranch } from '../../../src/gitService'

interface BranchSelectorProps {
  onBranchesChange: (branches: GitBranch[]) => void
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const { data: branches = [], isLoading: loading, error } = useGitBranches()
  const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])

  useEffect(() => {
    if (branches.length > 0 && selectedBranches.length === 0) {
      const autoSelected: GitBranch[] = []
      const currentBranch = branches.find(b => b.current && !b.remote)
      const mainBranch = branches.find(b => (b.cleanName === 'main' || b.cleanName === 'master') && !b.remote)

      if (currentBranch) autoSelected.push(currentBranch)
      if (mainBranch && !autoSelected.some(b => b.cleanName === mainBranch.cleanName)) autoSelected.push(mainBranch)

      setSelectedBranches(autoSelected)
      onBranchesChange(autoSelected)
    }
  }, [branches, selectedBranches.length, onBranchesChange])

  const getBranchIcons = (local: GitBranch | null, remote: GitBranch | null, current: boolean) => {
    const icons = []

    if (current) {
      icons.push(<FontAwesomeIcon key="current" icon={faStar} className="h-3 w-3 text-yellow-400" />)
    }

    if (local) {
      icons.push(<FontAwesomeIcon key="local" icon={faCodeBranch} className="h-3 w-3 text-blue-400" />)
    }

    if (remote) {
      icons.push(<FontAwesomeIcon key="remote" icon={faCircleDot} className="h-3 w-3 text-gray-400" />)
    }

    return <div className="flex items-center gap-1">{icons}</div>
  }

  const handleBranchChange = (newBranchNames: string[]) => {
    const newBranches = newBranchNames.map(branchName => branchLookup.get(branchName)).filter(Boolean) as GitBranch[]

    setSelectedBranches(newBranches)
    onBranchesChange(newBranches)
  }

  if (loading)
    return (
      <div className="flex h-9 items-center gap-2 px-3 py-2 text-sm opacity-50">
        <FontAwesomeIcon icon={faCodeBranch} className="h-4 w-4 animate-pulse" />
        <span>Loading branches...</span>
      </div>
    )

  if (error)
    return (
      <div className="flex h-9 items-center gap-2 px-3 py-2 text-sm text-red-400">
        <FontAwesomeIcon icon={faCodeBranch} className="h-4 w-4" />
        <span>Error loading branches</span>
      </div>
    )

  const branchLookup = new Map<string, GitBranch>()

  const groupedBranches = branches.reduce(
    (acc, branch) => {
      const baseName = branch.cleanName

      if (!acc[baseName]) acc[baseName] = { local: null, remote: null, current: false }

      if (branch.remote) {
        acc[baseName].remote = branch
      } else {
        acc[baseName].local = branch
        if (branch.current) {
          acc[baseName].current = true
        }
      }

      if (!branch.remote || !branchLookup.has(baseName)) {
        branchLookup.set(baseName, branch)
      }

      return acc
    },
    {} as Record<string, { local: GitBranch | null; remote: GitBranch | null; current: boolean }>,
  )

  const branchItems = Object.entries(groupedBranches)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([baseName, { local, remote, current }]) => {
      return {
        value: baseName,
        label: baseName,
        icon: getBranchIcons(local, remote, current),
      }
    })

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium opacity-75">Branches:</span>

      <Combobox
        value={selectedBranches.map(b => b.cleanName)}
        onValueChange={handleBranchChange}
        placeholder="Select branches to view..."
        items={branchItems}
        className="min-w-50"
      />
    </div>
  )
}
