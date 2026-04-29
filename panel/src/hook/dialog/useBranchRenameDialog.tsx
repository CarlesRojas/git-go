import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useRenameBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseBranchRenameDialogProps {
  branch: GitBranch
}

export const useBranchRenameDialog = ({ branch }: UseBranchRenameDialogProps) => {
  const { showToast } = useToast()
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const renameBranchMutation = useRenameBranch()

  const renameForm = useForm({
    defaultValues: {
      newName: branch.cleanName,
    },
    onSubmit: async ({ value }) => {
      if (value.newName === branch.cleanName) {
        setShowRenameDialog(false)
        return
      }

      renameBranchMutation.mutate(
        {
          oldName: branch.cleanName,
          newName: value.newName,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch renamed from '${branch.cleanName}' to '${value.newName}' successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowRenameDialog(false)
            renameForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    renameForm.setFieldValue('newName', branch.cleanName)
    setShowRenameDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Rename branch <strong>{branch.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            renameForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-4">
            <renameForm.Field name="newName">
              {field => (
                <div>
                  <Label htmlFor="newName">New Name</Label>

                  <Input
                    id="newName"
                    value={field.state.value}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Enter new branch name"
                    className="mt-1"
                    autoFocus
                  />
                </div>
              )}
            </renameForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRenameDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" disabled={renameBranchMutation.isPending}>
              {renameBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                'Rename Branch'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
