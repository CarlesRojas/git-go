import { faClone, faCodeBranch, faRotateLeft, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { GitCommit } from '../../../src/gitService'
import { Button } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../components/ContextMenu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog'
import { Input } from '../components/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/Select'
import { Textarea } from '../components/Textarea'
import { useToast } from '../contexts/ToastContext'
import { useAddTag, useCherryPickCommit, useCreateBranchFromCommit, useRevertCommit } from './useGitQueries'

interface UseCommitContextMenuProps {
  commit: GitCommit
}

export const useCommitContextMenu = ({ commit }: UseCommitContextMenuProps) => {
  const { showToast } = useToast()

  // Dialog states
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showBranchDialog, setShowBranchDialog] = useState(false)
  const [showCherryPickDialog, setShowCherryPickDialog] = useState(false)
  const [showRevertDialog, setShowRevertDialog] = useState(false)

  // Form states
  const tagForm = useForm({
    defaultValues: {
      tagName: '',
      tagMessage: '',
      tagType: 'annotated' as 'annotated' | 'lightweight',
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        addTagMutation.mutate(
          {
            commitHash: commit.hash,
            tagName: value.tagName,
            tagMessage: value.tagMessage || undefined,
            tagType: value.tagType,
          },
          {
            onSuccess: () => {
              const typeText = value.tagType === 'lightweight' ? 'Lightweight' : 'Annotated'
              showToast({
                text: `${typeText} tag '${value.tagName}' created successfully`,
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

  const branchForm = useForm({
    defaultValues: {
      branchName: '',
      checkout: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        createBranchMutation.mutate(
          {
            commitHash: commit.hash,
            branchName: value.branchName,
            checkout: value.checkout,
          },
          {
            onSuccess: () => {
              const action = value.checkout ? 'created and checked out' : 'created'
              showToast({
                text: `Branch '${value.branchName}' ${action} successfully`,
                icon: faCodeBranch,
                type: 'success',
              })
              setShowBranchDialog(false)
              branchForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to create branch: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  const cherryPickForm = useForm({
    defaultValues: {
      recordOrigin: false,
      noCommit: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        cherryPickMutation.mutate(
          {
            commitHash: commit.hash,
            recordOrigin: value.recordOrigin,
            noCommit: value.noCommit,
          },
          {
            onSuccess: () => {
              showToast({ text: 'Commit cherry-picked successfully', icon: faClone, type: 'success' })
              setShowCherryPickDialog(false)
              cherryPickForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to cherry-pick: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  const revertForm = useForm({
    defaultValues: {
      noCommit: false,
    },
    onSubmit: async ({ value }) => {
      return new Promise<void>((resolve, reject) => {
        revertMutation.mutate(
          {
            commitHash: commit.hash,
            noCommit: value.noCommit,
          },
          {
            onSuccess: () => {
              const action = value.noCommit ? 'staged revert changes for' : 'reverted'
              showToast({
                text: `Successfully ${action} commit ${commit.hash.substring(0, 7)}`,
                icon: faRotateLeft,
                type: 'success',
              })
              setShowRevertDialog(false)
              revertForm.reset()
              resolve()
            },
            onError: error => {
              showToast({ text: `Failed to revert: ${error.message}`, type: 'error' })
              reject(error)
            },
          },
        )
      })
    },
  })

  // Mutations
  const addTagMutation = useAddTag()
  const createBranchMutation = useCreateBranchFromCommit()
  const cherryPickMutation = useCherryPickCommit()
  const revertMutation = useRevertCommit()

  const ContextMenuWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        {!commit.isUncommitted && (
          <ContextMenuContent className="w-48">
            <ContextMenuItem onClick={() => setShowTagDialog(true)}>
              <FontAwesomeIcon icon={faTag} className="mr-2 size-4" />
              Add Tag
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setShowBranchDialog(true)}>
              <FontAwesomeIcon icon={faCodeBranch} className="mr-2 size-4" />
              Create Branch
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => setShowCherryPickDialog(true)}>
              <FontAwesomeIcon icon={faClone} className="mr-2 size-4" />
              Cherry Pick
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setShowRevertDialog(true)}>
              <FontAwesomeIcon icon={faRotateLeft} className="mr-2 size-4" />
              Revert
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {/* Add Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>Create a new tag at commit {commit.hash.substring(0, 7)}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              tagForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <tagForm.Field
              name="tagName"
              validators={{
                onChange: ({ value }) => (!value ? 'Tag name is required' : undefined),
              }}
              children={field => (
                <div>
                  <label className="text-xs font-medium text-(--vscode-editor-foreground)">Tag Name</label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="v1.0.0"
                    className="mt-1"
                  />
                  {field.state.meta.errors && <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>}
                </div>
              )}
            />
            <tagForm.Field
              name="tagMessage"
              children={field => (
                <div>
                  <label className="text-xs font-medium text-(--vscode-editor-foreground)">Message</label>
                  <Textarea
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Release notes or tag description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}
            />
            <tagForm.Field
              name="tagType"
              children={field => (
                <div>
                  <label className="text-xs font-medium text-(--vscode-editor-foreground)">Tag Type</label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value: string) => field.handleChange(value as 'annotated' | 'lightweight')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annotated">Annotated</SelectItem>
                      <SelectItem value="lightweight">Lightweight</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-(--vscode-editor-foreground)/70">
                    {field.state.value === 'annotated'
                      ? 'Recommended: Stores tagger info, date, and message'
                      : 'Simple pointer to a commit'}
                  </p>
                </div>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowTagDialog(false)}>
                Cancel
              </Button>
              <tagForm.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Tag'}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Branch Dialog */}
      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Branch</DialogTitle>
            <DialogDescription>Create a new branch from commit {commit.hash.substring(0, 7)}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              branchForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <branchForm.Field
              name="branchName"
              validators={{
                onChange: ({ value }) => (!value ? 'Branch name is required' : undefined),
              }}
              children={field => (
                <div>
                  <label className="text-xs font-medium text-(--vscode-editor-foreground)">Branch Name</label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="feature/new-feature"
                    className="mt-1"
                  />
                  {field.state.meta.errors && <p className="mt-1 text-xs text-red-500">{field.state.meta.errors[0]}</p>}
                </div>
              )}
            />
            <branchForm.Field
              name="checkout"
              children={field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkout"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <label htmlFor="checkout" className="text-xs text-(--vscode-editor-foreground)">
                    Checkout new branch
                  </label>
                </div>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowBranchDialog(false)}>
                Cancel
              </Button>
              <branchForm.Subscribe
                selector={state => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Branch'}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cherry Pick Dialog */}
      <Dialog open={showCherryPickDialog} onOpenChange={setShowCherryPickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cherry Pick Commit</DialogTitle>
            <DialogDescription>Cherry pick commit {commit.hash.substring(0, 7)}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              cherryPickForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <cherryPickForm.Field
              name="recordOrigin"
              children={field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recordOrigin"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <label htmlFor="recordOrigin" className="text-xs text-(--vscode-editor-foreground)">
                    Record origin (add -x to commit message)
                  </label>
                </div>
              )}
            />
            <cherryPickForm.Field
              name="noCommit"
              children={field => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noCommit"
                    checked={field.state.value}
                    onCheckedChange={checked => field.handleChange(checked === true)}
                  />
                  <label htmlFor="noCommit" className="text-xs text-(--vscode-editor-foreground)">
                    Don't commit (stage changes only)
                  </label>
                </div>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowCherryPickDialog(false)}>
                Cancel
              </Button>
              <cherryPickForm.Subscribe
                selector={state => [state.isSubmitting]}
                children={([isSubmitting]) => (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Cherry Picking...' : 'Cherry Pick'}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revert Dialog */}
      <Dialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revert Commit</DialogTitle>
            <DialogDescription>Revert commit {commit.hash.substring(0, 7)}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              revertForm.handleSubmit()
            }}
            className="space-y-4"
          >
            <revertForm.Field
              name="noCommit"
              children={field => (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noCommit"
                      checked={field.state.value}
                      onCheckedChange={checked => field.handleChange(checked === true)}
                    />
                    <label htmlFor="noCommit" className="text-xs text-(--vscode-editor-foreground)">
                      Don't commit (stage changes only)
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-(--vscode-editor-foreground)/70">
                    This will{' '}
                    {field.state.value
                      ? 'stage revert changes without committing'
                      : 'create a new commit that undoes the changes from this commit'}
                    .
                  </p>
                </>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowRevertDialog(false)}>
                Cancel
              </Button>
              <revertForm.Subscribe
                selector={state => [state.isSubmitting]}
                children={([isSubmitting]) => (
                  <Button variant="destructive" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Reverting...' : 'Revert Commit'}
                  </Button>
                )}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )

  return {
    ContextMenuWrapper,
  }
}
