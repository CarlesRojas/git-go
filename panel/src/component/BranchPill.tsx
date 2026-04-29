import { useToast } from '@/context/ToastContext'
import { useLocalBranchContextMenu } from '@/hook/contextMenu/useLocalBranchContextMenu'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch, useCurrentBranch } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FC } from 'react'

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

  const { ContextMenuWrapper: LocalBranchContextMenu, dialogs } = useLocalBranchContextMenu({
    branch: branch.local ?? undefined,
  })

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

  return (
    <>
      <button
        className={cn(
          // Layout & sizing
          'bg-vsc-editor-bg relative flex h-5 max-h-5 min-h-5 min-w-fit cursor-pointer items-center',
          // Interactions
          onlyRemote && 'border-vsc-editor-fg/30 border',
          isCurrent && 'border',
          (onlyLocal || onlyRemote) && 'group/branch',
        )}
        style={{ borderColor: isCurrent ? getColor(layout.colorIndex, false) : undefined }}
        onClick={onlyLocal ? handleLocalDoubleClick : onlyRemote ? handleRemoteDoubleClick : undefined}
      >
        {!onlyRemote && (
          <LocalBranchContextMenu>
            <div
              className={cn(
                // Layout & sizing
                'peer/icon flex h-full min-w-fit items-center',
                // Spacing
                'px-1',
                // Color
                'bg-vsc-editor-fg/10',
                !!local && !isCurrent && 'border-y border-l',
              )}
              style={{
                backgroundColor: local ? getColor(layout.colorIndex, false) : undefined,
                borderColor: getColor(layout.colorIndex, false),
              }}
              onClick={localAndRemote ? handleLocalDoubleClick : undefined}
            >
              {getBranchIcons({
                isLocal: !!local,
                hasRemote: !local && !!remotes.length,
                black: !!local,
                white: !local,
              })}
            </div>
          </LocalBranchContextMenu>
        )}

        <LocalBranchContextMenu enabled={!onlyRemote}>
          <div
            className={cn(
              // Layout & sizing
              'flex h-full w-fit min-w-fit items-center px-1.5',
              // Color
              'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20',
              localAndRemote && !isCurrent && 'border-vsc-editor-fg/20 border-y border-r',
              onlyLocal && !isCurrent && 'border-vsc-editor-fg/20 border-y border-r',
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

            <span className="line-clamp-1 text-xs leading-tight font-medium text-nowrap">
              {local?.cleanName ?? remotes.find(({ cleanName }) => !!cleanName)?.cleanName ?? baseName}
            </span>
          </div>
        </LocalBranchContextMenu>

        {remotes
          .map(({ remoteName }) => remoteName)
          .filter(Boolean)
          .map((remote, i) => (
            <div
              key={`remote-${i}-${remote}`}
              className={cn(
                'flex h-full w-fit min-w-fit items-center px-1.5',
                // Colors
                'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20',
                onlyRemote && 'border-vsc-editor-fg/20 border-l',
                localAndRemote && !isCurrent && 'border-vsc-editor-fg/20 border-y border-r',
                localAndRemote && isCurrent && 'border-vsc-editor-fg/20 border-l',
              )}
              onClick={localAndRemote ? handleRemoteDoubleClick : undefined}
            >
              <span className="line-clamp-1 text-xs leading-tight font-normal text-nowrap opacity-50">{remote}</span>
            </div>
          ))}
      </button>

      {checkoutDialog.DialogComponent}
      {dialogs}
    </>
  )
}

export default BranchPill
