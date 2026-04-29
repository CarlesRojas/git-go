import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useDeleteBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
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

  const deleteForm = useForm({
    defaultValues: {
      force: false,
    },
    onSubmit: async ({ value }) => {
      deleteBranchMutation.mutate(
        {
          branchName: branch.cleanName,
          force: value.force,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${branch.cleanName}' deleted successfully`,
              icon: faTrash,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faTrash })
          },
          onSettled: () => {
            setShowDeleteDialog(false)
            deleteForm.reset()
          },
        },
      )
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
            <deleteForm.Field name="force">
              {field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="force"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="force" className="text-sm">
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

            <Button type="submit" variant="destructive" disabled={deleteBranchMutation.isPending}>
              {deleteBranchMutation.isPending ? (
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
