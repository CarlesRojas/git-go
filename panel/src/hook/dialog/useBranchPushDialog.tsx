import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/component/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/Select'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useGitRemotes, usePushBranch } from '@/hook/useGitQueries'
import { faCircleNotch, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch, GitPushMode } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

interface UseBranchPushDialogProps {
  branch: GitBranch
}

export const useBranchPushDialog = ({ branch }: UseBranchPushDialogProps) => {
  const { showToast } = useToast()
  const [showPushDialog, setShowPushDialog] = useState(false)
  const pushBranchMutation = usePushBranch()
  const { data: remotes = [], isLoading: remotesLoading } = useGitRemotes()
  const { settings } = useSettings()

  const pushForm = useForm({
    defaultValues: {
      remote: 'origin',
      setUpstream: settings.branchPushSetUpstream,
      pushMode: 'normal' as GitPushMode,
    },
    onSubmit: async ({ value }) => {
      pushBranchMutation.mutate(
        {
          branchName: branch.cleanName,
          remote: value.remote,
          setUpstream: value.setUpstream,
          pushMode: value.pushMode,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Branch '${branch.cleanName}' pushed to '${value.remote}' successfully`,
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

  useEffect(() => {
    const firstRemote = remotes[0]
    if (!!firstRemote) pushForm.setFieldValue('remote', firstRemote.name)
  }, [pushForm, remotes])

  const openDialog = () => {
    setShowPushDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Push branch <strong>{branch.cleanName}</strong>
            {remotes.length === 1 ? ` to ` : ''}
            {remotes.length === 1 && <strong>{remotes[0]!.name}</strong>}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            pushForm.handleSubmit()
          }}
        >
          <div className="flex flex-col gap-3">
            {remotes.length > 1 && (
              <pushForm.Field name="remote">
                {field => (
                  <div>
                    <Label htmlFor="remote">Remote</Label>

                    <Select value={field.state.value} onValueChange={value => field.handleChange(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select remote" />
                      </SelectTrigger>

                      <SelectContent>
                        {remotes.map(remote => (
                          <SelectItem key={remote.name} value={remote.name}>
                            {remote.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </pushForm.Field>
            )}

            <pushForm.Field name="setUpstream">
              {field => (
                <div className="flex items-center">
                  <Checkbox
                    id="setUpstream"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <Label htmlFor="setUpstream" className="cursor-pointer pl-2">
                    Set upstream
                  </Label>
                </div>
              )}
            </pushForm.Field>

            <pushForm.Field name="pushMode">
              {field => (
                <div>
                  <Label htmlFor="pushMode">Push Mode</Label>
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={value => field.handleChange(value as GitPushMode)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="cursor-pointer text-sm font-normal">
                        Normal
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="force-with-lease" id="force-with-lease" />
                      <Label htmlFor="force-with-lease" className="cursor-pointer text-sm font-normal">
                        Force with lease
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="force" id="force" />
                      <Label htmlFor="force" className="cursor-pointer text-sm font-normal">
                        Force
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </pushForm.Field>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowPushDialog(false)} type="button">
              Cancel
            </Button>

            <Button type="submit" disabled={pushBranchMutation.isPending}>
              {pushBranchMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="size-3" />
                  Push Branch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
