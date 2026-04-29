import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { useToast } from '@/context/ToastContext'
import { useCurrentBranch, useRebaseBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseRebaseCurrentBranchIntoBranchProps {
  branch: GitBranch
}

export const useRebaseCurrentBranchIntoBranch = ({ branch }: UseRebaseCurrentBranchIntoBranchProps) => {
  const { showToast } = useToast()
  const [showRebaseDialog, setShowRebaseDialog] = useState(false)
  const rebaseBranchMutation = useRebaseBranch()
  const { data: currentBranch } = useCurrentBranch()

  const rebaseForm = useForm({
    defaultValues: {
      interactive: false,
      ignoreDate: true,
    },
    onSubmit: async ({ value }) => {
      rebaseBranchMutation.mutate(
        {
          branchName: branch.cleanName,
          ignoreDate: value.ignoreDate,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Current branch rebased onto '${branch.cleanName}' successfully`,
              icon: faCodeBranch,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faCodeBranch })
          },
          onSettled: () => {
            setShowRebaseDialog(false)
            rebaseForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    setShowRebaseDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showRebaseDialog} onOpenChange={setShowRebaseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Rebase Branch {currentBranch ? <strong>{currentBranch}</strong> : ''} (current branch) on Branch{' '}
            <strong>{branch.cleanName}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            rebaseForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-4">
            <rebaseForm.Field name="interactive">
              {field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="interactive"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="interactive" className="text-sm">
                    Launch interactive rebase in terminal
                  </Label>
                </div>
              )}
            </rebaseForm.Field>

            <rebaseForm.Field name="ignoreDate">
              {field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignoreDate"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="ignoreDate" className="text-sm">
                    Ignore date
                  </Label>
                </div>
              )}
            </rebaseForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowRebaseDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" disabled={rebaseBranchMutation.isPending}>
              {rebaseBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                'Rebase Branch'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
