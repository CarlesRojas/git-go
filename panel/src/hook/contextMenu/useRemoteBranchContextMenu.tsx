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
import { ReactNode, memo } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

const EMPTY_BRANCH: GitBranch = {
  name: '',
  cleanName: '',
  current: false,
  remote: false,
  hash: '',
}

interface ContextMenuWrapperProps {
  children: ReactNode
  enabled?: boolean
  branch?: GitBranch
}

interface RemoteBranchContextMenuWrapperProps {
  children: ReactNode
  enabled?: boolean
  branch?: GitBranch
  onCheckout: (branch: GitBranch) => void
  onFetchIntoLocal: (branch: GitBranch) => void
  onMerge: (branch: GitBranch) => void
  onDelete: (branch: GitBranch) => void
  onCopy: () => void
}

const RemoteBranchContextMenuWrapper = memo(
  ({
    children,
    enabled = true,
    branch,
    onCheckout,
    onFetchIntoLocal,
    onMerge,
    onDelete,
    onCopy,
  }: RemoteBranchContextMenuWrapperProps) => {
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

          <ContextMenuItem onClick={() => onCheckout(branch)}>
            <FontAwesomeIcon icon={faCheck} className="size-3" />
            Checkout
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onFetchIntoLocal(branch)}>
            <FontAwesomeIcon icon={faDownload} className="size-3" />
            Fetch into Local
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onMerge(branch)}>
            <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
            Merge into Current
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onDelete(branch)} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Delete
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={onCopy}>
            <FontAwesomeIcon icon={faClone} className="size-3" />
            Copy Branch Name
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

RemoteBranchContextMenuWrapper.displayName = 'RemoteBranchContextMenuWrapper'

export const useRemoteBranchContextMenu = () => {
  const { showToast } = useToast()
  const [, copy] = useCopyToClipboard()
  const checkoutDialog = useRemoteBranchCheckoutDialog()
  const mergeDialog = useRemoteBranchMergeDialog()
  const fetchIntoLocalDialog = useRemoteBranchFetchIntoLocalDialog()
  const deleteDialog = useRemoteBranchDeleteDialog()

  const remoteBranchContextMenuWrapper = (children: ReactNode, enabled = true, branch?: GitBranch) => {
    const handleCopyBranchName = async () => {
      try {
        if (!branch) throw new Error('No branch to copy')
        const nameWithRemote = branch.remoteName ? `${branch.remoteName}/${branch.cleanName}` : branch.cleanName
        await copy(nameWithRemote)
        showToast({ text: `Copied '${nameWithRemote}' to clipboard`, icon: faClone })
      } catch (error) {
        showToast({ text: 'Failed to copy branch name', type: 'error', icon: faClone })
      }
    }

    return (
      <RemoteBranchContextMenuWrapper
        enabled={enabled}
        branch={branch}
        onCheckout={checkoutDialog.openDialog}
        onFetchIntoLocal={fetchIntoLocalDialog.openDialog}
        onMerge={mergeDialog.openDialog}
        onDelete={deleteDialog.openDialog}
        onCopy={handleCopyBranchName}
      >
        {children}
      </RemoteBranchContextMenuWrapper>
    )
  }

  return {
    remoteBranchContextMenuWrapper,
    dialogs: {
      checkoutDialog,
      mergeDialog,
      fetchIntoLocalDialog,
      deleteDialog,
    },
  }
}
