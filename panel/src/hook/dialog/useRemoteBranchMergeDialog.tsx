import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useMergeBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeMerge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useRemoteBranchMergeDialog = () => {
  const { showToast } = useToast()
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [remoteBranch, setRemoteBranch] = useState<GitBranch | null>(null)
  const mergeBranchMutation = useMergeBranch()
  const { data: currentBranch } = useCurrentBranch()
  const { settings } = useSettings()

  const mergeForm = useForm({
    defaultValues: {
      fastFordwardIfPossible: settings.mergeFastForwardIfPossible,
      squash: settings.mergeSquash,
      noCommit: settings.mergeNoCommit,
    },
    onSubmit: async ({ value }) => {
      if (!remoteBranch) return
      mergeBranchMutation.mutate(
        {
          branchName: remoteBranch.cleanName,
          fastFordwardIfPossible: value.fastFordwardIfPossible,
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

  const openDialog = (branch: GitBranch) => {
    setRemoteBranch(branch)
    setShowMergeDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Merge remote branch <strong>{remoteBranch?.cleanName}</strong> into <strong>{currentBranch}</strong>{' '}
            (current branch)
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
          <mergeForm.Field name="fastFordwardIfPossible">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="fastFordwardIfPossible"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="fastFordwardIfPossible" className="cursor-pointer pl-2">
                  Fast forward if possible
                </Label>
              </div>
            )}
          </mergeForm.Field>

          <mergeForm.Field name="squash">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="squash"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="squash" className="cursor-pointer pl-2">
                  Squash commits
                </Label>
              </div>
            )}
          </mergeForm.Field>

          <mergeForm.Field name="noCommit">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="noCommit"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="noCommit" className="cursor-pointer pl-2">
                  Don't commit automatically
                </Label>
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
