import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useDeleteRemoteBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useState } from 'react'

interface UseRemoteBranchDeleteDialogProps {
  branch: GitBranch
}

export const useRemoteBranchDeleteDialog = ({ branch }: UseRemoteBranchDeleteDialogProps) => {
  const { showToast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteRemoteBranchMutation = useDeleteRemoteBranch()

  const handleDelete = () => {
    if (!branch.remoteName) {
      showToast({ text: 'Invalid remote branch', type: 'error', icon: faTrash })
      return
    }

    deleteRemoteBranchMutation.mutate(
      {
        branchName: branch.cleanName,
        remote: branch.remoteName,
      },
      {
        onSuccess: () => {
          showToast({
            text: `Remote branch '${branch.cleanName}' deleted successfully`,
            icon: faTrash,
            type: 'success',
          })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faTrash })
        },
        onSettled: () => {
          setShowDeleteDialog(false)
        },
      },
    )
  }

  const openDialog = () => {
    setShowDeleteDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Delete the remote branch <strong>{branch.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRemoteBranchMutation.isPending}
          >
            {deleteRemoteBranchMutation.isPending ? (
              <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="size-3" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return {
    openDialog,
    DialogComponent,
  }
}
