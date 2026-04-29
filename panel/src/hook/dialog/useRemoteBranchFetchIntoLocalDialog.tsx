import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useFetchIntoLocalBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRemoteBranchFetchIntoLocalDialogProps {
  remoteBranch: GitBranch
}

export const useRemoteBranchFetchIntoLocalDialog = ({ remoteBranch }: UseRemoteBranchFetchIntoLocalDialogProps) => {
  const { showToast } = useToast()
  const [showFetchDialog, setShowFetchDialog] = useState(false)
  const fetchIntoLocalBranchMutation = useFetchIntoLocalBranch()

  const fetchForm = useForm({
    defaultValues: {
      forceFetch: false,
    },
    onSubmit: async ({ value }) => {
      if (!remoteBranch.remoteName) {
        return
      }

      fetchIntoLocalBranchMutation.mutate(
        {
          remote: remoteBranch.remoteName,
          remoteBranch: remoteBranch.cleanName,
          localBranch: remoteBranch.cleanName,
          forceFetch: value.forceFetch,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Fetched remote branch '${remoteBranch.cleanName}' into local successfully`,
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
    },
  })

  const openDialog = () => {
    setShowFetchDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showFetchDialog} onOpenChange={setShowFetchDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Fetch Remote Branch <strong>{remoteBranch.cleanName}</strong> into Local
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forceFetch"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />
                <Label htmlFor="forceFetch">Force fetch</Label>
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
