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
import { ReactNode } from 'react'

export const useUncommittedChangesContextMenu = () => {
  const stashDialog = useStashDialog()
  const resetDialog = useResetUncommittedChangesDialog()

  const handleStash = () => {
    stashDialog.openDialog()
  }

  const handleDiscardAll = () => {
    resetDialog.openDialog()
  }

  const ContextMenuWrapper = ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
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

          <ContextMenuItem onClick={handleStash}>
            <FontAwesomeIcon icon={faInbox} className="size-3" />
            Stash
          </ContextMenuItem>

          <ContextMenuItem onClick={handleDiscardAll} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Discard all changes
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return {
    ContextMenuWrapper,
    dialogs: {
      stashDialog,
      resetDialog,
    },
  }
}
