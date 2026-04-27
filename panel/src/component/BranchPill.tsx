import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { GroupedBranch } from '@/util/groupBranches'
import { FC } from 'react'

interface Props {
  branch: GroupedBranch
  baseName: string
  layout: CommitLayout
}

const BranchPill: FC<Props> = ({ branch, baseName, layout }) => {
  const { local, remotes } = branch

  return (
    <div
      className={cn(
        // Layout & sizing
        'relative flex h-5 max-h-5 min-h-5 min-w-fit items-center',
        // Colors
        'bg-(--vscode-editor-foreground)/15',
        !local && 'border border-(--vscode-editor-foreground)/15',
      )}
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
          'border-(--vscode-editor-foreground)/15',
          !!local && 'border-l-none border',
          !local && 'border-l',
        )}
        style={{
          borderColor: !!local && layout.isHead ? getColor(layout.colorIndex, false) : undefined,
        }}
      >
        <div className="flex h-full w-fit min-w-fit items-center px-1.5">
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
              className="flex h-full w-fit min-w-fit items-center border-l border-(--vscode-editor-foreground)/15 px-1.5"
            >
              <span className="line-clamp-1 leading-tight text-nowrap opacity-60">{remote}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default BranchPill
