import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCherryPickCommit } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeCommit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseCherryPickDialogProps {
  commit: GitCommit
}

export const useCherryPickDialog = ({ commit }: UseCherryPickDialogProps) => {
  const { showToast } = useToast()
  const [showCherryPickDialog, setShowCherryPickDialog] = useState(false)
  const cherryPickMutation = useCherryPickCommit()

  const cherryPickForm = useForm({
    defaultValues: {
      recordOrigin: false,
      noCommit: true,
    },
    onSubmit: async ({ value }) => {
      cherryPickMutation.mutate(
        {
          commitHash: commit.hash,
          recordOrigin: value.recordOrigin,
          noCommit: value.noCommit,
        },
        {
          onSuccess: () => {
            showToast({ text: 'Commit cherry-picked successfully', icon: faCodeCommit, type: 'success' })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeCommit })
          },
          onSettled: () => {
            setShowCherryPickDialog(false)
            cherryPickForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => setShowCherryPickDialog(true)

  const DialogComponent = (
    <Dialog open={showCherryPickDialog} onOpenChange={setShowCherryPickDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Cherry pick commit <strong>{commit.hash.substring(0, 7)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            cherryPickForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <cherryPickForm.Field
            name="recordOrigin"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="recordOrigin"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="recordOrigin" className="cursor-pointer pl-2">
                  Record origin
                </Label>
              </div>
            )}
          />

          <cherryPickForm.Field
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
            <Button variant="secondary" type="button" onClick={() => setShowCherryPickDialog(false)}>
              Cancel
            </Button>

            <cherryPickForm.Subscribe
              selector={state => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCodeCommit} className="size-3" />
                      Cherry pick
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
