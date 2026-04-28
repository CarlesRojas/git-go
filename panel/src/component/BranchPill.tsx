import { useToast } from '@/context/ToastContext'
import { useCheckoutDialog } from '@/hook/dialog/useCheckoutDialog'
import { useDoubleClick } from '@/hook/useDoubleClick'
import { useCheckoutLocalBranch } from '@/hook/useGitQueries'
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
}

const BranchPill: FC<Props> = ({ branch, baseName, layout }) => {
  const { local, remotes } = branch
  const { showToast } = useToast()

  const checkoutLocalMutation = useCheckoutLocalBranch()
  const checkoutDialog = useCheckoutDialog({ remoteBranch: remotes[0] })

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0

  // TODO this is wrong, we should check what the current branch is, not the head (if there are 2 local branches here, this should them both as selected)
  const isCurrent = layout.isHead && !!local

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

  if (baseName.includes('main')) console.log(layout.row, onlyLocal, onlyRemote, localAndRemote)

  return (
    <>
      <button
        className={cn(
          // Layout & sizing
          'bg-vsc-editor-fg/15 relative flex h-5 max-h-5 min-h-5 min-w-fit cursor-pointer items-center',
          // Interactions
          onlyRemote && 'border-vsc-editor-fg/15 border',
          isCurrent && 'border',
          (onlyLocal || onlyRemote) && 'group/branch',
        )}
        style={{ borderColor: isCurrent ? getColor(layout.colorIndex, false) : undefined }}
        onClick={onlyLocal ? handleLocalDoubleClick : onlyRemote ? handleRemoteDoubleClick : undefined}
      >
        <div
          className={cn(
            // Layout & sizing
            'flex h-full min-w-fit items-center',
            // Spacing
            'px-1',
            onlyRemote && 'pr-0 pl-1',
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

        <div
          className={cn(
            // Layout & sizing
            'relative flex h-full min-w-fit items-center',
            // Typography
            'text-xs font-medium',
            // Border
            onlyLocal && !isCurrent && 'border-vsc-editor-fg/15 border-y border-r',
          )}
        >
          <div
            className={cn(
              // Layout & sizing
              'flex h-full w-fit min-w-fit items-center px-1.5',
              localAndRemote && !isCurrent && 'border-vsc-editor-fg/15 border-y border-r',
            )}
            onClick={localAndRemote ? handleLocalDoubleClick : undefined}
          >
            <span className="line-clamp-1 leading-tight text-nowrap">
              {local?.cleanName ?? remotes.find(({ cleanName }) => !!cleanName)?.cleanName ?? baseName}
            </span>
          </div>

          {remotes
            .map(({ remoteName }) => remoteName)
            .filter(Boolean)
            .map((remote, i) => (
              <div
                key={`remote-${i}-${remote}`}
                className={cn(
                  'flex h-full w-fit min-w-fit items-center px-1.5',
                  // Colors
                  onlyRemote && 'border-vsc-editor-fg/15 border-l',
                  localAndRemote && !isCurrent && 'border-vsc-editor-fg/15 border-y border-r',
                  localAndRemote && isCurrent && 'border-vsc-editor-fg/15 border-l',
                )}
                onClick={localAndRemote ? handleRemoteDoubleClick : undefined}
              >
                <span className="line-clamp-1 leading-tight text-nowrap opacity-50">{remote}</span>
              </div>
            ))}
        </div>
      </button>

      {checkoutDialog.DialogComponent}
    </>
  )
}

export default BranchPill
