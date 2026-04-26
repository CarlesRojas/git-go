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
  const { local, remote } = branch

  return (
    <div
      className={cn(
        // Layout & sizing
        'relative flex h-4.5 max-h-4.5 min-h-4.5 min-w-fit items-center rounded-sm',
        // Colors
        'bg-(--vscode-editor-foreground)/15',
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
          backgroundColor: getColor(layout.colorIndex, false),
        }}
      >
        {getBranchIcons({ local, remote, black: true })}
      </div>

      <div
        className={cn(
          // Layout & sizing
          'flex h-full min-w-fit items-center rounded-r-sm',
          // Spacing
          'px-1.5',
          // Typography
          'text-xs font-medium',
          // Typography
          'border-l-none border border-(--vscode-editor-foreground)/15',
        )}
        style={{
          borderColor: !!local && layout.isHead ? getColor(layout.colorIndex, false) : undefined,
        }}
      >
        <span>{local?.name ?? remote?.name ?? baseName}</span>
      </div>
    </div>
  )
}

export default BranchPill
