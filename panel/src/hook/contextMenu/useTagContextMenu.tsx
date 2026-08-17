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
import { useCompare } from '@/context/CompareContext'
import { canCompare, tagSide } from '@/util/compare'
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
  /** Whether a commit is expanded for the tagged commit to be compared with */
  showCompare: boolean
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
    showCompare,
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

          {showCompare && (
            <ContextMenuItem onClick={onCompare}>
              <FontAwesomeIcon icon={faCodeCompare} className="size-3" />
              Compare with selected
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

  // The tagged commit is compared with whatever commit the graph has expanded
  const { selected, compare } = useCompare()
  const compareSide = tagName ? tagSide(tagName, commit) : null

  const handleCompare = () => {
    if (!selected || !compareSide) return
    compare(selected, compareSide)
  }

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
      showCompare={!!compareSide && canCompare(selected, compareSide)}
      onCompare={handleCompare}
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
