import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/component/ui/RadioGroup'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useResetBranchToCommit } from '@/hook/useGitQueries'
import { faCircleNotch, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit, GitResetMode } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseResetBranchDialogProps {
  commit: GitCommit
}

const RESET_MODES: GitResetMode[] = ['soft', 'mixed', 'hard']

export const useResetBranchDialog = ({ commit }: UseResetBranchDialogProps) => {
  const { showToast } = useToast()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const resetMutation = useResetBranchToCommit()
  const { settings } = useSettings()

  const resetForm = useForm({
    defaultValues: {
      mode: settings.resetMode,
    },
    onSubmit: async ({ value }) => {
      resetMutation.mutate(
        {
          commitHash: commit.hash,
          mode: value.mode,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Current branch reset to ${commit.hash.substring(0, 7)} (${value.mode})`,
              icon: faRotateRight,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faRotateRight })
          },
          onSettled: () => {
            setShowResetDialog(false)
            resetForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => setShowResetDialog(true)

  const DialogComponent = (
    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Reset current branch to commit <strong>{commit.hash.substring(0, 7)}</strong>
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
          <resetForm.Field
            name="mode"
            children={field => (
              <RadioGroup
                value={field.state.value}
                onValueChange={value => field.handleChange(value as GitResetMode)}
                className="flex flex-col gap-2"
              >
                {RESET_MODES.map(mode => (
                  <div key={mode} className="flex items-center">
                    <RadioGroupItem value={mode} id={`reset-mode-${mode}`} />

                    <Label htmlFor={`reset-mode-${mode}`} className="cursor-pointer pl-2 capitalize">
                      {mode}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>

            <resetForm.Subscribe
              selector={state => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button variant="destructive" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faRotateRight} className="size-3" />
                      Reset Branch
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
