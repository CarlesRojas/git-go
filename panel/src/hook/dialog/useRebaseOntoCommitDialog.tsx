import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useRebaseBranchToCommit } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRebaseOntoCommitDialogProps {
  commit: GitCommit
}

export const useRebaseOntoCommitDialog = ({ commit }: UseRebaseOntoCommitDialogProps) => {
  const { showToast } = useToast()
  const [showRebaseDialog, setShowRebaseDialog] = useState(false)
  const rebaseMutation = useRebaseBranchToCommit()
  const { data: currentBranch } = useCurrentBranch()
  const { settings } = useSettings()

  const rebaseForm = useForm({
    defaultValues: {
      ignoreDate: settings.rebaseIgnoreDate,
      autoStash: settings.rebaseAutoStash,
    },
    onSubmit: async ({ value }) => {
      rebaseMutation.mutate(
        {
          commitHash: commit.hash,
          ignoreDate: value.ignoreDate,
          autoStash: value.autoStash,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Current branch rebased onto commit ${commit.hash.substring(0, 7)}`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowRebaseDialog(false)
            rebaseForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    if (!settings.confirmRebase) {
      void rebaseForm.handleSubmit()
      return
    }

    setShowRebaseDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showRebaseDialog} onOpenChange={setShowRebaseDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Rebase branch {currentBranch ? <strong>{currentBranch}</strong> : ''} (current branch) on commit{' '}
            <strong>{commit.hash.substring(0, 7)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            rebaseForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <rebaseForm.Field
            name="ignoreDate"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="ignoreDate"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="ignoreDate" className="cursor-pointer pl-2">
                  Ignore date
                </Label>
              </div>
            )}
          />

          <rebaseForm.Field
            name="autoStash"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="autoStash"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="autoStash" className="cursor-pointer pl-2">
                  Autostash uncommitted changes
                </Label>
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowRebaseDialog(false)}>
              Cancel
            </Button>

            <rebaseForm.Subscribe
              selector={state => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
                      Rebase Branch
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
