import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { useBranchDialog } from '@/hook/dialog/useBranchDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useMergeCommitIntoCurrentBranchDialog } from '@/hook/dialog/useMergeCommitIntoCurrentBranchDialog'
import { useRebaseOntoCommitDialog } from '@/hook/dialog/useRebaseOntoCommitDialog'
import { useResetBranchDialog } from '@/hook/dialog/useResetBranchDialog'
import { useRevertDialog } from '@/hook/dialog/useRevertDialog'
import { useRewordDialog } from '@/hook/dialog/useRewordDialog'
import { useTagDialog } from '@/hook/dialog/useTagDialog'
import { useRewordEligibility } from '@/hook/useRewordEligibility'
import { useCompareEntry } from '@/context/CompareContext'
import { commitSide, COMPARE_CLICK_HINT } from '@/util/compare'
import {
  faCodeBranch,
  faCodeCommit,
  faCodeCompare,
  faCodeMerge,
  faPen,
  faRotateLeft,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { ReactNode, memo } from 'react'

interface UseCommitContextMenuProps {
  commit: GitCommit
}

interface CommitContextMenuWrapperProps {
  children: ReactNode
  enabled: boolean
  /** Whether the commit's message can be rewritten, which shows the edit-message entry */
  canReword: boolean
  /** How the compare entry reads in the current state, or null when it does not apply */
  compareLabel: string | null
  onCompare: () => void
  onBranchClick: () => void
  onTagClick: () => void
  onCherryPickClick: () => void
  onRevertClick: () => void
  onRewordClick: () => void
  onMergeClick: () => void
  onRebaseClick: () => void
  onResetClick: () => void
}

const CommitContextMenuWrapper = memo(
  ({
    children,
    enabled,
    canReword,
    compareLabel,
    onCompare,
    onBranchClick,
    onTagClick,
    onCherryPickClick,
    onRevertClick,
    onRewordClick,
    onMergeClick,
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

          {canReword && (
            <ContextMenuItem onClick={onRewordClick}>
              <FontAwesomeIcon icon={faPen} className="size-3" />
              Edit Commit Message
            </ContextMenuItem>
          )}

          {compareLabel && (
            <ContextMenuItem onClick={onCompare}>
              <FontAwesomeIcon icon={faCodeCompare} className="size-3" />
              {compareLabel}

              {/* Only the commit rows take the modifier-click, so only this menu advertises it */}
              <ContextMenuShortcut className="tracking-normal">{COMPARE_CLICK_HINT}</ContextMenuShortcut>
            </ContextMenuItem>
          )}

          <ContextMenuItem onClick={onRevertClick} variant="destructive">
            <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
            Revert
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuLabel>Current branch actions</ContextMenuLabel>

          <ContextMenuItem onClick={onMergeClick}>
            <FontAwesomeIcon icon={faCodeMerge} className="size-3" />
            Merge into current branch
          </ContextMenuItem>

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
  // The uncommitted row is not a commit, so it has nothing to compare
  const compareEntry = useCompareEntry(commit.isUncommitted ? null : commitSide(commit))

  const tagDialog = useTagDialog({ commit })
  const branchDialog = useBranchDialog({ commit })
  const cherryPickDialog = useCherryPickDialog({ commit })
  const revertDialog = useRevertDialog({ commit })
  const rewordDialog = useRewordDialog({ commit })
  const mergeDialog = useMergeCommitIntoCurrentBranchDialog({ commit })
  const rebaseDialog = useRebaseOntoCommitDialog({ commit })
  const resetDialog = useResetBranchDialog({ commit })
  const rewordEligibility = useRewordEligibility(commit.isStash || commit.isUncommitted ? undefined : commit.hash)

  const commitContextMenuWrapper = (children: ReactNode, enabled: boolean) => (
    <CommitContextMenuWrapper
      enabled={enabled}
      canReword={!!rewordEligibility}
      compareLabel={compareEntry?.label ?? null}
      onCompare={() => compareEntry?.onSelect()}
      onBranchClick={branchDialog.openDialog}
      onTagClick={tagDialog.openDialog}
      onCherryPickClick={cherryPickDialog.openDialog}
      onRevertClick={revertDialog.openDialog}
      onRewordClick={rewordDialog.openDialog}
      onMergeClick={mergeDialog.openDialog}
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
        {rewordDialog.DialogComponent}
        {mergeDialog.DialogComponent}
        {rebaseDialog.DialogComponent}
        {resetDialog.DialogComponent}
      </>
    ),
  }
}
