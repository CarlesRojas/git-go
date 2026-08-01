import { useDragActions, useDragState } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useLocalBranchContextMenu } from '@/hook/contextMenu/useLocalBranchContextMenu'
import { useRemoteBranchContextMenu } from '@/hook/contextMenu/useRemoteBranchContextMenu'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useWorktreeOpenDialog } from '@/hook/dialog/useWorktreeOpenDialog'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch, useCurrentBranch } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
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

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0
  // %(HEAD) from git itself is the authoritative per-worktree marker; the name comparison only
  // covers branch data that predates it
  const isCurrent = !!local && (local.current || currentBranch === local.cleanName)

  const { beginPress } = useDragActions()
  const { payload: dragPayload, hoveredTargetKey } = useDragState()

  const isDropTarget = !!dragPayload && !!local
  const isHoveredTarget = isDropTarget && hoveredTargetKey === local.cleanName

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (!settings.dragAndDropEnabled || !local) return
    // Only the local part of a pill is a drag handle — the remote segments are not draggable.
    if ((event.target as HTMLElement).closest('[data-branch-remote-segment]')) return

    beginPress({ kind: 'branch', branch: local, colorIndex: layout.colorIndex }, event)
  }

  const handleLocalDoubleClick = useDoubleClick(() => {
    if (!local || isCurrent) return

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
        data-drop-target={local ? local.cleanName : undefined}
        data-drag-dimmable={onlyRemote ? '' : undefined}
        onPointerDown={handlePointerDown}
        className={cn(
          // Layout & sizing
          'bg-vsc-editor-bg rounded-main relative flex h-5 max-h-5 min-h-5 min-w-fit cursor-pointer items-center overflow-hidden',
          // Interactions
          onlyRemote && 'border-vsc-editor-fg/30 border',
          isCurrent && 'border',
          (onlyLocal || onlyRemote) && 'group/branch',
          // Drag targeting
          isHoveredTarget && 'ring-vsc-editor-fg/70 ring-2',
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
              {getBranchIcons({
                isLocal: !!local,
                hasRemote: !local && !!remotes.length,
                inWorktree: !!local?.worktreePath,
                black: !!local,
                white: !local,
              })}
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
                data-branch-remote-segment
                className={cn(
                  'flex h-full w-fit min-w-fit items-center px-1.5',
                  // Colors
                  'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20',
                  onlyRemote && 'border-vsc-editor-fg/20 border-l',
                  localAndRemote && !isCurrent && 'border-vsc-editor-fg/20 last:rounded-r-main border-y border-r',
                  localAndRemote && isCurrent && 'border-vsc-editor-fg/20 border-l',
                )}
                onClick={localAndRemote ? handleRemoteDoubleClick : undefined}
              >
                <span className="line-clamp-1 text-xs leading-tight font-normal text-nowrap opacity-50">
                  {remote.remoteName}
                </span>
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
