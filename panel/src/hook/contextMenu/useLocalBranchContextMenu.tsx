import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useBranchDeleteDialog } from '@/hook/dialog/useBranchDeleteDialog'
import { useBranchMergeIntoCurrentDialog } from '@/hook/dialog/useBranchMergeDialog'
import { useBranchPushDialog } from '@/hook/dialog/useBranchPushDialog'
import { useRebaseCurrentBranchIntoBranch } from '@/hook/dialog/useBranchRebaseDialog'
import { useBranchRenameDialog } from '@/hook/dialog/useBranchRenameDialog'
import { useCheckoutLocalBranch, useGitRemotes } from '@/hook/useGitQueries'
import {
  faCheck,
  faCloudArrowUp,
  faCodeBranch,
  faCodeMerge,
  faCopy,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { ReactNode } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

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
  const [, copy] = useCopyToClipboard()

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

  const handleCopyBranchName = async () => {
    try {
      if (!branch) throw new Error('No branch to copy')
      await copy(branch.cleanName)
      showToast({ text: `Copied '${branch.cleanName}' to clipboard`, type: 'success', icon: faCopy })
    } catch (error) {
      showToast({ text: 'Failed to copy branch name', type: 'error', icon: faCopy })
    }
  }

  const ContextMenuWrapper = ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
    if (!branch || !enabled) return <>{children}</>

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        <ContextMenuContent
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onMouseEnter={e => e.stopPropagation()}
          onMouseLeave={e => e.stopPropagation()}
          data-disable-commit-highlight
        >
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

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleCopyBranchName}>
            <FontAwesomeIcon icon={faCopy} className="size-3" />
            Copy Branch Name
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return {
    ContextMenuWrapper,
    dialogs: (
      <>
        {renameDialog.DialogComponent}
        {deleteDialog.DialogComponent}
        {pushDialog.DialogComponent}
        {mergeDialog.DialogComponent}
        {rebaseDialog.DialogComponent}
      </>
    ),
  }
}
