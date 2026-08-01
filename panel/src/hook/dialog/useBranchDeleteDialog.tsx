import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useDeleteBranch, useDeleteRemoteBranch, useRemoveWorktree } from '@/hook/useGitQueries'
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
  const deleteRemoteBranchMutation = useDeleteRemoteBranch()
  const removeWorktreeMutation = useRemoveWorktree()
  const { settings } = useSettings()

  const isPending =
    deleteBranchMutation.isPending || deleteRemoteBranchMutation.isPending || removeWorktreeMutation.isPending

  const upstream =
    branch.upstreamRemote && branch.upstreamBranch
      ? { remote: branch.upstreamRemote, branchName: branch.upstreamBranch }
      : null

  const deleteForm = useForm({
    defaultValues: {
      force: settings.branchDeleteForce,
      deleteOnRemote: settings.branchDeleteOnRemote,
    },
    onSubmit: async ({ value }) => {
      try {
        if (branch.worktreePath) {
          await removeWorktreeMutation.mutateAsync({
            worktreePath: branch.worktreePath,
            force: value.force,
            deleteBranch: branch.cleanName,
          })
        } else {
          await deleteBranchMutation.mutateAsync({ branchName: branch.cleanName, force: value.force })
        }

        if (value.deleteOnRemote && upstream) {
          await deleteRemoteBranchMutation.mutateAsync(upstream)
        }

        showToast({
          text:
            value.deleteOnRemote && upstream
              ? `Branch '${branch.cleanName}' deleted locally and on '${upstream.remote}'`
              : `Branch '${branch.cleanName}' deleted successfully`,
          icon: faTrash,
          type: 'success',
        })
      } catch (error) {
        showToast({ text: (error as Error).message, type: 'error', icon: faTrash })
      } finally {
        setShowDeleteDialog(false)
        deleteForm.reset()
      }
    },
  })

  const openDialog = () => {
    if (!settings.confirmBranchDelete) {
      void deleteForm.handleSubmit()
      return
    }

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

            {!!upstream && (
              <deleteForm.Field name="deleteOnRemote">
                {field => (
                  <div className="flex items-center">
                    <Checkbox
                      id="deleteOnRemote"
                      checked={field.state.value}
                      onCheckedChange={checked => field.handleChange(checked === true)}
                    />

                    <Label htmlFor="deleteOnRemote" className="cursor-pointer pl-2">
                      Also delete '{upstream.branchName}' on '{upstream.remote}'
                    </Label>
                  </div>
                )}
              </deleteForm.Field>
            )}
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
