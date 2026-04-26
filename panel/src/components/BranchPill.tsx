import { getColor } from '../hooks/useGitTree'
import { getBranchIcons } from '../utils/branchIcons'
import { cn } from '../utils/cn'
import { CommitLayout } from '../utils/GraphLayoutGenerator'
import { GroupedBranch } from '../utils/groupBranches'

interface Props {
  branch: GroupedBranch
  baseName: string
  layout: CommitLayout
}

const BranchPill: React.FC<Props> = ({ branch, baseName, layout }) => {
  const { local, remotes } = branch

  return (
    <div
      className={cn(
        // Layout & sizing
        'relative flex h-4.5 max-h-4.5 min-h-4.5 min-w-fit items-center rounded-sm',
        // Colors
        'bg-(--vscode-editor-foreground)/15',
        !local && 'border border-(--vscode-editor-foreground)/15',
      )}
    >
      <div
        className={cn(
          // Layout & sizing
          'flex h-full min-w-fit items-center rounded-l-sm',
          // Spacing
          'pr-0.75 pl-1',
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
          'relative flex h-full min-w-fit items-center rounded-r-sm',
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
          <span className={cn('leading-tight')}>
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
              <span className="leading-tight opacity-60">{remote}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default BranchPill
