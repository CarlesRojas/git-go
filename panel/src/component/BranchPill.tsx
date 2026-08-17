import { useDragActions, useDragState } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useLocalBranchContextMenu } from '@/hook/contextMenu/useLocalBranchContextMenu'
import { useRemoteBranchContextMenu } from '@/hook/contextMenu/useRemoteBranchContextMenu'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { PillSpinner } from '@/component/PillSpinner'
import { useDragHoverScale } from '@/hook/useDragHoverScale'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch, useCurrentBranch } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import {
  isBranchNameLoading,
  isLocalBranchLoading,
  isRemoteBranchLoading,
  usePendingPillMutations,
} from '@/hook/usePillLoading'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { GitBranch } from '@git/gitService'
import { FC, PointerEvent as ReactPointerEvent, ReactNode } from 'react'

interface Props {
  branch: GroupedBranch
  baseName: string
  layout: CommitLayout
  hasLocalBranch: boolean
  localBranchOnDifferentCommit: boolean
}

const BranchPill: FC<Props> = ({ branch, baseName, layout, hasLocalBranch, localBranchOnDifferentCommit }) => {
  const { local, remotes } = branch
  const { showToast } = useToast()
  const { data: currentBranch } = useCurrentBranch()
  const { settings } = useSettings()

  const { localBranchContextMenuWrapper, dialogs: localDialogs } = useLocalBranchContextMenu({
    branch: branch.local ?? undefined,
  })

  const { remoteBranchContextMenuWrapper, dialogs: remoteDialogs } = useRemoteBranchContextMenu()

  const checkoutLocalMutation = useCheckoutLocalBranch()
  const checkoutDialog = useCheckoutDialog({ remoteBranch: remotes[0], hasLocalBranch })
  const worktreeOpenDialog = useWorktreeOpenDialog()

  const pendingPillMutations = usePendingPillMutations()

  const isLocalLoading = !!local && isLocalBranchLoading(pendingPillMutations, local)
  const isLoadingRemote = (remote: GitBranch) => isRemoteBranchLoading(pendingPillMutations, remote)
  const isAnyRemoteLoading = remotes.some(remote => isLoadingRemote(remote))

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0

  // With no local segment, actions addressing the branch by name — merging a remote branch
  // into current, say — can only mean this pill, so its icon covers those too.
  const isRemotePillLoading =
    isAnyRemoteLoading ||
    (onlyRemote && remotes.some(remote => isBranchNameLoading(pendingPillMutations, remote.cleanName)))
  // %(HEAD) from git itself is the authoritative per-worktree marker; the name comparison only
  // covers branch data that predates it
  const isCurrent = !!local && (local.current || currentBranch === local.cleanName)

  const { beginPress } = useDragActions()
  const { payload: dragPayload, hoveredTargetKey, pointerOverSource } = useDragState()

  // A remote-only pill is targeted as its first remote branch — dropping there checks out the
  // remote branch (as its local counterpart) before the action runs.
  const dropTargetBranch = local ?? remotes[0] ?? null
  const isDropTarget = !!dragPayload && !!dropTargetBranch
  // The pill being dragged is hoverable too — returning to it reveals its own actions — so it
  // reacts exactly like any other target rather than being singled out.
  // A remote branch shares its clean name with the local one, so pills match on the full ref name.
  const isDraggedPill =
    dragPayload?.kind === 'branch' && [local, ...remotes].some(candidate => candidate?.name === dragPayload.branch.name)
  const isHoveredTarget =
    (isDropTarget && hoveredTargetKey === dropTargetBranch?.name) || (isDraggedPill && pointerOverSource)

  const {
    ref: pillRef,
    scale: hoverScale,
    unclipped: unclipRow,
  } = useDragHoverScale<HTMLButtonElement>(isHoveredTarget)

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (!settings.dragAndDropEnabled) return

    // Each half of a pill drags what it depicts: the remote segment carries its own branch,
    // which offers fetch and delete rather than push.
    const segment = (event.target as HTMLElement).closest<HTMLElement>('[data-branch-remote-segment]')
    const remoteIndex = segment ? Number(segment.getAttribute('data-branch-remote-segment')) : -1
    const dragged = remoteIndex >= 0 ? remotes[remoteIndex] : (local ?? remotes[0])
    if (!dragged) return

    beginPress({ kind: 'branch', branch: dragged, colorIndex: layout.colorIndex }, event)
  }

  const handleLocalDoubleClick = useDoubleClick(() => {
    if (!local || isCurrent || isLocalLoading) return

    if (local.worktreePath) {
      worktreeOpenDialog.openDialog({ worktreePath: local.worktreePath, branchName: local.cleanName })
      return
    }

    checkoutLocalMutation.mutate(
      { branchName: local.cleanName },
      {
        onSuccess: () => {
          showToast({
            text: `Checked out branch '${local.cleanName}' successfully`,
            icon: faCodeBranch,
            type: 'success',
          })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faCodeBranch })
        },
      },
    )
  })

  const handleRemoteDoubleClick = useDoubleClick(() => {
    if (isRemotePillLoading) return

    const remoteBranch = remotes[0]
    if (localBranchOnDifferentCommit && remoteBranch) {
      remoteDialogs.fetchIntoLocalDialog.openDialog(remoteBranch)
      return
    }

    checkoutDialog.openDialog()
  })

  const ContextMenuToUse: FC<{ children: ReactNode }> = ({ children }) => {
    if (onlyRemote) return remoteBranchContextMenuWrapper(children, true, remotes[0]!)
    return localBranchContextMenuWrapper(children)
  }

  return (
    <>
      <button
        ref={pillRef}
        data-drop-target={dropTargetBranch ? dropTargetBranch.name : undefined}
        data-drag-hovered={unclipRow ? '' : undefined}
        onPointerDown={handlePointerDown}
        className={cn(
          // Layout & sizing
          'bg-vsc-editor-bg rounded-main relative flex h-5 max-h-5 min-h-5 min-w-fit cursor-pointer items-center overflow-hidden',
          // Interactions
          onlyRemote && 'border-vsc-editor-fg/30 border',
          isCurrent && 'border',
          (onlyLocal || onlyRemote) && 'group/branch',
          // Drag targeting — scale rather than an outline, matching the graph's own highlight
          // Grows rightwards from the edge its actions line up with, so they stay aligned.
          !!dragPayload && 'transition-transform duration-100',
          'origin-left',
          isHoveredTarget && 'z-10',
        )}
        style={{
          borderColor: isCurrent
            ? getColor({
                index: layout.colorIndex,
                isDark: settings.isDark,
                theme: settings.theme,
                customColors: settings.customColors,
              })
            : undefined,
          transform: isHoveredTarget ? `scale(${hoverScale})` : undefined,
        }}
        onClick={onlyLocal ? handleLocalDoubleClick : onlyRemote ? handleRemoteDoubleClick : undefined}
        title={local?.worktreePath ? `Checked out in worktree ${local.worktreePath}` : undefined}
      >
        {!onlyRemote &&
          localBranchContextMenuWrapper(
            <div
              className={cn(
                // Layout & sizing
                'peer/icon flex h-full min-w-fit items-center',
                // Spacing
                'px-1',
                // Color
                'bg-vsc-editor-fg/10',
                !!local && !isCurrent && 'rounded-l-main border-y border-l',
              )}
              style={{
                backgroundColor: local
                  ? getColor({
                      index: layout.colorIndex,
                      theme: settings.theme,
                      isDark: settings.isDark,
                      customColors: settings.customColors,
                    })
                  : undefined,
                borderColor: getColor({
                  index: layout.colorIndex,
                  theme: settings.theme,
                  isDark: settings.isDark,
                  customColors: settings.customColors,
                }),
              }}
              onClick={localAndRemote ? handleLocalDoubleClick : undefined}
            >
              <span className={cn('relative flex items-center', isLocalLoading && '[&>div]:invisible')}>
                {getBranchIcons({
                  isLocal: !!local,
                  hasRemote: !local && !!remotes.length,
                  inWorktree: !!local?.worktreePath,
                  black: !!local,
                  white: !local,
                })}

                {isLocalLoading && <PillSpinner className={cn(local && 'text-vsc-editor-bg/80')} />}
              </span>
            </div>,
          )}

        <ContextMenuToUse>
          <div
            className={cn(
              // Layout & sizing
              'flex h-full w-fit min-w-fit items-center px-1.5',
              // Color
              'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20',
              localAndRemote && !isCurrent && 'border-vsc-editor-fg/20 border-y border-r',
              onlyLocal && !isCurrent && 'border-vsc-editor-fg/20 rounded-r-main border-y border-r',
              onlyRemote && 'gap-1.5 pl-1',
              !onlyRemote && 'peer-hover/icon:bg-vsc-editor-fg/20',
            )}
            onClick={localAndRemote ? handleLocalDoubleClick : undefined}
          >
            {onlyRemote && (
              <span className={cn('relative flex items-center', isRemotePillLoading && '[&>div]:invisible')}>
                {getBranchIcons({
                  isLocal: !!local,
                  hasRemote: !local && !!remotes.length,
                  black: !!local,
                  white: !local,
                })}

                {isRemotePillLoading && <PillSpinner />}
              </span>
            )}

            <span
              className={cn('line-clamp-1 text-xs leading-tight font-medium text-nowrap', isCurrent && 'font-bold')}
              style={{
                color: isCurrent
                  ? getColor({
                      index: layout.colorIndex,
                      theme: settings.theme,
                      isDark: settings.isDark,
                      customColors: settings.customColors,
                    })
                  : undefined,
              }}
            >
              {local?.cleanName ?? remotes.find(({ cleanName }) => !!cleanName)?.cleanName ?? baseName}
            </span>
          </div>
        </ContextMenuToUse>

        {remotes
          .filter(({ remoteName }) => !!remoteName)
          .map((remote, i) =>
            remoteBranchContextMenuWrapper(
              <div
                key={`remote-${i}-${remote.remoteName}`}
                data-branch-remote-segment={i}
                className={cn(
                  'relative flex h-full w-fit min-w-fit items-center px-1.5',
                  // Colors
                  'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20',
                  onlyRemote && 'border-vsc-editor-fg/20 border-l',
                  localAndRemote && !isCurrent && 'border-vsc-editor-fg/20 last:rounded-r-main border-y border-r',
                  localAndRemote && isCurrent && 'border-vsc-editor-fg/20 border-l',
                )}
                onClick={localAndRemote ? handleRemoteDoubleClick : undefined}
              >
                <span
                  className={cn(
                    'line-clamp-1 text-xs leading-tight font-normal text-nowrap opacity-50',
                    !onlyRemote && isLoadingRemote(remote) && 'invisible',
                  )}
                >
                  {remote.remoteName}
                </span>

                {!onlyRemote && isLoadingRemote(remote) && <PillSpinner />}
              </div>,
              true,
              remote,
            ),
          )}
      </button>

      {checkoutDialog.DialogComponent}
      {worktreeOpenDialog.DialogComponent}
      {localDialogs}
      {remoteDialogs.checkoutDialog.DialogComponent}
      {remoteDialogs.mergeDialog.DialogComponent}
      {remoteDialogs.fetchIntoLocalDialog.DialogComponent}
      {remoteDialogs.deleteDialog.DialogComponent}
    </>
  )
}

export default BranchPill
