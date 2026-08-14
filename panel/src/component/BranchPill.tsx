import { useDragActions, useDragState } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useLocalBranchContextMenu } from '@/hook/contextMenu/useLocalBranchContextMenu'
import { useRemoteBranchContextMenu } from '@/hook/contextMenu/useRemoteBranchContextMenu'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { useDragHoverScale } from '@/hook/useDragHoverScale'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch, useCurrentBranch } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { faCircleNotch, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitBranch } from '@git/gitService'
import { useMutationState } from '@tanstack/react-query'
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

  const pendingLocalCheckouts = useMutationState({
    filters: { mutationKey: ['checkoutLocalBranch'], status: 'pending' },
    select: mutation => (mutation.state.variables as { branchName: string }).branchName,
  })

  const pendingRemoteFetches = useMutationState({
    filters: { mutationKey: ['fetchIntoLocalBranch'], status: 'pending' },
    select: mutation => mutation.state.variables as { remote: string; remoteBranch: string },
  })

  const pendingRemoteCheckouts = useMutationState({
    filters: { mutationKey: ['checkoutRemoteBranch'], status: 'pending' },
    select: mutation => (mutation.state.variables as { remoteBranchName: string }).remoteBranchName,
  })

  const isCheckingOutLocal = !!local && pendingLocalCheckouts.includes(local.cleanName)

  const isLoadingRemote = (remote: GitBranch) =>
    pendingRemoteFetches.some(
      pending => pending.remote === remote.remoteName && pending.remoteBranch === remote.cleanName,
    ) ||
    pendingRemoteCheckouts.some(
      remoteBranchName =>
        remoteBranchName === remote.name || remoteBranchName === `${remote.remoteName}/${remote.cleanName}`,
    )

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0
  // %(HEAD) from git itself is the authoritative per-worktree marker; the name comparison only
  // covers branch data that predates it
  const isCurrent = !!local && (local.current || currentBranch === local.cleanName)

  const { beginPress } = useDragActions()
  const { payload: dragPayload, hoveredTargetKey, pointerOverSource } = useDragState()

  const isDropTarget = !!dragPayload && !!local
  // The pill being dragged is hoverable too — returning to it reveals its own actions — so it
  // reacts exactly like any other target rather than being singled out.
  // A remote branch shares its name with the local one, so the kind of ref has to match too.
  const isDraggedPill =
    !!local &&
    dragPayload?.kind === 'branch' &&
    !dragPayload.branch.remote &&
    dragPayload.branch.cleanName === local.cleanName
  const isHoveredTarget = (isDropTarget && hoveredTargetKey === local.cleanName) || (isDraggedPill && pointerOverSource)

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
    if (!local || isCurrent || isCheckingOutLocal) return

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
        data-drop-target={local ? local.cleanName : undefined}
        data-drag-dimmable={onlyRemote ? '' : undefined}
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
              <span className={cn('relative flex items-center', isCheckingOutLocal && '[&>div]:invisible')}>
                {getBranchIcons({
                  isLocal: !!local,
                  hasRemote: !local && !!remotes.length,
                  inWorktree: !!local?.worktreePath,
                  black: !!local,
                  white: !local,
                })}

                {isCheckingOutLocal && (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className={cn(
                      'absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 animate-spin',
                      local ? 'text-vsc-editor-bg/80' : 'text-vsc-editor-fg/80',
                    )}
                  />
                )}
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
            {onlyRemote &&
              getBranchIcons({
                isLocal: !!local,
                hasRemote: !local && !!remotes.length,
                black: !!local,
                white: !local,
              })}

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
                    isLoadingRemote(remote) && 'invisible',
                  )}
                >
                  {remote.remoteName}
                </span>

                {isLoadingRemote(remote) && (
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="text-vsc-editor-fg/80 absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 animate-spin"
                  />
                )}
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
