import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useMergeCommitIntoCurrentBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeMerge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseMergeCommitIntoCurrentBranchDialogProps {
  commit: GitCommit
}

export const useMergeCommitIntoCurrentBranchDialog = ({ commit }: UseMergeCommitIntoCurrentBranchDialogProps) => {
  const { showToast } = useToast()
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const mergeMutation = useMergeCommitIntoCurrentBranch()
  const { data: currentBranch } = useCurrentBranch()
  const { settings } = useSettings()

  const mergeForm = useForm({
    defaultValues: {
      fastForwardIfPossible: settings.mergeFastForwardIfPossible,
      squash: settings.mergeSquash,
      noCommit: settings.mergeNoCommit,
    },
    onSubmit: async ({ value }) => {
      mergeMutation.mutate(
        {
          commitHash: commit.hash,
          fastForwardIfPossible: value.fastForwardIfPossible,
          squash: value.squash,
          noCommit: value.noCommit,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Commit ${commit.hash.substring(0, 7)} merged into '${currentBranch}' successfully`,
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
    if (!settings.confirmMerge) {
      void mergeForm.handleSubmit()
      return
    }

    setShowMergeDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Merge commit <strong>{commit.hash.substring(0, 7)}</strong> into{' '}
            {currentBranch ? <strong>{currentBranch}</strong> : ''} (current branch)
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
          <mergeForm.Field
            name="fastForwardIfPossible"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="fastForwardIfPossible"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="fastForwardIfPossible" className="cursor-pointer pl-2">
                  Fast forward if possible
                </Label>
              </div>
            )}
          />

          <mergeForm.Field
            name="squash"
            children={field => (
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
          />

          <mergeForm.Field
            name="noCommit"
            children={field => (
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
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>

            <mergeForm.Subscribe
              selector={state => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
                      Merge Commit
                    </>
                  )}
                </Button>
              )}
            />
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
