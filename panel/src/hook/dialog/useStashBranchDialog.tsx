import { formatStash } from '@/component/StashTagPill'
import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useBranchFromStash, useOperationInProgress, useWorkingChanges } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseStashBranchDialogProps {
  stash: string
  /** The stash's own commit, whose first parent is the commit the branch will start at */
  commit?: GitCommit
}

export const useStashBranchDialog = ({ stash, commit }: UseStashBranchDialogProps) => {
  const { showToast } = useToast()
  const [showStashBranchDialog, setShowStashBranchDialog] = useState(false)
  const branchFromStashMutation = useBranchFromStash()
  const { data: operationInProgress } = useOperationInProgress()
  const { data: workingChanges } = useWorkingChanges()

  const baseHash = commit?.parents[0]

  // The branch is checked out at the stash's base and the stash applied onto it, neither of
  // which can happen over uncommitted changes or a halted operation
  const blockedReason = operationInProgress
    ? `A ${operationInProgress} is in progress — finish or abort it first`
    : workingChanges
      ? 'The working tree has uncommitted changes — commit or stash them first'
      : null

  const stashBranchForm = useForm({
    defaultValues: {
      branchName: '',
    },
    onSubmit: async ({ value }) => {
      branchFromStashMutation.mutate(
        {
          stashSelector: stash,
          branchName: value.branchName,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${value.branchName}' created from '${formatStash(stash)}' successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowStashBranchDialog(false)
            stashBranchForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => setShowStashBranchDialog(true)

  const DialogComponent = (
    <Dialog open={showStashBranchDialog} onOpenChange={setShowStashBranchDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Create branch from <strong>{formatStash(stash)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            stashBranchForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <stashBranchForm.Field
            name="branchName"
            validators={{
              onChange: ({ value }) => (!value ? 'Branch name is required' : undefined),
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>Branch Name</Label>

                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="new-feature"
                  autoFocus
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          <p className="text-xs opacity-70">
            The branch starts at{' '}
            {baseHash ? (
              <>
                commit <code className="font-semibold">{baseHash.substring(0, 7)}</code>, where the stash was created,
              </>
            ) : (
              'the commit the stash was created from'
            )}{' '}
            and is checked out. The stash is applied onto it and removed from the stash list.
          </p>

          {blockedReason && (
            <p className="text-vsc-error-fg flex items-start gap-1.5 text-xs">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 size-3 shrink-0" />
              {blockedReason}
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowStashBranchDialog(false)}>
              Cancel
            </Button>

            <stashBranchForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || branchFromStashMutation.isPending || !!blockedReason}
                >
                  {branchFromStashMutation.isPending ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
                      Create Branch
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

  return { openDialog, DialogComponent }
}
