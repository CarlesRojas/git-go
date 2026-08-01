import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useDeleteTag, useGitRemotes, useTagRemotes } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

export const useTagDeleteDialog = () => {
  const { showToast } = useToast()
  const { settings } = useSettings()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [tagName, setTagName] = useState<string>('')
  const [deleteLocal, setDeleteLocal] = useState(true)
  const { data: remotes = [] } = useGitRemotes()
  const { data: tagRemotes } = useTagRemotes(showDeleteDialog)
  const deleteTagMutation = useDeleteTag()

  // true/false when the remote was successfully queried, undefined when its status is unknown
  const isTagOnRemote = (remoteName: string): boolean | undefined => {
    const status = tagRemotes?.find(({ remote }) => remote === remoteName)
    return status ? status.tags.some(({ name }) => name === tagName) : undefined
  }

  // Hide remotes known not to have the tag; keep unknown-status remotes (unreachable or still loading)
  const candidateRemotes = remotes.filter(remote => isTagOnRemote(remote.name) !== false)

  const deleteForm = useForm({
    defaultValues: {
      deleteOnRemotes: [] as string[],
    },
    onSubmit: async ({ value }) => {
      deleteTagMutation.mutate(
        {
          tagName,
          deleteOnRemotes: value.deleteOnRemotes,
          deleteLocal,
        },
        {
          onSuccess: () => {
            const deletedFrom = [
              ...(deleteLocal ? ['locally'] : []),
              ...value.deleteOnRemotes.map(remote => `from '${remote}' remote`),
            ]
            showToast({
              text: `Tag '${tagName}' deleted ${deletedFrom.join(' and ')}`,
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

  useEffect(() => {
    if (!showDeleteDialog || !settings.tagDeleteOnRemotes || !tagRemotes) return

    const remotesWithTag = tagRemotes
      .filter(({ tags }) => tags.some(({ name }) => name === tagName))
      .map(({ remote }) => remote)

    deleteForm.setFieldValue('deleteOnRemotes', remotesWithTag)
  }, [deleteForm, showDeleteDialog, settings.tagDeleteOnRemotes, tagName, tagRemotes])

  const openDialog = (tag: string, options?: { deleteLocal?: boolean }) => {
    setTagName(tag)
    setDeleteLocal(options?.deleteLocal ?? true)
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
          {deleteLocal && <p className="text-xs opacity-75">The local tag will be deleted.</p>}

          {candidateRemotes.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>{deleteLocal ? 'Also delete from these remotes:' : 'Delete from these remotes:'}</Label>

              {candidateRemotes.map(remote => (
                <deleteForm.Field key={remote.name} name="deleteOnRemotes">
                  {field => (
                    <div className="flex items-center">
                      <Checkbox
                        id={`delete-remote-${remote.name}`}
                        checked={field.state.value.includes(remote.name)}
                        onCheckedChange={checked => {
                          if (checked) {
                            field.handleChange([...field.state.value, remote.name])
                          } else {
                            field.handleChange(field.state.value.filter(r => r !== remote.name))
                          }
                        }}
                      />

                      <Label htmlFor={`delete-remote-${remote.name}`} className="cursor-pointer pl-2">
                        {remote.name}
                      </Label>
                    </div>
                  )}
                </deleteForm.Field>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>

            <deleteForm.Field name="deleteOnRemotes">
              {field => (
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deleteTagMutation.isPending || (!deleteLocal && field.state.value.length === 0)}
                >
                  {deleteTagMutation.isPending ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} className="size-3" />
                      Delete Tag
                    </>
                  )}
                </Button>
              )}
            </deleteForm.Field>
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
