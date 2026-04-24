import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCodeBranch, faStar, faCircleDot } from '@fortawesome/free-solid-svg-icons'
import { Combobox } from './Combobox'
import { useGitBranches } from '../hooks/useGitQueries'

interface BranchSelectorProps {
  onBranchesChange: (branches: string[]) => void
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])

  const { data: branches = [], isLoading: loading, error } = useGitBranches()

  useEffect(() => {
    if (branches.length > 0 && selectedBranches.length === 0) {
      const autoSelected: string[] = []
      const currentBranch = branches.find(b => b.current && !b.remote)
      const mainBranch = branches.find(b => (b.name === 'main' || b.name === 'master') && !b.remote)

      if (currentBranch) {
        autoSelected.push(currentBranch.name)
      }

      if (mainBranch && !autoSelected.includes(mainBranch.name)) {
        autoSelected.push(mainBranch.name)
      }

      setSelectedBranches(autoSelected)
      onBranchesChange(autoSelected)
    }
  }, [branches, selectedBranches.length, onBranchesChange])

  const handleBranchChange = (newBranches: string[]) => {
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

  // Group branches by their base name (removing remote prefix)
  const groupedBranches = branches.reduce(
    (acc, branch) => {
      const baseName = branch.remote ? branch.name.replace(/^[^/]+\//, '') : branch.name

      if (!acc[baseName]) {
        acc[baseName] = { local: null, remote: null, current: false }
      }

      if (branch.remote) {
        acc[baseName].remote = branch
      } else {
        acc[baseName].local = branch
        if (branch.current) {
          acc[baseName].current = true
        }
      }

      return acc
    },
    {} as Record<string, { local: any; remote: any; current: boolean }>,
  )

  const branchItems = Object.entries(groupedBranches).map(([baseName, { local, remote, current }]) => {
    const icons = []

    // Determine display name - if remote only, show full remote name
    const displayName = local ? baseName : remote.name

    // Add current branch star if applicable
    if (current) {
      icons.push(<FontAwesomeIcon key="current" icon={faStar} className="h-3 w-3 text-yellow-400" />)
    }

    // Add local branch icon
    if (local) {
      icons.push(<FontAwesomeIcon key="local" icon={faCodeBranch} className="h-3 w-3 text-blue-400" />)
    }

    // Add remote branch icon
    if (remote) {
      icons.push(<FontAwesomeIcon key="remote" icon={faCircleDot} className="h-3 w-3 text-gray-400" />)
    }

    return {
      value: displayName,
      label: displayName,
      icon: <div className="flex items-center gap-1">{icons}</div>,
    }
  })

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium opacity-75">Branches:</span>
      <Combobox
        value={selectedBranches}
        onValueChange={handleBranchChange}
        placeholder="Select branches to view..."
        items={branchItems}
        className="min-w-50"
      />
    </div>
  )
}
