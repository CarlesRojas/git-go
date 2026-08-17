import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Label } from '@/component/ui/Label'
import { Textarea } from '@/component/ui/Textarea'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useRewordCommit } from '@/hook/useGitQueries'
import { useRewordEligibility } from '@/hook/useRewordEligibility'
import { faCircleNotch, faPen, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

interface UseRewordDialogProps {
  commit: GitCommit
}

export const useRewordDialog = ({ commit }: UseRewordDialogProps) => {
  const { showToast } = useToast()
  const { settings } = useSettings()
  const [showRewordDialog, setShowRewordDialog] = useState(false)
  const rewordMutation = useRewordCommit()
  const eligibility = useRewordEligibility(commit.hash)

  const fullMessage = commit.body ? `${commit.message}\n\n${commit.body}` : commit.message
  const isHead = eligibility?.index === 0
  const descendantCount = eligibility?.index ?? 0

  const rewordForm = useForm({
    defaultValues: {
      message: fullMessage,
      autoStash: settings.rebaseAutoStash,
    },
    onSubmit: async ({ value }) => {
      rewordMutation.mutate(
        {
          commitHash: commit.hash,
          message: value.message,
          autoStash: value.autoStash,
        },
        {
          onSuccess: () => {
            showToast({
              text: `Message of commit ${commit.hash.substring(0, 7)} updated successfully`,
              icon: faPen,
              type: 'success',
            })
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faPen })
          },
          onSettled: () => {
            setShowRewordDialog(false)
          },
        },
      )
    },
  })

  const openDialog = () => setShowRewordDialog(true)

  // The commit this dialog is bound to can change in the same render that opens it (the drag
  // overlay sets both together), so the prefill happens once the dialog shows rather than at
  // the openDialog call, which would still see the previous commit's message.
  useEffect(() => {
    if (!showRewordDialog) return
    rewordForm.setFieldValue('message', fullMessage)
    rewordForm.setFieldValue('autoStash', settings.rebaseAutoStash)
    // Refilling is tied to the dialog opening on a commit, never to a settings edit mid-open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRewordDialog, commit.hash])

  const DialogComponent = (
    <Dialog open={showRewordDialog} onOpenChange={setShowRewordDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Edit message of commit <strong>{commit.hash.substring(0, 7)}</strong>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            rewordForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          <rewordForm.Field
            name="message"
            validators={{
              onChange: ({ value }) => (!value.trim() ? 'The commit message cannot be empty' : undefined),
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label htmlFor="reword-message">Commit Message</Label>

                <Textarea
                  id="reword-message"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  rows={6}
                  className="min-h-32 font-mono text-xs"
                  autoFocus
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          {!isHead && (
            <p className="text-xs opacity-70">
              This will rewrite <strong>{descendantCount}</strong> descendant commit
              {descendantCount === 1 ? '' : 's'} between this commit and the tip of the branch.
            </p>
          )}

          {!isHead && (
            <rewordForm.Field
              name="autoStash"
              children={field => (
                <div className="flex items-center">
                  <Checkbox
                    id="reword-autostash"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />

                  <Label htmlFor="reword-autostash" className="cursor-pointer pl-2">
                    Autostash uncommitted changes
                  </Label>
                </div>
              )}
            />
          )}

          {eligibility?.published && (
            <p className="text-vsc-error-fg flex items-start gap-1.5 text-xs">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 size-3 shrink-0" />
              This commit is already pushed to the upstream. Rewording it rewrites history the remote holds, so the next
              push will need to be a force push.
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowRewordDialog(false)}>
              Cancel
            </Button>

            <rewordForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || rewordMutation.isPending}>
                  {rewordMutation.isPending ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPen} className="size-3" />
                      Save Message
                    </>
                  )}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
