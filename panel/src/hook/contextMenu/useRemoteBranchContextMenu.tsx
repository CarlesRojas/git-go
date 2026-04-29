import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useRemoteBranchCheckoutDialog } from '@/hook/dialog/useRemoteBranchCheckoutDialog'
import { useRemoteBranchDeleteDialog } from '@/hook/dialog/useRemoteBranchDeleteDialog'
import { useRemoteBranchFetchIntoLocalDialog } from '@/hook/dialog/useRemoteBranchFetchIntoLocalDialog'
import { useRemoteBranchMergeDialog } from '@/hook/dialog/useRemoteBranchMergeDialog'
import { faCheck, faClone, faCodeMerge, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { ReactNode } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseRemoteBranchContextMenuProps {
  branch?: GitBranch
}

const EMPTY_BRANCH: GitBranch = {
  name: '',
  cleanName: '',
  current: false,
  remote: false,
  hash: '',
}

export const useRemoteBranchContextMenu = ({ branch }: UseRemoteBranchContextMenuProps) => {
  const { showToast } = useToast()
  const [, copy] = useCopyToClipboard()

  const checkoutDialog = useRemoteBranchCheckoutDialog({ remoteBranch: branch ?? EMPTY_BRANCH })
  const mergeDialog = useRemoteBranchMergeDialog({ remoteBranch: branch ?? EMPTY_BRANCH })
  const fetchIntoLocalDialog = useRemoteBranchFetchIntoLocalDialog({ remoteBranch: branch ?? EMPTY_BRANCH })
  const deleteDialog = useRemoteBranchDeleteDialog({ branch: branch ?? EMPTY_BRANCH })

  const handleCopyBranchName = async () => {
    try {
      if (!branch) throw new Error('No branch to copy')
      await copy(branch.cleanName)
      showToast({ text: `Copied '${branch.cleanName}' to clipboard`, type: 'success', icon: faClone })
    } catch (error) {
      showToast({ text: 'Failed to copy branch name', type: 'error', icon: faClone })
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
          <ContextMenuLabel>Remote Branch actions</ContextMenuLabel>

          <ContextMenuItem onClick={checkoutDialog.openDialog}>
            <FontAwesomeIcon icon={faCheck} className="size-3" />
            Checkout
          </ContextMenuItem>

          <ContextMenuItem onClick={fetchIntoLocalDialog.openDialog}>
            <FontAwesomeIcon icon={faDownload} className="size-3" />
            Fetch into Local
          </ContextMenuItem>

          <ContextMenuItem onClick={deleteDialog.openDialog} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Delete
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={mergeDialog.openDialog}>
            <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
            Merge into current branch
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleCopyBranchName}>
            <FontAwesomeIcon icon={faClone} className="size-3" />
            Copy Branch Name
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return {
    ContextMenuWrapper,
    dialogs: {
      checkoutDialog,
      mergeDialog,
      fetchIntoLocalDialog,
      deleteDialog,
    },
  }
}
