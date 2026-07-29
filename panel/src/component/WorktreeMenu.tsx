import { Button } from '@/component/ui/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetLabel,
  SheetSeparator,
  SheetTitle,
  SheetTrigger,
} from '@/component/ui/Sheet'
import { useWorktreeCreateDialog } from '@/hook/dialog/useWorktreeCreateDialog'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { useWorktreeRemoveDialog } from '@/hook/dialog/useWorktreeRemoveDialog'
import { useWorktrees } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faAdd, faArrowUpRightFromSquare, faFolderTree, faLock, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitWorktree } from '@git/gitService'
import { FC } from 'react'

const WorktreeBadge: FC<{ label: string; highlight?: boolean }> = ({ label, highlight }) => (
  <div
    className={cn(
      'rounded-main border-vsc-editor-fg/20 bg-vsc-editor-fg/10 h-fit border px-1.5 py-0.5 text-[0.65rem]',
      highlight && 'bg-vsc-list-highlight-fg/10 text-vsc-list-highlight-fg border-vsc-list-highlight-fg/30',
    )}
  >
    {label}
  </div>
)

export const WorktreeMenu: FC = () => {
  const { data: worktrees = [] } = useWorktrees()

  const createDialog = useWorktreeCreateDialog()
  const openDialog = useWorktreeOpenDialog()
  const removeDialog = useWorktreeRemoveDialog()

  if (worktrees.length <= 1) return null

  const getWorktreeLabel = (worktree: GitWorktree) =>
    worktree.cleanBranch ?? (worktree.detached ? `${worktree.head.substring(0, 7)} (detached)` : worktree.name)

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon">
            <FontAwesomeIcon icon={faFolderTree} className="size-3" />
            <span className="sr-only">Worktrees</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-vsc-list-highlight-fg flex items-center gap-2 font-bold">
              <FontAwesomeIcon icon={faFolderTree} className="size-3" />
              Worktrees
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 p-3">
            <SheetLabel>Repository Worktrees</SheetLabel>

            {worktrees.map(worktree => (
              <div key={worktree.path} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 grow flex-col">
                  <div className="flex items-center gap-2">
                    <span className={cn('truncate font-semibold', worktree.prunable && 'line-through opacity-50')}>
                      {getWorktreeLabel(worktree)}
                    </span>

                    {worktree.isCurrent && <WorktreeBadge label="Current" highlight />}

                    {worktree.isMain && <WorktreeBadge label="Main" />}

                    {worktree.prunable && <WorktreeBadge label="Missing" />}

                    {worktree.locked && <FontAwesomeIcon icon={faLock} className="size-2.5 opacity-50" />}
                  </div>

                  <span className="truncate text-[0.7rem] opacity-50" title={worktree.path}>
                    {worktree.path}
                  </span>
                </div>

                {!worktree.isCurrent && (
                  <Button
                    variant="secondary"
                    size="icon"
                    title="Open worktree"
                    onClick={() =>
                      openDialog.openDialog({
                        worktreePath: worktree.path,
                        branchName: worktree.cleanBranch ?? undefined,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="size-3" />
                  </Button>
                )}

                {!worktree.isCurrent && !worktree.isMain && (
                  <Button
                    variant="destructive"
                    size="icon"
                    title="Remove worktree"
                    onClick={() => removeDialog.openDialog(worktree)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="size-3" />
                  </Button>
                )}
              </div>
            ))}

            <SheetSeparator />

            <Button variant="secondary" className="w-fit" onClick={() => createDialog.openDialog()}>
              <FontAwesomeIcon icon={faAdd} className="size-3" />
              Add Worktree
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {createDialog.DialogComponent}
      {openDialog.DialogComponent}
      {removeDialog.DialogComponent}
    </>
  )
}
