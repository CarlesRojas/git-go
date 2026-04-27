import { Label } from '@/components/ui/label'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { GitCommit } from '../../../../src/gitService'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/Dialog'
import { Input } from '../../components/Input'
import { useToast } from '../../contexts/ToastContext'
import { useCreateBranchFromCommit } from '../useGitQueries'

interface UseBranchDialogProps {
  commit: GitCommit
}

export const useBranchDialog = ({ commit }: UseBranchDialogProps) => {
  const { showToast } = useToast()
  const [showBranchDialog, setShowBranchDialog] = useState(false)
  const createBranchMutation = useCreateBranchFromCommit()

  const branchForm = useForm({
    defaultValues: {
      branchName: '',
      checkout: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
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
              setShowBranchDialog(false)
              branchForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to create branch: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  const openDialog = () => setShowBranchDialog(true)

  const DialogComponent = (
    <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Branch at Commit {commit.hash.substring(0, 7)}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            branchForm.handleSubmit()
          }}
          className="flex flex-col gap-4"
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
                  placeholder="feature/new-feature"
                />

                {field.state.meta.errors && (
                  <p className="text-xs text-(--vscode-errorForeground)">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />

          <branchForm.Field
            name="checkout"
            children={field => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="checkout"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="checkout" className="cursor-pointer">
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
                    'Create Branch'
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
