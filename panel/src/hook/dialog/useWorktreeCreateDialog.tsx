import { Button } from '@/component/ui/Button'
import { Checkbox } from '@/component/ui/Checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { Input } from '@/component/ui/Input'
import { Label } from '@/component/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/Select'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { openWorktree, useAddWorktree, useGitBranches, useRepoName } from '@/hook/useGitQueries'
import { faCircleNotch, faFolderTree } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useForm } from '@tanstack/react-form'
import { useMemo, useRef, useState } from 'react'

interface UseWorktreeCreateDialogProps {
  branch?: GitBranch
}

export const useWorktreeCreateDialog = ({ branch }: UseWorktreeCreateDialogProps = {}) => {
  const { showToast } = useToast()
  const { settings } = useSettings()
  const { data: repoName = '' } = useRepoName()
  const { data: allBranches = [] } = useGitBranches()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const addWorktreeMutation = useAddWorktree()
  const pathEditedRef = useRef(false)

  const eligibleBranches = useMemo(
    () => allBranches.filter(b => !b.remote && !b.current && !b.worktreePath),
    [allBranches],
  )

  const getDefaultPath = (branchName: string) =>
    settings.worktreeDefaultPath.replace('{repo}', repoName).replace('{branch}', branchName)

  const createForm = useForm({
    defaultValues: {
      branchName: branch?.cleanName ?? '',
      worktreePath: '',
      openAfterCreate: true,
    },
    onSubmit: async ({ value }) => {
      addWorktreeMutation.mutate(
        {
          worktreePath: value.worktreePath.trim(),
          branchName: value.branchName,
        },
        {
          onSuccess: response => {
            showToast({
              text: `Worktree for '${value.branchName}' created successfully`,
              icon: faFolderTree,
              type: 'success',
            })
            if (value.openAfterCreate) openWorktree(response.worktreePath, settings.worktreeOpenNewWindow)
          },
          onError: error => {
            showToast({ text: error.message, type: 'error', icon: faFolderTree })
          },
          onSettled: () => {
            setShowCreateDialog(false)
            createForm.reset()
          },
        },
      )
    },
  })

  const openDialog = () => {
    pathEditedRef.current = false
    const initialBranch = branch?.cleanName ?? eligibleBranches[0]?.cleanName ?? ''
    createForm.setFieldValue('branchName', initialBranch)
    createForm.setFieldValue('worktreePath', initialBranch ? getDefaultPath(initialBranch) : '')
    createForm.setFieldValue('openAfterCreate', true)
    setShowCreateDialog(true)
  }

  const handleBranchChange = (branchName: string) => {
    createForm.setFieldValue('branchName', branchName)
    if (!pathEditedRef.current) createForm.setFieldValue('worktreePath', getDefaultPath(branchName))
  }

  const DialogComponent = (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            {branch ? (
              <>
                Create a worktree for <strong>{branch.cleanName}</strong>
              </>
            ) : (
              'Create a worktree'
            )}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            createForm.handleSubmit()
          }}
          className="flex flex-col gap-3"
        >
          {!branch && (
            <createForm.Field
              name="branchName"
              validators={{
                onChange: ({ value }) => (!value?.trim() ? 'Branch is required' : undefined),
              }}
              children={field => (
                <div className="flex flex-col gap-1">
                  <Label>Branch</Label>

                  <Select value={field.state.value} onValueChange={handleBranchChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch..." />
                    </SelectTrigger>

                    <SelectContent>
                      {eligibleBranches.map(eligibleBranch => (
                        <SelectItem key={eligibleBranch.cleanName} value={eligibleBranch.cleanName}>
                          {eligibleBranch.cleanName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {eligibleBranches.length === 0 && (
                    <p className="text-xs opacity-50">No branches available — all local branches are checked out</p>
                  )}

                  {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
                </div>
              )}
            />
          )}

          <createForm.Field
            name="worktreePath"
            validators={{
              onChange: ({ value }) => {
                if (!value?.trim()) return 'Worktree path is required'
                if (value.trim().startsWith('-')) return 'Worktree path cannot start with -'
                return undefined
              },
            }}
            children={field => (
              <div className="flex flex-col gap-1">
                <Label>Path (relative to the repository root)</Label>

                <Input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => {
                    pathEditedRef.current = true
                    field.handleChange(e.target.value)
                  }}
                  placeholder="../repo.worktrees/branch"
                />

                {field.state.meta.errors && <p className="text-vsc-error-fg text-xs">{field.state.meta.errors[0]}</p>}
              </div>
            )}
          />

          <createForm.Field name="openAfterCreate">
            {field => (
              <div className="flex items-center">
                <Checkbox
                  id="openAfterCreate"
                  checked={field.state.value}
                  onCheckedChange={checked => field.handleChange(checked === true)}
                />

                <Label htmlFor="openAfterCreate" className="cursor-pointer pl-2">
                  {settings.worktreeOpenNewWindow ? 'Open in new window after creating' : 'Open after creating'}
                </Label>
              </div>
            )}
          </createForm.Field>

          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>

            <createForm.Subscribe
              selector={state => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting || addWorktreeMutation.isPending}>
                  {isSubmitting || addWorktreeMutation.isPending ? (
                    <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faFolderTree} className="size-3" />
                      Create Worktree
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
