import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/contexts/ToastContext'
import { useRevertCommit } from '@/hooks/useGitQueries'
import { faCircleNotch, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRevertDialogProps {
  commit: GitCommit
}

export const useRevertDialog = ({ commit }: UseRevertDialogProps) => {
  const { showToast } = useToast()
  const [showRevertDialog, setShowRevertDialog] = useState(false)
  const revertMutation = useRevertCommit()

  const revertForm = useForm({
    defaultValues: {
      commitChanges: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        revertMutation.mutate(
          {
            commitHash: commit.hash,
            commitChanges: value.commitChanges,
          },
          {
            onSuccess: () => {
              const action = value.commitChanges ? 'reverted' : 'staged revert changes for'
              showToast({
                text: `Successfully ${action} commit ${commit.hash.substring(0, 7)}`,
                icon: faRotateLeft,
                type: 'success',
              })
              setShowRevertDialog(false)
              revertForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to revert: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  const openDialog = () => setShowRevertDialog(true)

  const DialogComponent = (
    <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revert Commit {commit.hash.substring(0, 7)}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            revertForm.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <revertForm.Field
            name="commitChanges"
            children={field => (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="commitChanges"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />

                  <Label htmlFor="commitChanges" className="cursor-pointer">
                    Commit changes
                  </Label>
                </div>
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowRevertDialog(false)}>
              Cancel
            </Button>

            <revertForm.Subscribe
              selector={state => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button variant="destructive" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    'Revert Commit'
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
