import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useUndoLastAction, useWorkingChanges } from '@/hook/useGitQueries'
import { faCircleNotch, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitUndoActionKind, GitUndoableAction } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useCallback, useState } from 'react'

export const undoActionLabel: Record<GitUndoActionKind, string> = {
  commit: 'Commit',
  amend: 'Amend',
  merge: 'Merge',
  rebase: 'Rebase',
  'cherry-pick': 'Cherry-pick',
  revert: 'Revert',
  reset: 'Reset',
  pull: 'Pull',
  other: 'Last Action',
}

interface UseUndoDialogProps {
  action: GitUndoableAction
}

export const useUndoDialog = ({ action }: UseUndoDialogProps) => {
  const { showToast } = useToast()
  const [showUndoDialog, setShowUndoDialog] = useState(false)
  const undoMutation = useUndoLastAction()
  const { data: workingChanges } = useWorkingChanges()

  const label = undoActionLabel[action.kind]

  const undoForm = useForm({
    defaultValues: {
      discardChanges: action.changedWorkingTree,
    },
    onSubmit: async ({ value }) => {
      undoMutation.mutate(
        {
          previousHash: action.previousHash,
          discardChanges: value.discardChanges,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Undid ${label.toLowerCase()} on '${action.branch}'`,
              icon: faRotateLeft,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faRotateLeft })
          },
          onSettled: () => {
            setShowUndoDialog(false)
            undoForm.reset()
          },
        },
      )
    },
  })

  const openDialog = useCallback(() => setShowUndoDialog(true), [])

  const DialogComponent = (
    <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Undo <strong>{label.toLowerCase()}</strong> on <strong>{action.branch}</strong>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 opacity-60">
          <span className="break-all">
            {action.description}
            {!!action.when && ` — ${action.when}`}
          </span>

          <span>
            <strong>{action.branch}</strong> moves back from {action.currentHash.substring(0, 7)} to{' '}
            {action.previousHash.substring(0, 7)}
          </span>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            undoForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <undoForm.Field
            name="discardChanges"
            children={field => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <Checkbox
                    id="discardChanges"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />

                  <Label htmlFor="discardChanges" className="cursor-pointer pl-2">
                    Restore the working tree
                  </Label>
                </div>

                {field.state.value && !!workingChanges && (
                  <span className="text-vsc-error-fg text-xs">Uncommitted changes will be permanently discarded</span>
                )}

                {!field.state.value && (
                  <span className="text-xs opacity-60">The undone changes are kept in the working tree and index</span>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowUndoDialog(false)}>
              Cancel
            </Button>

            <undoForm.Subscribe
              selector={state => [state.isSubmitting, state.values.discardChanges]}
              children={([isSubmitting, discardChanges]) => (
                <Button variant={discardChanges ? 'destructive' : 'default'} type="submit" disabled={!!isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
                      Undo {label}
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
