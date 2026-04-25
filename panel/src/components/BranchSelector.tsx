import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, ReactNode, useMemo, useState } from 'react'
import { GitBranch } from '../../../src/gitService'
import { useGitBranches } from '../hooks/useGitQueries'
import { getBranchIcons } from '../utils/branchIcons'
import { groupBranches } from '../utils/groupBranches'
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from './Combobox'

interface BranchSelectorProps {
  onBranchesChange: (branches: GitBranch[]) => void
}

export const BranchSelector: FC<BranchSelectorProps> = ({ onBranchesChange }) => {
  const anchor = useComboboxAnchor()

  const { data: branches = [], isLoading: loading, error } = useGitBranches()
  const [inputValue, setInputValue] = useState('')
  // const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])

  const groupedBranches = groupBranches(branches)

  // useEffect(() => {
  //   if (branches.length > 0 && selectedBranches.length === 0) {
  //     const autoSelected: GitBranch[] = []
  //     const currentBranch = branches.find(b => b.current && !b.remote)
  //     const mainBranch = branches.find(b => (b.cleanName === 'main' || b.cleanName === 'master') && !b.remote)

  //     const addBranchGroup = (branchName: string) => {
  //       const groupedBranch = groupedBranches[branchName]
  //       if (groupedBranch) {
  //         if (groupedBranch.local) autoSelected.push(groupedBranch.local)
  //         if (groupedBranch.remote) autoSelected.push(groupedBranch.remote)
  //       }
  //     }

  //     if (currentBranch) addBranchGroup(currentBranch.cleanName)
  //     if (mainBranch && mainBranch.cleanName !== currentBranch?.cleanName) addBranchGroup(mainBranch.cleanName)

  //     setSelectedBranches(autoSelected)
  //     onBranchesChange(autoSelected)
  //   }
  // }, [branches, selectedBranches.length, onBranchesChange])

  const handleBranchToggle = (branchName: string) => {
    // const selectedNames = Array.from(new Set(selectedBranches.map(b => b.cleanName)))
    // const isSelected = selectedNames.includes(branchName)
    // let newBranchNames: string[]
    // if (isSelected) newBranchNames = selectedNames.filter(name => name !== branchName)
    // else newBranchNames = [...selectedNames, branchName]
    // const newBranches: GitBranch[] = []
    // newBranchNames.forEach(name => {
    //   const groupedBranch = groupedBranches[name]
    //   if (groupedBranch) {
    //     if (groupedBranch.local) newBranches.push(groupedBranch.local)
    //     if (groupedBranch.remote) newBranches.push(groupedBranch.remote)
    //   }
    // })
    // setSelectedBranches(newBranches)
    // onBranchesChange(newBranches)
  }

  // const displayText = useMemo(() => {
  //   const selectedNames = Array.from(new Set(selectedBranches.map(b => b.cleanName)))
  //   if (selectedNames.length === 0) return 'Select branches to view...'
  //   if (selectedNames.length === 1) return selectedNames[0]
  //   return `${selectedNames.length} branches`
  // }, [selectedBranches])

  const branchGroups = useMemo(() => {
    try {
      const localBranches: { value: string; label: string; icon: ReactNode }[] = []
      const remoteBranches: { value: string; label: string; icon: ReactNode }[] = []

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

  //     <ComboboxTrigger>
  //   <ComboboxValue>
  //     <span className="truncate">{/* displayText */} Select...</span>
  //   </ComboboxValue>
  // </ComboboxTrigger>

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium opacity-75">Branches:</span>

      <Combobox
        multiple
        autoHighlight
        items={branchGroups}
        onOpenChange={open => {
          if (!open) setInputValue('')
        }}
      >
        {/* <ComboboxChips ref={anchor} className="w-full max-w-xs">
          <ComboboxValue>
            {values => (
              <Fragment>
                {values.map((value: string) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}

                <ComboboxChipsInput />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips> */}
        <ComboboxTrigger>
          <ComboboxValue>
            <span className="truncate">{/* displayText */} Select...</span>
          </ComboboxValue>
        </ComboboxTrigger>

        <ComboboxContent anchor={anchor}>
          <ComboboxChips ref={anchor} className="w-full max-w-xs">
            <ComboboxChipsInput />
          </ComboboxChips>

          <ComboboxEmpty>No branches found.</ComboboxEmpty>

          <ComboboxList>
            {(group, index) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>

                <ComboboxCollection>
                  {item => (
                    <ComboboxItem key={item.value} value={item.value} onSelect={() => handleBranchToggle(item.value)}>
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
