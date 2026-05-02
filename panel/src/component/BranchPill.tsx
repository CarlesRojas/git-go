import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useLocalBranchContextMenu } from '@/hook/contextMenu/useLocalBranchContextMenu'
import { useRemoteBranchContextMenu } from '@/hook/contextMenu/useRemoteBranchContextMenu'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch, useCurrentBranch } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FC, ReactNode } from 'react'

interface Props {
  branch: GroupedBranch
  baseName: string
  layout: CommitLayout
  hasLocalBranch: boolean
}

const BranchPill: FC<Props> = ({ branch, baseName, layout, hasLocalBranch }) => {
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

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0
  const isCurrent = !!local && currentBranch === local.cleanName

  const handleLocalDoubleClick = useDoubleClick(() => {
    if (!local || isCurrent) return

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
    checkoutDialog.openDialog()
  })

  const ContextMenuToUse: FC<{ children: ReactNode }> = ({ children }) => {
    if (onlyRemote) return remoteBranchContextMenuWrapper(children, true, remotes[0]!)
    return localBranchContextMenuWrapper(children)
  }

  return (
    <>
      <button
        className={cn(
          // Layout & sizing
          'bg-vsc-editor-bg rounded-main relative flex h-5 max-h-5 min-h-5 min-w-fit cursor-pointer items-center overflow-hidden',
          // Interactions
          onlyRemote && 'border-vsc-editor-fg/30 border',
          isCurrent && 'border',
          (onlyLocal || onlyRemote) && 'group/branch',
        )}
        style={{
          borderColor: isCurrent
            ? getColor(layout.colorIndex, settings.theme, settings.customColors, false)
            : undefined,
        }}
        onClick={onlyLocal ? handleLocalDoubleClick : onlyRemote ? handleRemoteDoubleClick : undefined}
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
                  ? getColor(layout.colorIndex, settings.theme, settings.customColors, false)
                  : undefined,
                borderColor: getColor(layout.colorIndex, settings.theme, settings.customColors, false),
              }}
              onClick={localAndRemote ? handleLocalDoubleClick : undefined}
            >
              {getBranchIcons({
                isLocal: !!local,
                hasRemote: !local && !!remotes.length,
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
                  ? getColor(layout.colorIndex, settings.theme, settings.customColors, false)
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
      {localDialogs}
      {remoteDialogs.checkoutDialog.DialogComponent}
      {remoteDialogs.mergeDialog.DialogComponent}
      {remoteDialogs.fetchIntoLocalDialog.DialogComponent}
      {remoteDialogs.deleteDialog.DialogComponent}
    </>
  )
}

export default BranchPill
