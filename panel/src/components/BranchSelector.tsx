import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { GitBranch } from '../../../src/gitService'
import { useGitBranches } from '../hooks/useGitQueries'
import { getBranchIcons } from '../utils/branchIcons'
import { cn } from '../utils/cn'
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

const LIMIT = 8

export const BranchSelector: FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const { data: branches = [], ...branchesQuery } = useGitBranches()

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
    const grouped = Object.values(groupBranches(branches.filter(b => selectedBranches.includes(b.cleanName))))
    if (grouped.length === 0) return 'Select branches...'
    if (grouped.length === 1) return grouped[0]!.local?.cleanName ?? grouped[0]!.remote?.cleanName ?? ''
    return `${grouped.length} branches`
  }, [branches, selectedBranches])

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
      return []
    }
  }, [groupedBranches])

  if (branchesQuery.isLoading) {
    return (
      <div
        className={cn(
          'flex h-7 w-52 gap-2',
          'px-2.5',
          'text-xs whitespace-nowrap text-(--vscode-input-foreground)',
          'bg-(--vscode-input-foreground)/5',
          'border border-(--vscode-editor-foreground)/15',
          'animate-pulse',
        )}
      >
        <div className="flex min-w-0 flex-row items-center gap-2">
          <FontAwesomeIcon icon={faCodeBranch} className="size-2.5 text-(--vscode-editor-foreground)/70" />
          Loading branches...
        </div>
      </div>
    )
  }

  return (
    <Combobox
      multiple
      autoHighlight
      limit={LIMIT}
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
        <ComboboxInput onClear={() => setInputValue('')} placeholder="Search..." />
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

              {group.value === 'Local' && index < branchGroups.length - 1 && <ComboboxSeparator />}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
