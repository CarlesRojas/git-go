import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCreateStash } from '@/hook/useGitQueries'
import { faCircleNotch, faInbox } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useStashDialog = () => {
  const { showToast } = useToast()
  const [showStashDialog, setShowStashDialog] = useState(false)
  const createStashMutation = useCreateStash()
  const { settings } = useSettings()

  const stashForm = useForm({
    defaultValues: {
      message: '',
      includeUntracked: settings.stashIncludeUntracked,
    },
    onSubmit: async ({ value }) => {
      createStashMutation.mutate(
        {
          message: value.message,
          includeUntracked: value.includeUntracked,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Stash created successfully`,
              icon: faInbox,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faInbox })
          },
          onSettled: () => {
            setShowStashDialog(false)
            stashForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    setShowStashDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showStashDialog} onOpenChange={setShowStashDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Create Stash from <strong>uncommited changes</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            stashForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <stashForm.Field name="message">
            {field => (
              <div className="flex flex-col gap-1">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Optional message for the stash"
                  value={field.state.value}
                  onChange={e => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </stashForm.Field>

          <stashForm.Field name="includeUntracked">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="includeUntracked"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="includeUntracked" className="cursor-pointer pl-2">
                  Include untracked files
                </Label>
              </div>
            )}
          </stashForm.Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowStashDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={createStashMutation.isPending}>
              {createStashMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faInbox} className="size-3" />
                  Create Stash
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
