import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useTagDeleteDialog } from '@/hook/dialog/useTagDeleteDialog'
import { useTagDetailsDialog } from '@/hook/dialog/useTagDetailsDialog'
import { useTagPushDialog } from '@/hook/dialog/useTagPushDialog'
import { faClone, faEye, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseTagContextMenuProps {
  commit: GitCommit
  tagName?: string
}

export const useTagContextMenu = ({ commit, tagName }: UseTagContextMenuProps) => {
  const { showToast } = useToast()
  const [, copy] = useCopyToClipboard()

  const detailsDialog = useTagDetailsDialog()
  const pushDialog = useTagPushDialog()
  const deleteDialog = useTagDeleteDialog()

  const handleViewDetails = () => {
    if (tagName) detailsDialog.openDialog(commit, tagName)
  }

  const handleCopyTagName = async () => {
    try {
      if (!tagName) throw new Error('No tag to copy')
      await copy(tagName)
      showToast({ text: `Copied '${tagName}' to clipboard`, type: 'success', icon: faClone })
    } catch (error) {
      showToast({ text: 'Failed to copy tag name', type: 'error', icon: faClone })
    }
  }

  const ContextMenuWrapper = ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
    if (!commit || !tagName || !enabled) return <>{children}</>

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
          <ContextMenuLabel>Tag actions</ContextMenuLabel>

          <ContextMenuItem onClick={handleViewDetails}>
            <FontAwesomeIcon icon={faEye} className="size-3" />
            View details
          </ContextMenuItem>

          <ContextMenuItem onClick={() => tagName && pushDialog.openDialog(commit, tagName)}>
            <FontAwesomeIcon icon={faUpload} className="size-3" />
            Push
          </ContextMenuItem>

          <ContextMenuItem onClick={() => tagName && deleteDialog.openDialog(tagName)} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Delete
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleCopyTagName}>
            <FontAwesomeIcon icon={faClone} className="size-3" />
            Copy Tag Name
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return {
    ContextMenuWrapper,
    dialogs: {
      detailsDialog,
      pushDialog,
      deleteDialog,
    },
  }
}
