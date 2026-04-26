import { faCodeBranch, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { GitBranch } from '../../../src/gitService'
import { cn } from './cn'

interface Props {
  local: GitBranch | null
  remote: GitBranch | null
  isCurrent?: boolean
  black?: boolean
}

export const getBranchIcons = ({ local, remote, isCurrent = false, black = false }: Props) => {
  const icons = []

  if (isCurrent)
    icons.push(
      <FontAwesomeIcon
        key="current"
        icon={faStar}
        className={cn('size-3 text-yellow-500', black && 'text-black/80')}
      />,
    )

  if (local)
    icons.push(
      <FontAwesomeIcon
        key="local"
        icon={faCodeBranch}
        className={cn('size-3 text-(--vscode-editor-foreground)/70', black && 'text-black/80')}
      />,
    )

  if (remote)
    icons.push(
      <svg
        width={12}
        height={12}
        className={cn('block overflow-visible fill-transparent stroke-blue-500', black && 'stroke-black/80')}
      >
        <circle cx={6} cy={6} r={4.5} strokeWidth={1.75} />
      </svg>,
    )

  return <div className="flex items-center gap-1">{icons}</div>
}
