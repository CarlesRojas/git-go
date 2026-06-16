import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useBranchDialog } from '@/hook/dialog/useBranchDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useRebaseOntoCommitDialog } from '@/hook/dialog/useRebaseOntoCommitDialog'
import { useResetBranchDialog } from '@/hook/dialog/useResetBranchDialog'
import { useRevertDialog } from '@/hook/dialog/useRevertDialog'
import { useTagDialog } from '@/hook/dialog/useTagDialog'
import { faCodeBranch, faCodeCommit, faRotateLeft, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode, memo } from 'react'

interface UseCommitContextMenuProps {
  commit: GitCommit
}

interface CommitContextMenuWrapperProps {
  children: ReactNode
  enabled: boolean
  onBranchClick: () => void
  onTagClick: () => void
  onCherryPickClick: () => void
  onRevertClick: () => void
  onRebaseClick: () => void
  onResetClick: () => void
}

const CommitContextMenuWrapper = memo(
  ({
    children,
    enabled,
    onBranchClick,
    onTagClick,
    onCherryPickClick,
    onRevertClick,
    onRebaseClick,
    onResetClick,
  }: CommitContextMenuWrapperProps) => {
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
          <ContextMenuLabel>Commit actions</ContextMenuLabel>

          <ContextMenuItem onClick={onBranchClick}>
            <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
            Create Branch
          </ContextMenuItem>

          <ContextMenuItem onClick={onTagClick}>
            <FontAwesomeIcon icon={faTag} className="size-3" />
            Add Tag
          </ContextMenuItem>

          <ContextMenuItem onClick={onCherryPickClick}>
            <FontAwesomeIcon icon={faCodeCommit} className="size-3" />
            Cherry Pick
          </ContextMenuItem>

          <ContextMenuItem onClick={onRevertClick} variant="destructive">
            <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
            Revert
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuLabel>Branch actions</ContextMenuLabel>

          <ContextMenuItem onClick={onRebaseClick}>
            <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
            Rebase current branch here
          </ContextMenuItem>

          <ContextMenuItem onClick={onResetClick} variant="destructive">
            <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
            Reset current branch here
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

CommitContextMenuWrapper.displayName = 'CommitContextMenuWrapper'

export const useCommitContextMenu = ({ commit }: UseCommitContextMenuProps) => {
  const tagDialog = useTagDialog({ commit })
  const branchDialog = useBranchDialog({ commit })
  const cherryPickDialog = useCherryPickDialog({ commit })
  const revertDialog = useRevertDialog({ commit })
  const rebaseDialog = useRebaseOntoCommitDialog({ commit })
  const resetDialog = useResetBranchDialog({ commit })

  const commitContextMenuWrapper = (children: ReactNode, enabled: boolean) => (
    <CommitContextMenuWrapper
      enabled={enabled}
      onBranchClick={branchDialog.openDialog}
      onTagClick={tagDialog.openDialog}
      onCherryPickClick={cherryPickDialog.openDialog}
      onRevertClick={revertDialog.openDialog}
      onRebaseClick={rebaseDialog.openDialog}
      onResetClick={resetDialog.openDialog}
    >
      {children}
    </CommitContextMenuWrapper>
  )

  return {
    commitContextMenuWrapper,
    dialogs: (
      <>
        {tagDialog.DialogComponent}
        {branchDialog.DialogComponent}
        {cherryPickDialog.DialogComponent}
        {revertDialog.DialogComponent}
        {rebaseDialog.DialogComponent}
        {resetDialog.DialogComponent}
      </>
    ),
  }
}
