import { useGitBranches } from '@/hooks/useGitQueries'
import { getBranchIcons } from '@/utils/branchIcons'
import { cn } from '@/utils/cn'
import { groupBranches, GroupedBranch } from '@/utils/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './Button'
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

const LIMIT = 100
const SELECTED_LIMIT = 16

export const BranchSelector: FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const { data: branches = [], ...branchesQuery } = useGitBranches()

  const [inputValue, setInputValue] = useState('')
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [selectedCount, setSelectedCount] = useState(0)

  const groupedBranches = useMemo(() => groupBranches(branches), [branches])

  const setDefaultBranches = useCallback(() => {
    const isMain = (name: string) => name === 'main' || name === 'master'

    const priorityBranches = branches.filter(b => b.current || isMain(b.cleanName))
    const remainingSlots = SELECTED_LIMIT - Object.keys(groupBranches(priorityBranches)).length

    const localBranches = branches.filter(b => !b.remote && !b.current && !isMain(b.cleanName))
    const additionalBranches: Record<string, GroupedBranch> = Object.fromEntries(
      Object.entries(groupBranches(localBranches)).slice(0, Math.max(0, remainingSlots)),
    )

    const branchesToSelect = [
      ...priorityBranches,
      ...Object.values(additionalBranches).flatMap(
        group => [group.local, ...group.remotes].filter(Boolean) as GitBranch[],
      ),
    ]

    const names = branchesToSelect.map(b => b.cleanName)
    setSelectedBranches(names)
    setSelectedCount(Object.keys(groupedBranches).filter(name => names.includes(name)).length)
    onBranchesChange(branchesToSelect)

    // const names = branches.map(b => b.cleanName)
    // setSelectedBranches(names)
    // setSelectedCount(Object.keys(groupedBranches).filter(name => names.includes(name)).length)
    // onBranchesChange([...branches])
  }, [branches, groupedBranches, onBranchesChange])

  const defaultBranchesSet = useRef(false)
  useEffect(() => {
    if (branches.length > 0 && selectedBranches.length === 0 && !defaultBranchesSet.current) {
      defaultBranchesSet.current = true
      setDefaultBranches()
    }
  }, [branches, selectedBranches, setDefaultBranches])

  const handleValueChange = (selected: string[]) => {
    setSelectedBranches(selected)
    setSelectedCount(Object.keys(groupedBranches).filter(name => selected.includes(name)).length)
    onBranchesChange(branches.filter(branch => selected.includes(branch.cleanName)))
  }

  const displayText = useMemo(() => {
    const grouped = Object.values(groupBranches(branches.filter(b => selectedBranches.includes(b.cleanName))))
    if (grouped.length === 0) return 'Select branches...'
    if (grouped.length < 4) return grouped.map(g => g.local?.cleanName ?? g.remotes[0]?.cleanName ?? '').join(', ')

    return `${grouped.length} branches`
  }, [branches, selectedBranches])

  const branchGroups = useMemo(() => {
    try {
      const selectedBranchesGroup: BrancItem[] = []
      const localBranchesGroup: BrancItem[] = []
      const remoteBranchesGroup: BrancItem[] = []

      Object.entries(groupedBranches).forEach(([baseName, { local, remotes }]) => {
        const item = {
          value: baseName,
          label: baseName,
          icon: getBranchIcons({ isLocal: !!local, hasRemote: remotes.length > 0, isCurrent: local?.current }),
        }

        if (selectedBranches.includes(baseName)) selectedBranchesGroup.push(item)
        else if (local) localBranchesGroup.push(item)
        else if (remotes.length) remoteBranchesGroup.push(item)
      })

      const groups = []

      if (selectedBranchesGroup.length > 0)
        groups.push({ value: 'Selected', items: selectedBranchesGroup.sort((a, b) => a.label.localeCompare(b.label)) })

      if (localBranchesGroup.length > 0)
        groups.push({ value: 'Local', items: localBranchesGroup.sort((a, b) => a.label.localeCompare(b.label)) })

      if (remoteBranchesGroup.length > 0)
        groups.push({ value: 'Remote', items: remoteBranchesGroup.sort((a, b) => a.label.localeCompare(b.label)) })

      return groups
    } catch (error) {
      return []
    }
  }, [groupedBranches, selectedBranches])

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
      items={selectedCount >= SELECTED_LIMIT ? branchGroups.filter(({ value }) => value === 'Selected') : branchGroups}
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
        <div className="flex w-full">
          <ComboboxInput className="grow" onClear={() => setInputValue('')} placeholder="Search..." />

          <Button variant="secondary" onClick={() => handleValueChange([])} className="border-y-0 border-r-0">
            Reset
          </Button>
        </div>

        <ComboboxSeparator />

        {selectedCount < SELECTED_LIMIT && <ComboboxEmpty>No branches found.</ComboboxEmpty>}

        <ComboboxList>
          {group => (
            <ComboboxGroup key={group.value} items={group.items} className="group/branches">
              {group.value !== 'Selected' && <ComboboxLabel>{group.value}</ComboboxLabel>}

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

              <ComboboxSeparator className="group-last/branches:hidden" />
            </ComboboxGroup>
          )}
        </ComboboxList>

        {selectedCount >= SELECTED_LIMIT && (
          <div
            className={cn([
              // Layout
              'w-full px-2.5 py-2',
              // Typography
              'text-xs text-(--vscode-editor-foreground)/50',
            ])}
          >
            Branch selection limit reached
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
