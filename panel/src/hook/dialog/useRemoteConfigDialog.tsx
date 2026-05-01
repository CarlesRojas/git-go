import { faCircleNotch, faNetworkWired, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Button } from '../../component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../component/ui/Dialog'
import { Input } from '../../component/ui/Input'
import { Label } from '../../component/ui/Label'
import { useToast } from '../../context/ToastContext'
import { useAddGitRemote, useGetGitRemotes, useRemoveGitRemote } from '../useGitQueries'

export const useRemoteConfigDialog = () => {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddRemote, setShowAddRemote] = useState(false)

  const { data: remotes = [], isLoading: isLoadingRemotes, refetch } = useGetGitRemotes()
  const addRemoteMutation = useAddGitRemote()
  const removeRemoteMutation = useRemoveGitRemote()

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
              icon: faPlus,
              type: 'success',
            })
          },
          onError: (error: any) => {
            showToast({
              text: error.message || 'Failed to add remote',
              icon: faPlus,
              type: 'error',
            })
          },
          onSettled: () => {
            remoteForm.reset()
            setShowAddRemote(false)
          },
        },
      )
    },
  })

  const openDialog = () => {
    setIsOpen(true)
    refetch()
  }

  const handleRemoveRemote = (remoteName: string) => {
    if (!confirm(`Are you sure you want to remove the remote "${remoteName}"?`)) return

    removeRemoteMutation.mutate(remoteName, {
      onSuccess: () => {
        showToast({
          text: `Remote "${remoteName}" removed successfully`,
          icon: faNetworkWired,
          type: 'success',
        })
      },
      onError: (error: any) => {
        showToast({
          text: error.message || 'Failed to remove remote',
          icon: faNetworkWired,
          type: 'error',
        })
      },
    })
  }

  const isLoading = isLoadingRemotes || addRemoteMutation.isPending || removeRemoteMutation.isPending

  const DialogComponent = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Remote Configuration</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="mb-3 text-sm font-medium">Current Remotes</h4>
              {remotes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No remotes configured</p>
              ) : (
                <div className="space-y-3">
                  {remotes.map(remote => (
                    <div key={remote.name} className="rounded-md border p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <h5 className="font-medium">{remote.name}</h5>
                        <Button
                          variant="destructive"
                          size="default"
                          onClick={() => handleRemoveRemote(remote.name)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <div>Fetch: {remote.fetchUrl}</div>
                        <div>Push: {remote.pushUrl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showAddRemote ? (
              <div className="rounded-md border p-4">
                <h4 className="mb-3 text-sm font-medium">Add Remote</h4>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    remoteForm.handleSubmit()
                  }}
                >
                  <div className="space-y-3">
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
                    <div className="flex gap-2">
                      <remoteForm.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                          <Button type="submit" disabled={!canSubmit || isLoading}>
                            {isLoading || isSubmitting ? (
                              <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faPlus} className="size-3" />
                                Add Remote
                              </>
                            )}
                          </Button>
                        )}
                      </remoteForm.Subscribe>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowAddRemote(false)
                          remoteForm.reset()
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <Button onClick={() => setShowAddRemote(true)}>Add Remote</Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
