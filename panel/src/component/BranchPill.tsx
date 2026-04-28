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

  const handleLocalDoubleClick = useDoubleClick(() => {
    if (!local) return

    checkoutLocalMutation.mutate(
      { branchName: local.name },
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

  const onlyLocal = !!local && remotes.length === 0
  const onlyRemote = !local && remotes.length > 0
  const localAndRemote = !!local && remotes.length > 0

  return (
    <>
      <button
        className={cn(
          // Layout & sizing
          'relative flex h-5 max-h-5 min-h-5 min-w-fit items-center',
          // Colors
          !local && 'border-vsc-editor-fg/15 border',
          // Interactions
          (onlyLocal || onlyRemote) && 'group/branch cursor-pointer',
        )}
        onClick={onlyLocal ? handleLocalDoubleClick : onlyRemote ? handleRemoteDoubleClick : undefined}
      >
        <div
          className={cn(
            // Layout & sizing
            'flex h-full min-w-fit items-center',
            // Spacing
            'px-1',
          )}
          style={{
            backgroundColor: local ? getColor(layout.colorIndex, false) : undefined,
          }}
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
            'border-vsc-editor-fg/15',
            !!local && 'border-l-none border',
            !local && 'border-l',
          )}
          style={{
            borderColor: !!local && layout.isHead ? getColor(layout.colorIndex, false) : undefined,
          }}
        >
          <div
            className={cn(
              // Layout & sizing
              'flex h-full w-fit min-w-fit items-center px-1.5',
              // Colors
              'bg-vsc-editor-fg/15',
            )}
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
                  'border-vsc-editor-fg/15 flex h-full w-fit min-w-fit items-center border-l px-1.5',
                  // Colors
                  'bg-vsc-editor-fg/15',
                )}
              >
                <span className="line-clamp-1 leading-tight text-nowrap opacity-60">{remote}</span>
              </div>
            ))}
        </div>
      </button>

      {checkoutDialog.DialogComponent}
    </>
  )
}

export default BranchPill
