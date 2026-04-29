import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useBranchDeleteDialog } from '@/hook/dialog/useBranchDeleteDialog'
import { useBranchMergeIntoCurrentDialog } from '@/hook/dialog/useBranchMergeDialog'
import { useBranchPushDialog } from '@/hook/dialog/useBranchPushDialog'
import { useRebaseCurrentBranchIntoBranch } from '@/hook/dialog/useBranchRebaseDialog'
import { useBranchRenameDialog } from '@/hook/dialog/useBranchRenameDialog'
import { useCheckoutLocalBranch, useGitRemotes } from '@/hook/useGitQueries'
import { faCheck, faCloudArrowUp, faCodeBranch, faCodeMerge, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { ReactNode } from 'react'

interface UseLocalBranchContextMenuProps {
  branch?: GitBranch
}

const EMPTY_BRANCH: GitBranch = {
  name: '',
  cleanName: '',
  current: false,
  remote: false,
  hash: '',
}

export const useLocalBranchContextMenu = ({ branch }: UseLocalBranchContextMenuProps) => {
  const { showToast } = useToast()
  const checkoutMutation = useCheckoutLocalBranch()
  const { data: remotes = [] } = useGitRemotes()

  const renameDialog = useBranchRenameDialog({ branch: branch ?? EMPTY_BRANCH })
  const deleteDialog = useBranchDeleteDialog({ branch: branch ?? EMPTY_BRANCH })
  const pushDialog = useBranchPushDialog({ branch: branch ?? EMPTY_BRANCH })
  const mergeDialog = useBranchMergeIntoCurrentDialog({ branch: branch ?? EMPTY_BRANCH })
  const rebaseDialog = useRebaseCurrentBranchIntoBranch({ branch: branch ?? EMPTY_BRANCH })

  const handleCheckout = () => {
    if (!branch) return

    if (branch.remote) {
      showToast({ text: 'Cannot checkout remote branches directly', type: 'error', icon: faCodeBranch })
      return
    }

    checkoutMutation.mutate(
      { branchName: branch.cleanName },
      {
        onSuccess: () => {
          showToast({ text: `Checked out to branch '${branch.cleanName}'`, icon: faCodeBranch, type: 'success' })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faCodeBranch })
        },
      },
    )
  }

  const ContextMenuWrapper = ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
    if (!branch || !enabled) return <>{children}</>

    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuLabel>Local Branch actions</ContextMenuLabel>

            {!branch.current && (
              <ContextMenuItem onClick={handleCheckout}>
                <FontAwesomeIcon icon={faCheck} className="size-3" />
                Checkout
              </ContextMenuItem>
            )}

            <ContextMenuItem onClick={renameDialog.openDialog}>
              <FontAwesomeIcon icon={faEdit} className="size-3" />
              Rename
            </ContextMenuItem>

            {remotes.length > 0 && (
              <ContextMenuItem onClick={pushDialog.openDialog}>
                <FontAwesomeIcon icon={faCloudArrowUp} className="size-3" />
                Push
              </ContextMenuItem>
            )}

            {!branch.current && (
              <>
                <ContextMenuItem onClick={mergeDialog.openDialog}>
                  <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
                  Merge into Current
                </ContextMenuItem>

                <ContextMenuItem onClick={rebaseDialog.openDialog}>
                  <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
                  Rebase Current Branch Here
                </ContextMenuItem>

                <ContextMenuItem onClick={deleteDialog.openDialog} variant="destructive">
                  <FontAwesomeIcon icon={faTrash} className="size-3" />
                  Delete
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        {renameDialog.DialogComponent}
        {deleteDialog.DialogComponent}
        {pushDialog.DialogComponent}
        {mergeDialog.DialogComponent}
        {rebaseDialog.DialogComponent}
      </>
    )
  }

  return { ContextMenuWrapper }
}
