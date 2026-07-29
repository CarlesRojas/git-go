import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useDeleteBranch, useRemoveWorktree } from '@/hook/useGitQueries'
import { faCircleNotch, faFolderTree, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseBranchDeleteDialogProps {
  branch: GitBranch
}

export const useBranchDeleteDialog = ({ branch }: UseBranchDeleteDialogProps) => {
  const { showToast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteBranchMutation = useDeleteBranch()
  const removeWorktreeMutation = useRemoveWorktree()
  const { settings } = useSettings()

  const isPending = deleteBranchMutation.isPending || removeWorktreeMutation.isPending

  const deleteForm = useForm({
    defaultValues: {
      force: settings.branchDeleteForce,
    },
    onSubmit: async ({ value }) => {
      const callbacks = {
        onSuccess: () => {
          showToast({
            text: `Branch '${branch.cleanName}' deleted successfully`,
            icon: faTrash,
            type: 'success' as const,
          })
        },
        onError: (error: Error) => {
          showToast({ text: error.message, type: 'error', icon: faTrash })
        },
        onSettled: () => {
          setShowDeleteDialog(false)
          deleteForm.reset()
        },
      }

      if (branch.worktreePath) {
        removeWorktreeMutation.mutate(
          { worktreePath: branch.worktreePath, force: value.force, deleteBranch: branch.cleanName },
          callbacks,
        )
        return
      }

      deleteBranchMutation.mutate({ branchName: branch.cleanName, force: value.force }, callbacks)
    },
  })

  const openDialog = () => {
    setShowDeleteDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Delete the branch <strong>{branch.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            deleteForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-3">
            {branch.worktreePath && (
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faFolderTree} className="size-3 opacity-70" />

                <span className="opacity-70">
                  This branch is checked out in worktree {branch.worktreePath}. The worktree will be removed too.
                </span>
              </div>
            )}

            <deleteForm.Field name="force">
              {field => (
                <div className="flex items-center">
                  <Checkbox
                    id="force"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="force" className="cursor-pointer pl-2">
                    Force Delete
                  </Label>
                </div>
              )}
            </deleteForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="size-3" />
                  Delete Branch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
