import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/component/ui/Combobox'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { useWorktreeRemoveDialog } from '@/hook/dialog/useWorktreeRemoveDialog'
import { useWorktrees } from '@/hook/useGitQueries'
import { getBranchIcons } from '@/util/branchIcons'
import { faFolderTree, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitWorktree } from '@git/gitService'
import { FC, MouseEvent, PointerEvent, useMemo } from 'react'

const getWorktreeLabel = (worktree: GitWorktree) =>
  worktree.cleanBranch ?? (worktree.detached ? `${worktree.head.substring(0, 7)} (detached)` : worktree.name)

export const WorktreeMenu: FC = () => {
  const { data: worktrees = [] } = useWorktrees()
  const openDialog = useWorktreeOpenDialog()
  const removeDialog = useWorktreeRemoveDialog()

  const currentWorktree = worktrees.find(worktree => worktree.isCurrent)

  const items = useMemo(() => worktrees.map(worktree => ({ value: worktree.path, worktree })), [worktrees])

  if (worktrees.length <= 1) return null

  const handleValueChange = (value: string | null) => {
    if (!value || value === currentWorktree?.path) return

    const worktree = worktrees.find(candidate => candidate.path === value)
    if (!worktree) return

    openDialog.openDialog({ worktreePath: worktree.path, branchName: worktree.cleanBranch ?? undefined })
  }

  return (
    <>
      <Combobox items={items} value={currentWorktree?.path ?? ''} onValueChange={handleValueChange}>
        <ComboboxTrigger icon={faFolderTree} className="w-fit max-w-56">
          <ComboboxValue>
            <span className="truncate">{currentWorktree ? getWorktreeLabel(currentWorktree) : 'Worktrees'}</span>
          </ComboboxValue>
        </ComboboxTrigger>

        <ComboboxContent>
          <ComboboxList>
            {(item: { value: string; worktree: GitWorktree }) => (
              <ComboboxItem key={item.value} value={item.value} className="group/worktree">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {getBranchIcons({ inWorktree: true })}

                  <span className="truncate">{getWorktreeLabel(item.worktree)}</span>

                  {item.worktree.prunable && (
                    <span className="rounded-main border-vsc-editor-fg/20 bg-vsc-editor-fg/10 border px-1 text-[0.65rem] opacity-70">
                      missing
                    </span>
                  )}
                </div>

                {!item.worktree.isCurrent && !item.worktree.isMain && (
                  <button
                    className="text-vsc-error-fg absolute right-2 hidden size-3 cursor-pointer items-center justify-center opacity-70 group-data-highlighted/worktree:flex hover:opacity-100"
                    title="Remove worktree"
                    onPointerDown={(e: PointerEvent) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onMouseDown={(e: MouseEvent) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation()
                      e.preventDefault()
                      removeDialog.openDialog(item.worktree)
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="size-3" />
                  </button>
                )}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {openDialog.DialogComponent}
      {removeDialog.DialogComponent}
    </>
  )
}
