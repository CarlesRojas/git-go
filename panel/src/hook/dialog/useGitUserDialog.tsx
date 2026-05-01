import { faCircleNotch, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import { Button } from '../../component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../component/ui/Dialog'
import { Input } from '../../component/ui/Input'
import { Label } from '../../component/ui/Label'
import { useToast } from '../../context/ToastContext'
import { useGitUserConfig, useSetGitUserConfig } from '../useGitQueries'

export const useGitUserDialog = () => {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  const { data: gitUserConfig, isLoading: isLoadingConfig, refetch } = useGitUserConfig()
  const setConfigMutation = useSetGitUserConfig()

  const userForm = useForm({
    defaultValues: {
      userName: '',
      userEmail: '',
    },
    onSubmit: async ({ value }) => {
      setConfigMutation.mutate(
        {
          userName: value.userName.trim(),
          userEmail: value.userEmail.trim(),
          isLocal: true,
        },
        {
          onSuccess: () => {
            showToast({
              text: 'Local git user settings saved successfully',
              icon: faUser,
              type: 'success',
            })
          },
          onError: (error: any) => {
            showToast({
              text: error.message || 'Failed to save settings',
              icon: faUser,
              type: 'error',
            })
          },
          onSettled: () => {
            setIsOpen(false)
            userForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    setIsOpen(true)
    refetch()
  }

  useEffect(() => {
    if (gitUserConfig && isOpen) {
      userForm.setFieldValue('userName', gitUserConfig.userName)
      userForm.setFieldValue('userEmail', gitUserConfig.userEmail)
    }
  }, [gitUserConfig, isOpen, userForm])

  const handleUseGlobal = () => {
    setConfigMutation.mutate(
      { isLocal: false },
      {
        onSuccess: () => {
          showToast({
            text: 'Using global git user settings',
            icon: faUser,
            type: 'success',
          })
          setIsOpen(false)
        },
        onError: (error: any) => {
          showToast({
            text: error.message || 'Failed to switch to global settings',
            icon: faUser,
            type: 'error',
          })
        },
      },
    )
  }

  const isLoading = isLoadingConfig || setConfigMutation.isPending

  const DialogComponent = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Git User Settings</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            userForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <userForm.Field
            name="userName"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Name is required' : undefined),
            }}
          >
            {field => (
              <div>
                <Label htmlFor="user-name">Name</Label>

                <Input
                  id="user-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="Enter your name..."
                  className="mt-1"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </userForm.Field>

          <userForm.Field
            name="userEmail"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Email is required' : undefined),
            }}
          >
            {field => (
              <div>
                <Label htmlFor="user-email">Email</Label>

                <Input
                  id="user-email"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="Enter your email..."
                  className="mt-1"
                />

                {field.state.meta.errors.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </userForm.Field>

          {gitUserConfig?.isLocal && <p className="text-muted-foreground text-sm">Using local repository settings</p>}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            {gitUserConfig?.isLocal && (
              <Button variant="destructive" onClick={handleUseGlobal} disabled={isLoading}>
                {isLoading ? (
                  <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} className="size-3" />
                    Delete Local Override
                  </>
                )}
              </Button>
            )}

            <userForm.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading || isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUser} className="size-3" />
                      Save User
                    </>
                  )}
                </Button>
              )}
            </userForm.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
