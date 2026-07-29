import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { openWorktree } from '@/hook/useGitQueries'
import { faFolderTree, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

interface WorktreeOpenTarget {
  worktreePath: string
  branchName?: string
}

export const useWorktreeOpenDialog = () => {
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [target, setTarget] = useState<WorktreeOpenTarget | null>(null)

  const openDialog = (newTarget: WorktreeOpenTarget) => {
    setTarget(newTarget)
    setShowOpenDialog(true)
  }

  const handleOpen = (newWindow: boolean) => {
    if (!target) return
    openWorktree(target.worktreePath, newWindow)
    setShowOpenDialog(false)
  }

  const DialogComponent = (
    <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            {target?.branchName ? (
              <>
                <strong>{target.branchName}</strong> is checked out in another worktree
              </>
            ) : (
              'Open worktree'
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs">
            <FontAwesomeIcon icon={faFolderTree} className="size-3 opacity-70" />

            <span className="truncate opacity-70" title={target?.worktreePath}>
              {target?.worktreePath}
            </span>
          </div>

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowOpenDialog(false)}>
              Cancel
            </Button>

            <Button variant="secondary" type="button" onClick={() => handleOpen(false)}>
              Open in This Window
            </Button>

            <Button type="button" onClick={() => handleOpen(true)}>
              <FontAwesomeIcon icon={faWindowRestore} className="size-3" />
              Open in New Window
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
