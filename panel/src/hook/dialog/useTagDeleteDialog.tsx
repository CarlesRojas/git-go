import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/Select'
import { useToast } from '@/context/ToastContext'
import { useDeleteTag, useGitRemotes } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

const LOCAL_ONLY = 'local-only-4dde2026-6e1a-429d-8541-e144511e87b3'

export const useTagDeleteDialog = () => {
  const { showToast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tagName, setTagName] = useState<string>('')
  const { data: remotes = [] } = useGitRemotes()
  const deleteTagMutation = useDeleteTag()

  const deleteForm = useForm({
    defaultValues: {
      deleteOnRemote: LOCAL_ONLY,
    },
    onSubmit: async ({ value }) => {
      deleteTagMutation.mutate(
        {
          tagName,
          deleteOnRemote: value.deleteOnRemote === LOCAL_ONLY ? undefined : value.deleteOnRemote,
        },
        {
          onSuccess: () => {
            const message =
              value.deleteOnRemote !== LOCAL_ONLY
                ? `Tag '${tagName}' deleted locally and from '${value.deleteOnRemote}' remote`
                : `Local tag '${tagName}' deleted successfully`
            showToast({
              text: message,
              icon: faTrash,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faTrash })
          },
          onSettled: () => {
            setShowDeleteDialog(false)
            deleteForm.reset()
          },
        },
      )
    },
  })

  const openDialog = (tag: string) => {
    setTagName(tag)
    deleteForm.reset()
    setShowDeleteDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Delete <strong>{tagName}</strong> tag
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            deleteForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <deleteForm.Field name="deleteOnRemote">
            {field => (
              <div className="flex flex-col gap-1">
                <Select value={field.state.value} onValueChange={value => field.handleChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Only delete local tag" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={LOCAL_ONLY}>Only delete local tag</SelectItem>

                    {remotes.map(remote => (
                      <SelectItem key={remote.name} value={remote.name}>
                        Also delete from {remote.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </deleteForm.Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" variant="destructive" disabled={deleteTagMutation.isPending}>
              {deleteTagMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="size-3" />
                  Delete Tag
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
