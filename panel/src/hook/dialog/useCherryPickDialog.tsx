import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCherryPickCommit } from '@/hook/useGitQueries'
import { faCircleNotch, faClone } from '@fortawesome/free-solid-svg-icons'
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
      commitChanges: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        cherryPickMutation.mutate(
          {
            commitHash: commit.hash,
            recordOrigin: value.recordOrigin,
            commitChanges: value.commitChanges,
          },
          {
            onSuccess: () => {
              showToast({ text: 'Commit cherry-picked successfully', icon: faClone, type: 'success' })
              setShowCherryPickDialog(false)
              cherryPickForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: error.message, type: 'error', icon: faClone })
              reject(error)
            },
          },
        )
      })
    },
  })

  const openDialog = () => setShowCherryPickDialog(true)

  const DialogComponent = (
    <Dialog open={showCherryPickDialog} onOpenChange={setShowCherryPickDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cherry Pick Commit {commit.hash.substring(0, 7)}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            cherryPickForm.handleSubmit()
          }}
          className="flex flex-col gap-4"
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
            name="commitChanges"
            children={field => (
              <div className="flex items-center">
                <Checkbox
                  id="commitChanges"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="commitChanges" className="cursor-pointer pl-2">
                  Commit changes
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
                    'Cherry pick'
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
