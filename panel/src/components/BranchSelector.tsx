import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { GitBranch } from '../../../src/gitService'
import { useGitBranches } from '../hooks/useGitQueries'
import { getBranchIcons } from '../utils/branchIcons'
import { groupBranches } from '../utils/groupBranches'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from './Combobox'

interface BranchSelectorProps {
  onBranchesChange: (branches: GitBranch[]) => void
}

interface BrancItem {
  value: string
  label: string
  icon: ReactNode
}

export const BranchSelector: FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const { data: branches = [], isLoading: loading, error } = useGitBranches()
  const [inputValue, setInputValue] = useState('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const groupedBranches = groupBranches(branches)

  const setDefaultBranches = useCallback(() => {
    const isMain = (name: string) => name === 'main' || name === 'master'

    const currentBranch = branches.filter(b => b.current && !isMain(b.cleanName))
    const mainBranch = branches.filter(b => isMain(b.cleanName))

    setSelectedBranches([...currentBranch.map(b => b.cleanName), ...mainBranch.map(b => b.cleanName)])
    onBranchesChange([...currentBranch, ...mainBranch])
  }, [branches, onBranchesChange])

  useEffect(() => {
    if (branches.length > 0 && selectedBranches.length === 0) setDefaultBranches()
  }, [{ branches, selectedBranches, setDefaultBranches }])

  const handleValueChange = (selected: string[]) => {
    setSelectedBranches(selected)
    onBranchesChange(branches.filter(branch => selected.includes(branch.cleanName)))
  }

  const displayText = useMemo(() => {
    if (selectedBranches.length === 0) return 'Select branches...'
    if (selectedBranches.length === 1) return selectedBranches[0]
    return `${selectedBranches.length} branches`
  }, [selectedBranches])

  const branchGroups = useMemo(() => {
    try {
      const localBranches: BrancItem[] = []
      const remoteBranches: BrancItem[] = []

      Object.entries(groupedBranches).forEach(([baseName, { local, remote }]) => {
        const item = {
          value: baseName,
          label: baseName,
          icon: getBranchIcons(local, remote, local?.current ?? remote?.current ?? false),
        }

        if (local) localBranches.push(item)
        else if (remote) remoteBranches.push(item)
      })

      const groups = []
      if (localBranches.length > 0) {
        groups.push({ value: 'Local', items: localBranches.sort((a, b) => a.label.localeCompare(b.label)) })
      }

      if (remoteBranches.length > 0) {
        groups.push({ value: 'Remote', items: remoteBranches.sort((a, b) => a.label.localeCompare(b.label)) })
      }

      return groups
    } catch (error) {
      console.log(error)
      return []
    }
  }, [groupedBranches])

  if (loading) {
    return (
      <div className="flex h-9 items-center gap-2 px-3 py-2 text-sm opacity-50">
        <FontAwesomeIcon icon={faCodeBranch} className="h-4 w-4 animate-pulse" />
        <span>Loading branches...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-9 items-center gap-2 px-3 py-2 text-sm text-red-400">
        <FontAwesomeIcon icon={faCodeBranch} className="h-4 w-4" />
        <span>Error loading branches</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium opacity-75">Branches:</span>

      <Combobox
        multiple
        items={branchGroups}
        inputValue={inputValue}
        onInputValueChange={(value, { reason }) => {
          if (reason !== 'input-clear') setInputValue(value)
        }}
        onOpenChange={open => {
          if (!open) setInputValue('')
        }}
        onValueChange={handleValueChange}
        value={selectedBranches}
      >
        <ComboboxTrigger>
          <ComboboxValue>
            <span className="truncate">{displayText}</span>
          </ComboboxValue>
        </ComboboxTrigger>

        <ComboboxContent>
          <ComboboxInput onClear={() => setInputValue('')} />
          <ComboboxSeparator className="my-0" />

          <ComboboxEmpty>No branches found.</ComboboxEmpty>

          <ComboboxList>
            {(group, index) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>

                <ComboboxCollection>
                  {item => (
                    <ComboboxItem key={item.value} value={item.value}>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                    </ComboboxItem>
                  )}
                </ComboboxCollection>

                {index < branchGroups.length - 1 && <ComboboxSeparator />}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
