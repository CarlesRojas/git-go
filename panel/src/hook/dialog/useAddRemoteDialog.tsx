import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useAddGitRemote } from '@/hook/useGitQueries'
import { faCircleDot, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useAddRemoteDialog = () => {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const addRemoteMutation = useAddGitRemote()

  const remoteForm = useForm({
    defaultValues: {
      name: '',
      fetchUrl: '',
      pushUrl: '',
    },
    onSubmit: async ({ value }) => {
      addRemoteMutation.mutate(
        {
          name: value.name.trim(),
          fetchUrl: value.fetchUrl.trim(),
          pushUrl: value.pushUrl.trim() || value.fetchUrl.trim(),
        },
        {
          onSuccess: () => {
            showToast({
              text: `Remote "${value.name}" added successfully`,
              icon: faCircleDot,
              type: 'success',
            })
          },
          onError: (error: any) => {
            showToast({
              text: error.message || 'Failed to add remote',
              icon: faCircleDot,
              type: 'error',
            })
          },
          onSettled: () => {
            remoteForm.reset()
            setIsOpen(false)
          },
        },
      )
    },
  })

  const openDialog = () => {
    setIsOpen(true)
  }

  const isLoading = addRemoteMutation.isPending

  const DialogComponent = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Remote</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            remoteForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <remoteForm.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Name is required' : undefined),
            }}
          >
            {field => (
              <div>
                <Label htmlFor="remote-name">Name</Label>
                <Input
                  id="remote-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="origin"
                  className="mt-1"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </remoteForm.Field>

          <remoteForm.Field
            name="fetchUrl"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Fetch URL is required' : undefined),
            }}
          >
            {field => (
              <div>
                <Label htmlFor="fetch-url">Fetch URL</Label>

                <Input
                  id="fetch-url"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  className="mt-1"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </remoteForm.Field>

          <remoteForm.Field name="pushUrl">
            {field => (
              <div>
                <Label htmlFor="push-url">Push URL (optional)</Label>

                <Input
                  id="push-url"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="Leave empty to use fetch URL"
                  className="mt-1"
                />
              </div>
            )}
          </remoteForm.Field>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <remoteForm.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading || isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCircleDot} className="size-3" />
                      Add Remote
                    </>
                  )}
                </Button>
              )}
            </remoteForm.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
