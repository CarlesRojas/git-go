import { Button } from '@/components/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/Dialog'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/contexts/ToastContext'
import { useAddTag } from '@/hooks/useGitQueries'
import { faCircleNotch, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

interface UseTagDialogProps {
  commit: GitCommit
}

export const useTagDialog = ({ commit }: UseTagDialogProps) => {
  const { showToast } = useToast()
  const [showTagDialog, setShowTagDialog] = useState(false)
  const addTagMutation = useAddTag()

  const tagForm = useForm({
    defaultValues: {
      tagName: '',
      tagMessage: '',
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        addTagMutation.mutate(
          {
            commitHash: commit.hash,
            tagName: value.tagName,
            tagMessage: value.tagMessage || undefined,
            tagType: 'annotated',
          },
          {
            onSuccess: () => {
              showToast({
                text: `Annotated tag '${value.tagName}' created successfully`,
                icon: faTag,
                type: 'success',
              })
              setShowTagDialog(false)
              tagForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to create tag: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  const openDialog = () => setShowTagDialog(true)

  const DialogComponent = (
    <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag to Commit {commit.hash.substring(0, 7)}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            tagForm.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <tagForm.Field
            name="tagName"
            validators={{
              onChange: ({ value }) => (!value ? 'Tag name is required' : undefined),
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>Tag Name</Label>

                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="v1.0.0"
                />

                {field.state.meta.errors && (
                  <p className="text-xs text-(--vscode-errorForeground)">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />

          <tagForm.Field
            name="tagMessage"
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>Message</Label>

                <Textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="Release notes or tag description"
                  rows={3}
                />
              </div>
            )}
          />

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>

            <tagForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    'Create Tag'
                  )}
                </Button>
              )}
            />
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
