import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCreateBranchFromCommit } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseBranchDialogProps {
  /** Only the hash is needed, so a reflog entry can open the same dialog a commit row does */
  commit: Pick<GitCommit, 'hash'>
  /** Name the input starts with, for the callers that can suggest one */
  defaultName?: string
}

export const useBranchDialog = ({ commit, defaultName = '' }: UseBranchDialogProps) => {
  const { showToast } = useToast()
  const [showBranchDialog, setShowBranchDialog] = useState(false)
  const createBranchMutation = useCreateBranchFromCommit()
  const { settings } = useSettings()

  const branchForm = useForm({
    defaultValues: {
      branchName: defaultName,
      checkout: settings.branchCreateCheckout,
    },
    onSubmit: async ({ value }) => {
      createBranchMutation.mutate(
        {
          commitHash: commit.hash,
          branchName: value.branchName,
          checkout: value.checkout,
        },
        {
          onSuccess: () => {
            const action = value.checkout ? 'created and checked out' : 'created'
            showToast({
              text: `Branch '${value.branchName}' ${action} successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowBranchDialog(false)
            branchForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => setShowBranchDialog(true)

  const DialogComponent = (
    <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Create branch at commit <strong>{commit.hash.substring(0, 7)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            branchForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <branchForm.Field
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
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          <branchForm.Field
            name="checkout"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="checkout"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="checkout" className="cursor-pointer pl-2">
                  Checkout new branch
                </Label>
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowBranchDialog(false)}>
              Cancel
            </Button>

            <branchForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
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
