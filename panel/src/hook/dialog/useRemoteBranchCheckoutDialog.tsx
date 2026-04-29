import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCheckoutRemoteBranch } from '@/hook/useGitQueries'
import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRemoteBranchCheckoutDialogProps {
  remoteBranch: GitBranch
}

export const useRemoteBranchCheckoutDialog = ({ remoteBranch }: UseRemoteBranchCheckoutDialogProps) => {
  const { showToast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const checkoutRemoteBranchMutation = useCheckoutRemoteBranch()

  const checkoutForm = useForm({
    defaultValues: {
      localBranchName: remoteBranch.cleanName,
    },
    onSubmit: async ({ value }) => {
      checkoutRemoteBranchMutation.mutate(
        {
          remoteBranchName: remoteBranch.name,
          localBranchName: value.localBranchName,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Checked out remote branch '${remoteBranch.remoteName ? remoteBranch.remoteName : ''}${remoteBranch.remoteName ? '/' : ''}${remoteBranch.cleanName}' as '${value.localBranchName}'`,
              icon: faCheck,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCheck })
          },
          onSettled: () => {
            setShowDialog(false)
            checkoutForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    checkoutForm.setFieldValue('localBranchName', remoteBranch.cleanName)
    setShowDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Checkout remote branch <strong>{remoteBranch.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            checkoutForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <checkoutForm.Field
            name="localBranchName"
            validators={{
              onChange: ({ value }) => (!value ? 'Local branch name is required' : undefined),
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>New Local Branch Name</Label>

                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="new-local-branch"
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>

            <checkoutForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="size-3" />
                      Checkout
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
