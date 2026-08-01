import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useFetchIntoLocalBranch, useFetchIntoLocalBranchNeedsForce } from '@/hook/useGitQueries'
import { faCircleNotch, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

export const useRemoteBranchFetchIntoLocalDialog = () => {
  const { showToast } = useToast()
  const [showFetchDialog, setShowFetchDialog] = useState(false)
  const [remoteBranch, setRemoteBranch] = useState<GitBranch | null>(null)
  const fetchIntoLocalBranchMutation = useFetchIntoLocalBranch()
  const fetchIntoLocalBranchNeedsForceMutation = useFetchIntoLocalBranchNeedsForce()
  const { settings } = useSettings()

  const fetchIntoLocal = (branch: GitBranch, forceFetch: boolean, checkout: boolean) => {
    if (!branch.remoteName) {
      return
    }

    fetchIntoLocalBranchMutation.mutate(
      {
        remote: branch.remoteName,
        remoteBranch: branch.cleanName,
        localBranch: branch.cleanName,
        forceFetch,
        checkout,
      },
      {
        onSuccess: () => {
          showToast({
            text: checkout
              ? `Fetched remote branch '${branch.cleanName}' into local and checked it out successfully`
              : `Fetched remote branch '${branch.cleanName}' into local successfully`,
            icon: faDownload,
            type: 'success',
          })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faDownload })
        },
        onSettled: () => {
          setShowFetchDialog(false)
          fetchForm.reset()
        },
      },
    )
  }

  const fetchForm = useForm({
    defaultValues: {
      forceFetch: settings.remoteFetchForceFetch,
      checkout: settings.remoteFetchCheckout,
    },
    onSubmit: async ({ value }) => {
      if (!remoteBranch) {
        return
      }

      fetchIntoLocal(remoteBranch, value.forceFetch, value.checkout)
    },
  })

  const openDialog = async (branch: GitBranch) => {
    setRemoteBranch(branch)

    if (!settings.remoteFetchConfirmOnlyIfForceNeeded || !branch.remoteName) {
      setShowFetchDialog(true)
      return
    }

    try {
      const needsForce = await fetchIntoLocalBranchNeedsForceMutation.mutateAsync({
        remote: branch.remoteName,
        remoteBranch: branch.cleanName,
        localBranch: branch.cleanName,
      })

      if (needsForce) {
        setShowFetchDialog(true)
        return
      }

      fetchIntoLocal(branch, false, settings.remoteFetchCheckout)
    } catch {
      setShowFetchDialog(true)
    }
  }

  const DialogComponent = (
    <Dialog open={showFetchDialog} onOpenChange={setShowFetchDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Fetch Remote Branch <strong>{remoteBranch?.cleanName}</strong> into Local
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            fetchForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <fetchForm.Field name="forceFetch">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="forceFetch"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="forceFetch" className="cursor-pointer pl-2">
                  Force fetch
                </Label>
              </div>
            )}
          </fetchForm.Field>

          <fetchForm.Field name="checkout">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="checkoutAfterFetch"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="checkoutAfterFetch" className="cursor-pointer pl-2">
                  Checkout branch after fetch
                </Label>
              </div>
            )}
          </fetchForm.Field>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowFetchDialog(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={fetchIntoLocalBranchMutation.isPending}>
              {fetchIntoLocalBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faDownload} className="size-3" />
                  Fetch into Local
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
