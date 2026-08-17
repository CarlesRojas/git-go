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
import { useCompareEntry } from '@/context/CompareContext'
import { tagSide } from '@/util/compare'
import { faClone, faCodeCompare, faEye, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode, memo } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseTagContextMenuProps {
  commit: GitCommit
  tagName?: string
  remoteOnly?: boolean
}

interface TagContextMenuWrapperProps {
  children: ReactNode
  enabled?: boolean
  commit?: GitCommit
  tagName?: string
  remoteOnly?: boolean
  /** How the compare entry reads in the current state, or null when it does not apply */
  compareLabel: string | null
  onCompare: () => void
  onViewDetails: () => void
  onPush: () => void
  onDelete: () => void
  onCopy: () => void
}

const TagContextMenuWrapper = memo(
  ({
    children,
    enabled = true,
    commit,
    tagName,
    remoteOnly = false,
    compareLabel,
    onCompare,
    onViewDetails,
    onPush,
    onDelete,
    onCopy,
  }: TagContextMenuWrapperProps) => {
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

          {!remoteOnly && (
            <ContextMenuItem onClick={onViewDetails}>
              <FontAwesomeIcon icon={faEye} className="size-3" />
              View details
            </ContextMenuItem>
          )}

          {!remoteOnly && (
            <ContextMenuItem onClick={onPush}>
              <FontAwesomeIcon icon={faUpload} className="size-3" />
              Push
            </ContextMenuItem>
          )}

          {compareLabel && (
            <ContextMenuItem onClick={onCompare}>
              <FontAwesomeIcon icon={faCodeCompare} className="size-3" />
              {compareLabel}
            </ContextMenuItem>
          )}

          <ContextMenuItem onClick={onDelete} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Delete
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={onCopy}>
            <FontAwesomeIcon icon={faClone} className="size-3" />
            Copy Tag Name
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

TagContextMenuWrapper.displayName = 'TagContextMenuWrapper'

export const useTagContextMenu = ({ commit, tagName, remoteOnly = false }: UseTagContextMenuProps) => {
  const { showToast } = useToast()
  const [, copy] = useCopyToClipboard()

  const detailsDialog = useTagDetailsDialog()
  const pushDialog = useTagPushDialog()
  const deleteDialog = useTagDeleteDialog()

  const handleViewDetails = () => {
    if (tagName) detailsDialog.openDialog(commit, tagName)
  }

  // The tagged commit is what takes part in the comparison
  const compareEntry = useCompareEntry(tagName ? tagSide(tagName, commit) : null)

  const handleCopyTagName = async () => {
    try {
      if (!tagName) throw new Error('No tag to copy')
      await copy(tagName)
      showToast({ text: `Copied '${tagName}' to clipboard`, icon: faClone })
    } catch (error) {
      showToast({ text: 'Failed to copy tag name', type: 'error', icon: faClone })
    }
  }

  const tagContextMenuWrapper = (children: ReactNode, enabled = true) => (
    <TagContextMenuWrapper
      enabled={enabled}
      commit={commit}
      tagName={tagName}
      remoteOnly={remoteOnly}
      compareLabel={compareEntry?.label ?? null}
      onCompare={() => compareEntry?.onSelect()}
      onViewDetails={handleViewDetails}
      onPush={() => tagName && pushDialog.openDialog(commit, tagName)}
      onDelete={() => tagName && deleteDialog.openDialog(tagName, { deleteLocal: !remoteOnly })}
      onCopy={handleCopyTagName}
    >
      {children}
    </TagContextMenuWrapper>
  )

  return {
    tagContextMenuWrapper,
    dialogs: {
      detailsDialog,
      pushDialog,
      deleteDialog,
    },
  }
}
