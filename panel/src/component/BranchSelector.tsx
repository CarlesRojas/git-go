import { Button } from '@/component/ui/Button'
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
} from '@/component/ui/Combobox'
import { useSettings } from '@/context/SettingsContext'
import { useGitBranches, useRepoState } from '@/hook/useGitQueries'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { groupBranches } from '@/util/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const { data: allBranches = [], ...branchesQuery } = useGitBranches()
  const { setRepoState } = useRepoState()
  const { settings } = useSettings()

  const branches = useMemo(() => {
    return allBranches.filter(branch => {
      if (branch.remote && !settings.showRemotes) return false
      if (branch.remote && branch.remoteName && settings.hiddenRemotes.includes(branch.remoteName)) return false

      return true
    })
  }, [allBranches, settings.hiddenRemotes, settings.showRemotes])

  const [inputValue, setInputValue] = useState('')

  const defaultBranchesSet = useRef(false)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])

  const selectLocalBranches = useCallback(() => {
    const isMain = (name: string) => name === 'main' || name === 'master'

    const priorityBranches = branches.filter(b => b.current || isMain(b.cleanName))
    const remainingSlots = SELECTED_LIMIT - Object.keys(groupBranches(priorityBranches)).length
    const localBranches = branches
      .filter(b => !b.remote && !b.current && !isMain(b.cleanName))
      .slice(0, Math.max(0, remainingSlots))

    const targetNames = new Set([...priorityBranches, ...localBranches].map(b => b.cleanName))
    const branchesToSelect = branches.filter(b => targetNames.has(b.cleanName))

    setSelectedBranches(Array.from(new Set(branchesToSelect.map(b => b.cleanName))))
  }, [branches])

  useEffect(() => {
    if (!defaultBranchesSet.current) return
    setRepoState({ selectedBranches })
    onBranchesChange(branches.filter(b => selectedBranches.includes(b.cleanName)))
  }, [selectedBranches, setRepoState, branches, onBranchesChange])

  useEffect(() => {
    if (branches.length <= 0 || selectedBranches.length !== 0 || !!defaultBranchesSet.current) return

    defaultBranchesSet.current = true

    if (settings.selectedBranches.length > 0) {
      const targetNames = new Set(settings.selectedBranches)
      const branchesToSelect = branches.filter(b => targetNames.has(b.cleanName))

      if (branchesToSelect.length > 0) {
        setSelectedBranches(Array.from(new Set(branchesToSelect.map(b => b.cleanName))))
        return
      }
    }

    selectLocalBranches()
  }, [branches, selectedBranches, settings.selectedBranches, selectLocalBranches])

  const previousBranchesNamesRef = useRef<string[] | null>(null)
  useEffect(() => {
    if (branchesQuery.isLoading) return

    const previous = previousBranchesNamesRef.current
    if (previous === null) {
      previousBranchesNamesRef.current = allBranches.map(b => b.name)
      return
    }
    previousBranchesNamesRef.current = allBranches.map(b => b.name)

    const newBranches = branches.filter(branch => !previous.includes(branch.name) && !branch.remote)

    const validCleanNames = new Set(branches.map(b => b.cleanName))
    const selectedWithoutDeletedBranches = selectedBranches.filter(name => validCleanNames.has(name))
    const newSelection = [...new Set([...selectedWithoutDeletedBranches, ...newBranches.map(b => b.cleanName)])]

    setSelectedBranches(newSelection)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches, branchesQuery.isLoading])

  const handleValueChange = (selected: string[]) => {
    setSelectedBranches(selected)
  }

  const displayText = useMemo(() => {
    const grouped = Object.values(groupBranches(branches.filter(b => selectedBranches.includes(b.cleanName))))
    if (grouped.length === 0) return branchesQuery.isError ? 'No branches found' : 'Select branches...'
    if (grouped.length < 4) return grouped.map(g => g.local?.cleanName ?? g.remotes[0]?.cleanName ?? '').join(', ')

    return `${grouped.length} branches`
  }, [branches, selectedBranches, branchesQuery.isError])

  const branchGroups = useMemo(() => {
    try {
      const selectedBranchesGroup: BrancItem[] = []
      const localBranchesGroup: BrancItem[] = []
      const remoteBranchesGroup: BrancItem[] = []

      const groupedBranches = groupBranches(branches)
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
  }, [selectedBranches, branches])

  if (branchesQuery.isLoading) {
    return (
      <div
        className={cn(
          'flex h-7 w-56 gap-2',
          'px-2.5',
          'text-vsc-input-fg text-xs whitespace-nowrap',
          'bg-vsc-input-fg/5',
          'border-vsc-editor-fg/15 border',
          'animate-pulse',
        )}
      >
        <div className="flex min-w-0 flex-row items-center gap-2">
          <FontAwesomeIcon icon={faCodeBranch} className="text-vsc-editor-fg/70 size-2.5" />
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
      items={
        selectedBranches.length >= SELECTED_LIMIT
          ? branchGroups.filter(({ value }) => value === 'Selected')
          : branchGroups
      }
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
        <div className="gap-main p-main border-vsc-editor-fg/15 flex flex-col border-b">
          <ComboboxInput className="w-full" onClear={() => setInputValue('')} placeholder="Search..." />

          <div className="gap-main grid w-full grid-cols-2">
            <Button variant="secondary" onClick={selectLocalBranches} className="w-full">
              Select Local
            </Button>

            <Button variant="secondary" onClick={() => handleValueChange([])} className="text-vsc-error-fg w-full">
              Unselect All
            </Button>
          </div>
        </div>

        {selectedBranches.length < SELECTED_LIMIT && <ComboboxEmpty>No branches found.</ComboboxEmpty>}

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

        {selectedBranches.length >= SELECTED_LIMIT && (
          <div
            className={cn([
              // Layout
              'w-full px-2.5 py-2',
              // Typography
              'text-vsc-editor-fg/50 border-vsc-editor-fg/15 border-t text-xs',
            ])}
          >
            Branch selection limit reached
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
