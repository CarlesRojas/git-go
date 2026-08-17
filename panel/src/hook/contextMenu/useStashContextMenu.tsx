import { formatStash } from '@/component/StashTagPill'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useStashBranchDialog } from '@/hook/dialog/useStashBranchDialog'
import { useStashDropDialog } from '@/hook/dialog/useStashDropDialog'
import { useApplyStash, usePopStash } from '@/hook/useGitQueries'
import { faArrowRightFromBracket, faCodeBranch, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode, memo } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface UseStashContextMenuProps {
  stash?: string
  /** The stash's own commit, whose first parent is where a branch created from it starts */
  commit?: GitCommit
}

interface StashContextMenuWrapperProps {
  children: ReactNode
  enabled?: boolean
  stash?: string
  onApply: () => void
  onPop: () => void
  onBranch: () => void
  onDrop: () => void
}

const StashContextMenuWrapper = memo(
  ({ children, enabled = true, stash, onApply, onPop, onBranch, onDrop }: StashContextMenuWrapperProps) => {
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

          <ContextMenuItem onClick={onApply}>
            <FontAwesomeIcon icon={faPlay} className="size-3" />
            Apply
          </ContextMenuItem>

          <ContextMenuItem onClick={onPop}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="size-3" />
            Pop
          </ContextMenuItem>

          <ContextMenuItem onClick={onBranch}>
            <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
            Create Branch from Stash
          </ContextMenuItem>

          <ContextMenuItem onClick={onDrop} variant="destructive">
            <FontAwesomeIcon icon={faTrash} className="size-3" />
            Drop
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

StashContextMenuWrapper.displayName = 'StashContextMenuWrapper'

export const useStashContextMenu = ({ stash, commit }: UseStashContextMenuProps) => {
  const { showToast } = useToast()
  const { settings } = useSettings()
  const applyStashMutation = useApplyStash()
  const popStashMutation = usePopStash()
  const [, copy] = useCopyToClipboard()

  const stashDropDialog = useStashDropDialog({ stash: stash ?? '' })
  const stashBranchDialog = useStashBranchDialog({ stash: stash ?? '', commit })

  const handleApplyStash = () => {
    if (!stash) return

    applyStashMutation.mutate(
      { stashSelector: stash, reinstateIndex: settings.stashReinstateIndex },
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
      { stashSelector: stash, reinstateIndex: settings.stashReinstateIndex },
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

  const handleBranchFromStash = () => {
    stashBranchDialog.openDialog()
  }

  const stashContextMenuWrapper = (children: ReactNode, enabled = true) => (
    <StashContextMenuWrapper
      enabled={enabled}
      stash={stash}
      onApply={handleApplyStash}
      onPop={handlePopStash}
      onBranch={handleBranchFromStash}
      onDrop={handleDropStash}
    >
      {children}
    </StashContextMenuWrapper>
  )

  return {
    stashContextMenuWrapper,
    dialogs: { stashDropDialog, stashBranchDialog },
  }
}
