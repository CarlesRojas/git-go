import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useRebaseBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRebaseCurrentBranchIntoBranchProps {
  branch: GitBranch
}

export const useRebaseCurrentBranchIntoBranch = ({ branch }: UseRebaseCurrentBranchIntoBranchProps) => {
  const { showToast } = useToast()
  const [showRebaseDialog, setShowRebaseDialog] = useState(false)
  const rebaseBranchMutation = useRebaseBranch()
  const { data: currentBranch } = useCurrentBranch()
  const { settings } = useSettings()

  // Held separately from the prop so a drop can name the branch it acted on: the prop is fed by
  // state set in the same tick, which has not landed yet when the dialog is skipped.
  const [rebaseOnto, setRebaseOnto] = useState<GitBranch | null>(null)
  const subject = rebaseOnto ?? branch

  const rebase = (target: GitBranch, values: { ignoreDate: boolean; autoStash: boolean }) => {
    rebaseBranchMutation.mutate(
      {
        branchName: target.cleanName,
        ignoreDate: values.ignoreDate,
        autoStash: values.autoStash,
      },
      {
        onSuccess: () => {
          showToast({
            text: `Current branch rebased onto '${target.cleanName}' successfully`,
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
  }

  const rebaseForm = useForm({
    defaultValues: {
      ignoreDate: settings.rebaseIgnoreDate,
      autoStash: settings.rebaseAutoStash,
    },
    onSubmit: async ({ value }) => rebase(subject, value),
  })

  const openDialog = (target?: GitBranch) => {
    if (!settings.confirmRebase) {
      rebase(target ?? branch, { ignoreDate: settings.rebaseIgnoreDate, autoStash: settings.rebaseAutoStash })
      return
    }

    setRebaseOnto(target ?? null)
    setShowRebaseDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showRebaseDialog} onOpenChange={setShowRebaseDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Rebase branch {currentBranch ? <strong>{currentBranch}</strong> : ''} (current branch) on branch{' '}
            <strong>{subject.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            rebaseForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-3">
            <rebaseForm.Field name="ignoreDate">
              {field => (
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
            </rebaseForm.Field>

            <rebaseForm.Field name="autoStash">
              {field => (
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
            </rebaseForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRebaseDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" disabled={rebaseBranchMutation.isPending}>
              {rebaseBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
                  Rebase Branch
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
