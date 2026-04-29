import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCheckoutRemoteBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseCheckoutDialogProps {
  remoteBranch?: GitBranch
  hasLocalBranch?: boolean
}

export const useCheckoutDialog = ({ remoteBranch, hasLocalBranch = false }: UseCheckoutDialogProps) => {
  const { showToast } = useToast()
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const checkoutRemoteMutation = useCheckoutRemoteBranch()

  const checkoutForm = useForm({
    defaultValues: {
      localBranchName: '',
    },
    onSubmit: async ({ value }) => {
      checkoutRemoteMutation.mutate(
        {
          remoteBranchName: remoteBranch ? `${remoteBranch.remoteName}/${remoteBranch.cleanName}` : '',
          localBranchName: value.localBranchName,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${value.localBranchName}' created and checked out successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowCheckoutDialog(false)
            checkoutForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    if (!remoteBranch) return

    if (!hasLocalBranch) {
      checkoutRemoteMutation.mutate(
        {
          remoteBranchName: `${remoteBranch.remoteName}/${remoteBranch.cleanName}`,
          localBranchName: remoteBranch.cleanName,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${remoteBranch.cleanName}' created and checked out successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
        },
      )
    } else {
      checkoutForm.setFieldValue('localBranchName', `${remoteBranch.cleanName}-2`)
      setShowCheckoutDialog(true)
    }
  }

  const DialogComponent = (
    <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Local branch <strong>{remoteBranch?.cleanName}</strong> already exists
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
              onChange: ({ value }) => (!value?.trim() ? 'Local branch name is required' : undefined),
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>Choose a different name for the new Local Branch</Label>

                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="feature-branch"
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowCheckoutDialog(false)}>
              Cancel
            </Button>

            <checkoutForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" /> : 'Checkout'}
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
