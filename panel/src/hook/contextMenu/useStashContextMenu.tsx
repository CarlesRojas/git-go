import { formatStash } from '@/component/StashTagPill'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useToast } from '@/context/ToastContext'
import { useStashDropDialog } from '@/hook/dialog/useStashDropDialog'
import { useApplyStash, usePopStash } from '@/hook/useGitQueries'
import { faArrowRightFromBracket, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactNode } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseStashContextMenuProps {
  stash?: string
}

export const useStashContextMenu = ({ stash }: UseStashContextMenuProps) => {
  const { showToast } = useToast()
  const applyStashMutation = useApplyStash()
  const popStashMutation = usePopStash()
  const [, copy] = useCopyToClipboard()

  const stashDropDialog = useStashDropDialog({ stash: stash ?? '' })

  const handleApplyStash = () => {
    if (!stash) return

    applyStashMutation.mutate(
      { stashSelector: stash, reinstateIndex: false },
      {
        onSuccess: () => {
          showToast({ text: `Applied '${formatStash(stash)}'`, icon: faPlay, type: 'success' })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faPlay })
        },
      },
    )
  }

  const handlePopStash = () => {
    if (!stash) return

    popStashMutation.mutate(
      { stashSelector: stash, reinstateIndex: false },
      {
        onSuccess: () => {
          showToast({ text: `Popped '${formatStash(stash)}'`, icon: faArrowRightFromBracket, type: 'success' })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faArrowRightFromBracket })
        },
      },
    )
  }

  const handleDropStash = () => {
    stashDropDialog.openDialog()
  }

  const ContextMenuWrapper = ({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) => {
    if (!stash || !enabled) return <>{children}</>

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
          <ContextMenuLabel>Stash actions</ContextMenuLabel>

          <ContextMenuItem onClick={handleApplyStash}>
            <FontAwesomeIcon icon={faPlay} className="size-3" />
            Apply
          </ContextMenuItem>

          <ContextMenuItem onClick={handlePopStash}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="size-3" />
            Pop
          </ContextMenuItem>

          <ContextMenuItem onClick={handleDropStash} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Drop
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return {
    ContextMenuWrapper,
    dialogs: { stashDropDialog },
  }
}
