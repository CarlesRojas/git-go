import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useResetUncommittedChangesDialog } from '@/hook/dialog/useResetUncommittedChangesDialog'
import { useStashDialog } from '@/hook/dialog/useStashDialog'
import { faInbox, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode, memo } from 'react'

interface UncommittedChangesContextMenuWrapperProps {
  children: ReactNode
  enabled?: boolean
  onStash: () => void
  onDiscardAll: () => void
}

const UncommittedChangesContextMenuWrapper = memo(
  ({ children, enabled = true, onStash, onDiscardAll }: UncommittedChangesContextMenuWrapperProps) => {
    if (!enabled) return <>{children}</>

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
          <ContextMenuLabel>Uncommitted changes actions</ContextMenuLabel>

          <ContextMenuItem onClick={onStash}>
            <FontAwesomeIcon icon={faInbox} className="size-3" />
            Stash
          </ContextMenuItem>

          <ContextMenuItem onClick={onDiscardAll} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Discard all changes
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

UncommittedChangesContextMenuWrapper.displayName = 'UncommittedChangesContextMenuWrapper'

export const useUncommittedChangesContextMenu = () => {
  const stashDialog = useStashDialog()
  const resetDialog = useResetUncommittedChangesDialog()

  const handleStash = () => {
    stashDialog.openDialog()
  }

  const handleDiscardAll = () => {
    resetDialog.openDialog()
  }

  const uncommittedChangesContextMenuWrapper = (children: ReactNode, enabled = true) => (
    <UncommittedChangesContextMenuWrapper enabled={enabled} onStash={handleStash} onDiscardAll={handleDiscardAll}>
      {children}
    </UncommittedChangesContextMenuWrapper>
  )

  return {
    uncommittedChangesContextMenuWrapper,
    dialogs: {
      stashDialog,
      resetDialog,
    },
  }
}
