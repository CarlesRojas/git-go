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

interface UseBranchMergeIntoCurrentDialogProps {
  branch: GitBranch
}

export const useBranchMergeIntoCurrentDialog = ({ branch }: UseBranchMergeIntoCurrentDialogProps) => {
  const { showToast } = useToast()
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const mergeBranchMutation = useMergeBranch()
  const { data: currentBranch } = useCurrentBranch()

  const mergeForm = useForm({
    defaultValues: {
      createNewCommit: true,
      squash: false,
      noCommit: false,
    },
    onSubmit: async ({ value }) => {
      mergeBranchMutation.mutate(
        {
          branchName: branch.cleanName,
          createNewCommit: value.createNewCommit,
          squash: value.squash,
          noCommit: value.noCommit,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${branch.cleanName}' merged into '${currentBranch}' successfully`,
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
            Merge branch <strong>{branch.cleanName}</strong> into{' '}
            {currentBranch ? <strong>{currentBranch}</strong> : ''} (current branch)
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            mergeForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-3">
            <mergeForm.Field name="createNewCommit">
              {field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createNewCommit"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />

                  <Label htmlFor="createNewCommit" className="text-sm">
                    Fast forward if possible
                  </Label>
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
                  <Label htmlFor="squash" className="text-sm">
                    Squash commits
                  </Label>
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
                  <Label htmlFor="noCommit" className="text-sm">
                    Don't commit automatically
                  </Label>
                </div>
              )}
            </mergeForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowMergeDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" disabled={mergeBranchMutation.isPending}>
              {mergeBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
                  Merge Branch
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
