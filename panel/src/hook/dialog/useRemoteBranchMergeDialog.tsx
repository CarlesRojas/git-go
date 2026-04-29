import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useMergeBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeMerge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRemoteBranchMergeDialogProps {
  remoteBranch: GitBranch
}

export const useRemoteBranchMergeDialog = ({ remoteBranch }: UseRemoteBranchMergeDialogProps) => {
  const { showToast } = useToast()
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const mergeBranchMutation = useMergeBranch()
  const { data: currentBranch } = useCurrentBranch()

  const mergeForm = useForm({
    defaultValues: {
      createNewCommit: false,
      squash: false,
      noCommit: false,
    },
    onSubmit: async ({ value }) => {
      mergeBranchMutation.mutate(
        {
          branchName: remoteBranch.cleanName,
          createNewCommit: value.createNewCommit,
          squash: value.squash,
          noCommit: value.noCommit,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Remote branch '${remoteBranch.cleanName}' merged into '${currentBranch}' successfully`,
              icon: faCodeMerge,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeMerge })
          },
          onSettled: () => {
            setShowMergeDialog(false)
            mergeForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    setShowMergeDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Merge remote branch <strong>{remoteBranch.cleanName}</strong> into <strong>{currentBranch}</strong> (current
            branch)
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            mergeForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <mergeForm.Field name="createNewCommit">
            {field => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createNewCommit"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="createNewCommit">Create new commit (no fast-forward)</Label>
              </div>
            )}
          </mergeForm.Field>

          <mergeForm.Field name="squash">
            {field => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="squash"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="squash">Squash commits</Label>
              </div>
            )}
          </mergeForm.Field>

          <mergeForm.Field name="noCommit">
            {field => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noCommit"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="noCommit">Don't commit automatically</Label>
              </div>
            )}
          </mergeForm.Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={mergeBranchMutation.isPending}>
              {mergeBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
                  Merge
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return {
    openDialog,
    DialogComponent,
  }
}
