import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useRemoveWorktree } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitWorktree } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useWorktreeRemoveDialog = () => {
  const { showToast } = useToast()
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [worktree, setWorktree] = useState<GitWorktree | null>(null)
  const removeWorktreeMutation = useRemoveWorktree()

  const removeForm = useForm({
    defaultValues: {
      force: false,
      deleteBranch: false,
    },
    onSubmit: async ({ value }) => {
      if (!worktree) return

      removeWorktreeMutation.mutate(
        {
          worktreePath: worktree.path,
          force: value.force,
          deleteBranch: value.deleteBranch && worktree.cleanBranch ? worktree.cleanBranch : undefined,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Worktree '${worktree.name}' removed successfully`,
              icon: faTrash,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faTrash })
          },
          onSettled: () => {
            setShowRemoveDialog(false)
            removeForm.reset()
          },
        },
      )
    },
  })

  const openDialog = (targetWorktree: GitWorktree) => {
    setWorktree(targetWorktree)
    removeForm.reset()
    setShowRemoveDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Remove the worktree <strong>{worktree?.name}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            removeForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <p className="truncate text-xs opacity-70" title={worktree?.path}>
            {worktree?.path}
          </p>

          <removeForm.Field name="force">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="forceRemoveWorktree"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="forceRemoveWorktree" className="cursor-pointer pl-2">
                  Force Remove (discards uncommitted changes)
                </Label>
              </div>
            )}
          </removeForm.Field>

          {worktree?.cleanBranch && (
            <removeForm.Field name="deleteBranch">
              {field => (
                <div className="flex items-center">
                  <Checkbox
                    id="deleteWorktreeBranch"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />

                  <Label htmlFor="deleteWorktreeBranch" className="cursor-pointer pl-2">
                    Also delete branch '{worktree.cleanBranch}'
                  </Label>
                </div>
              )}
            </removeForm.Field>
          )}

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={removeWorktreeMutation.isPending}>
              {removeWorktreeMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="size-3" />
                  Remove Worktree
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
