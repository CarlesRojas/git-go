import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useBranchDialog } from '@/hooks/dialog/useBranchDialog'
import { useCherryPickDialog } from '@/hooks/dialog/useCherryPickDialog'
import { useRevertDialog } from '@/hooks/dialog/useRevertDialog'
import { useTagDialog } from '@/hooks/dialog/useTagDialog'
import { faClone, faCodeBranch, faRotateLeft, faTag } from '@fortawesome/free-solid-svg-icons'
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
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

        {!commit.isUncommitted && (
          <ContextMenuContent>
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
              <FontAwesomeIcon icon={faClone} className="size-3" />
              Cherry Pick
            </ContextMenuItem>

            <ContextMenuItem onClick={revertDialog.openDialog} variant="destructive">
              <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
              Revert
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      {tagDialog.DialogComponent}
      {branchDialog.DialogComponent}
      {cherryPickDialog.DialogComponent}
      {revertDialog.DialogComponent}
    </>
  )

  return { ContextMenuWrapper }
}
