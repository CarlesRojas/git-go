import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useResetUncommittedChanges } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useResetUncommittedChangesDialog = () => {
  const { showToast } = useToast()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const resetUncommittedChangesMutation = useResetUncommittedChanges()

  const resetForm = useForm({
    defaultValues: {},
    onSubmit: async () => {
      resetUncommittedChangesMutation.mutate(
        { mode: 'hard' },
        {
          onSuccess: () => {
            showToast({
              text: 'Uncommitted changes discarded successfully',
              icon: faTrash,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faTrash })
          },
          onSettled: () => {
            setShowResetDialog(false)
            resetForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    setShowResetDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Discard all <strong>uncommitted changes</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            resetForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={resetUncommittedChangesMutation.isPending}>
              {resetUncommittedChangesMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="size-3" />
                  Discard All Changes
                </>
              )}
            </Button>
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
