import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { GitBranch } from '../../../src/gitService'
import { useGitBranches } from '../hooks/useGitQueries'
import { getBranchIcons } from '../utils/branchIcons'
import { groupBranches } from '../utils/groupBranches'
import { Combobox } from './Combobox'

interface BranchSelectorProps {
  onBranchesChange: (branches: GitBranch[]) => void
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const { data: branches = [], isLoading: loading, error } = useGitBranches()
  const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])

  const groupedBranches = groupBranches(branches)

  useEffect(() => {
    if (branches.length > 0 && selectedBranches.length === 0) {
      const autoSelected: GitBranch[] = []
      const currentBranch = branches.find(b => b.current && !b.remote)
      const mainBranch = branches.find(b => (b.cleanName === 'main' || b.cleanName === 'master') && !b.remote)

      const addBranchGroup = (branchName: string) => {
        const groupedBranch = groupedBranches[branchName]
        if (groupedBranch) {
          if (groupedBranch.local) autoSelected.push(groupedBranch.local)
          if (groupedBranch.remote) autoSelected.push(groupedBranch.remote)
        }
      }

      if (currentBranch) addBranchGroup(currentBranch.cleanName)
      if (mainBranch && mainBranch.cleanName !== currentBranch?.cleanName) addBranchGroup(mainBranch.cleanName)

      setSelectedBranches(autoSelected)
      onBranchesChange(autoSelected)
    }
  }, [branches, selectedBranches.length, onBranchesChange])

  const handleBranchChange = (newBranchNames: string[]) => {
    const newBranches: GitBranch[] = []

    newBranchNames.forEach(branchName => {
      const groupedBranch = groupedBranches[branchName]
      if (groupedBranch) {
        if (groupedBranch.local) newBranches.push(groupedBranch.local)
        if (groupedBranch.remote) newBranches.push(groupedBranch.remote)
      }
    })

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

  const branchItems = Object.entries(groupedBranches)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([baseName, { local, remote }]) => {
      return {
        value: baseName,
        label: baseName,
        icon: getBranchIcons(local, remote, local?.current ?? remote?.current ?? false),
      }
    })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium opacity-75">Branches:</span>

      <Combobox
        value={Array.from(new Set(selectedBranches.map(b => b.cleanName)))}
        onValueChange={handleBranchChange}
        placeholder="Select branches to view..."
        items={branchItems}
        className="min-w-50"
      />
    </div>
  )
}
