import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useGitRemotes, usePushTag } from '@/hook/useGitQueries'
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useTagPushDialog = () => {
  const { showToast } = useToast()
  const [showPushDialog, setShowPushDialog] = useState(false)
  const [commit, setCommit] = useState<GitCommit | null>(null)
  const [tagName, setTagName] = useState<string>('')
  const { data: remotes = [] } = useGitRemotes()
  const pushTagMutation = usePushTag()

  const pushForm = useForm({
    defaultValues: {
      selectedRemotes: ['origin'],
    },
    onSubmit: async ({ value }) => {
      pushTagMutation.mutate(
        {
          tagName,
          remotes: value.selectedRemotes,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Tag '${tagName}' pushed to ${value.selectedRemotes.join(', ')} successfully`,
              icon: faUpload,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faUpload })
          },
          onSettled: () => {
            setShowPushDialog(false)
            pushForm.reset()
          },
        },
      )
    },
  })

  const openDialog = (commitData: GitCommit, tag: string) => {
    setCommit(commitData)
    setTagName(tag)
    setShowPushDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Push <strong>{tagName}</strong> tag to remote
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            pushForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-2">
            <Label>Remotes to push to:</Label>

            {remotes.map(remote => (
              <pushForm.Field key={remote.name} name="selectedRemotes">
                {field => (
                  <div className="flex items-center">
                    <Checkbox
                      id={`remote-${remote.name}`}
                      checked={field.state.value.includes(remote.name)}
                      onCheckedChange={checked => {
                        if (checked) {
                          field.handleChange([...field.state.value, remote.name])
                        } else {
                          field.handleChange(field.state.value.filter(r => r !== remote.name))
                        }
                      }}
                    />

                    <Label htmlFor={`remote-${remote.name}`} className="cursor-pointer pl-2">
                      {remote.name}
                    </Label>
                  </div>
                )}
              </pushForm.Field>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowPushDialog(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={pushTagMutation.isPending || pushForm.state.values.selectedRemotes.length === 0}
            >
              {pushTagMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="size-3" />
                  Push Tag
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
