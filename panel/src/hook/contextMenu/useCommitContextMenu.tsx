import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useBranchDialog } from '@/hook/dialog/useBranchDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useRevertDialog } from '@/hook/dialog/useRevertDialog'
import { useTagDialog } from '@/hook/dialog/useTagDialog'
import { faCodeBranch, faCodeCommit, faRotateLeft, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode } from 'react'

interface UseCommitContextMenuProps {
  commit: GitCommit
}

export const useCommitContextMenu = ({ commit }: UseCommitContextMenuProps) => {
  const tagDialog = useTagDialog({ commit })
  const branchDialog = useBranchDialog({ commit })
  const cherryPickDialog = useCherryPickDialog({ commit })
  const revertDialog = useRevertDialog({ commit })

  const ContextMenuWrapper = ({ children }: { children: ReactNode }) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      {!commit.isUncommitted && (
        <ContextMenuContent
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onMouseEnter={e => e.stopPropagation()}
          onMouseLeave={e => e.stopPropagation()}
          data-disable-commit-highlight
        >
          <ContextMenuLabel>Commit actions</ContextMenuLabel>

          <ContextMenuItem onClick={branchDialog.openDialog}>
            <FontAwesomeIcon icon={faCodeBranch} className="size-3" />
            Create Branch
          </ContextMenuItem>

          <ContextMenuItem onClick={tagDialog.openDialog}>
            <FontAwesomeIcon icon={faTag} className="size-3" />
            Add Tag
          </ContextMenuItem>

          <ContextMenuItem onClick={cherryPickDialog.openDialog}>
            <FontAwesomeIcon icon={faCodeCommit} className="size-3" />
            Cherry Pick
          </ContextMenuItem>

          <ContextMenuItem onClick={revertDialog.openDialog} variant="destructive">
            <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
            Revert
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  )

  return {
    ContextMenuWrapper,
    dialogs: (
      <>
        {tagDialog.DialogComponent}
        {branchDialog.DialogComponent}
        {cherryPickDialog.DialogComponent}
        {revertDialog.DialogComponent}
      </>
    ),
  }
}
