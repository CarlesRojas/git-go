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

  // Held separately from the prop so a drop can name the branch it acted on: the prop is fed by
  // state set in the same tick, which has not landed yet when the dialog is skipped.
  const [deleteBranch, setDeleteBranch] = useState<GitBranch | null>(null)
  const subject = deleteBranch ?? branch

  const upstreamOf = (target: GitBranch) =>
    target.upstreamRemote && target.upstreamBranch
      ? { remote: target.upstreamRemote, branchName: target.upstreamBranch }
      : null

  const upstream = upstreamOf(subject)

  const remove = async (target: GitBranch, value: { force: boolean; deleteOnRemote: boolean }) => {
    const targetUpstream = upstreamOf(target)

    try {
      if (target.worktreePath) {
        await removeWorktreeMutation.mutateAsync({
          worktreePath: target.worktreePath,
          force: value.force,
          deleteBranch: target.cleanName,
        })
      } else {
        await deleteBranchMutation.mutateAsync({ branchName: target.cleanName, force: value.force })
      }

      if (value.deleteOnRemote && targetUpstream) {
        await deleteRemoteBranchMutation.mutateAsync(targetUpstream)
      }

      showToast({
        text:
          value.deleteOnRemote && targetUpstream
            ? `Branch '${target.cleanName}' deleted locally and on '${targetUpstream.remote}'`
            : `Branch '${target.cleanName}' deleted successfully`,
        icon: faTrash,
        type: 'success',
      })
    } catch (error) {
      showToast({ text: (error as Error).message, type: 'error', icon: faTrash })
    } finally {
      setShowDeleteDialog(false)
      deleteForm.reset()
    }
  }

  const deleteForm = useForm({
    defaultValues: {
      force: settings.branchDeleteForce,
      deleteOnRemote: settings.branchDeleteOnRemote,
    },
    onSubmit: async ({ value }) => remove(subject, value),
  })

  const openDialog = (target?: GitBranch) => {
    if (!settings.confirmBranchDelete) {
      void remove(target ?? branch, {
        force: settings.branchDeleteForce,
        deleteOnRemote: settings.branchDeleteOnRemote,
      })
      return
    }

    setDeleteBranch(target ?? null)
    setShowDeleteDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Delete the branch <strong>{subject.cleanName}</strong>
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
            {subject.worktreePath && (
              <div className="flex items-center gap-2 text-xs">
                <FontAwesomeIcon icon={faFolderTree} className="size-3 opacity-70" />

                <span className="opacity-70">
                  This branch is checked out in worktree {subject.worktreePath}. The worktree will be removed too.
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
