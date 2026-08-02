import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/component/ui/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/Select'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useGitRemotes, usePushBranch } from '@/hook/useGitQueries'
import { resolveDefaultRemote } from '@/util/resolveDefaultRemote'
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

  // Held separately from the prop so a drop can name the branch it acted on: the prop is fed by
  // state set in the same tick, which has not landed yet when the dialog is skipped.
  const [pushBranch, setPushBranch] = useState<GitBranch | null>(null)
  const subject = pushBranch ?? branch

  const push = (target: GitBranch, values: { remote: string; setUpstream: boolean; pushMode: GitPushMode }) => {
    pushBranchMutation.mutate(
      {
        branchName: target.cleanName,
        remote: values.remote,
        setUpstream: values.setUpstream,
        pushMode: values.pushMode,
      },
      {
        onSuccess: () => {
          showToast({
            text: `Branch '${target.cleanName}' pushed to '${values.remote}' successfully`,
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
  }

  const pushForm = useForm({
    defaultValues: {
      remote: settings.remoteDefaultRemote,
      setUpstream: settings.branchPushSetUpstream,
      pushMode: settings.branchPushMode,
    },
    onSubmit: async ({ value }) => push(subject, value),
  })

  useEffect(() => {
    const defaultRemote = resolveDefaultRemote(remotes, settings.remoteDefaultRemote)
    if (!!defaultRemote) pushForm.setFieldValue('remote', defaultRemote)
  }, [pushForm, remotes, settings.remoteDefaultRemote])

  const openDialog = (options?: { branch?: GitBranch; remote?: string }) => {
    const target = options?.branch ?? branch
    const remote =
      options?.remote ?? resolveDefaultRemote(remotes, settings.remoteDefaultRemote) ?? pushForm.state.values.remote

    if (!settings.confirmPush) {
      push(target, {
        remote,
        setUpstream: settings.branchPushSetUpstream,
        pushMode: settings.branchPushMode,
      })
      return
    }

    setPushBranch(options?.branch ?? null)
    pushForm.setFieldValue('remote', remote)
    setShowPushDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Push branch <strong>{subject.cleanName}</strong>
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
