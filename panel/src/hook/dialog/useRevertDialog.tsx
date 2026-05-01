import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useRevertCommit } from '@/hook/useGitQueries'
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
  const { settings } = useSettings()

  const revertForm = useForm({
    defaultValues: {
      noCommit: settings.revertNoCommit,
    },
    onSubmit: async ({ value }) => {
      revertMutation.mutate(
        {
          commitHash: commit.hash,
          noCommit: value.noCommit,
        },
        {
          onSuccess: () => {
            const action = value.noCommit ? 'staged revert changes for' : 'reverted'
            showToast({
              text: `Successfully ${action} commit ${commit.hash.substring(0, 7)}`,
              icon: faRotateLeft,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faRotateLeft })
          },
          onSettled: () => {
            setShowRevertDialog(false)
            revertForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => setShowRevertDialog(true)

  const DialogComponent = (
    <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Revert commit <strong>{commit.hash.substring(0, 7)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            revertForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <revertForm.Field
            name="noCommit"
            children={field => (
              <div className="flex flex-col gap-2">
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
                    <>
                      <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
                      Revert Commit
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
