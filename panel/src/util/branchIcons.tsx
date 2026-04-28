import { cn } from '@/util/cn'
import { faCodeBranch, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
  isLocal?: boolean
  hasRemote?: boolean
  isCurrent?: boolean
  black?: boolean
  white?: boolean
}

export const getBranchIcons = ({
  isLocal = false,
  hasRemote = false,
  isCurrent = false,
  black = false,
  white = false,
}: Props) => {
  const icons = []

  if (isCurrent)
    icons.push(
      <FontAwesomeIcon
        key="current"
        icon={faStar}
        className={cn(
          'size-3 text-yellow-500',
          black && 'text-vsc-editor-bg/80',
          white && 'text-(--vscode-editor-foreground)/80',
        )}
      />,
    )

  if (isLocal)
    icons.push(
      <FontAwesomeIcon
        key="local"
        icon={faCodeBranch}
        className={cn(
          'text-vsc-editor-fg/70 size-3',
          black && 'text-vsc-editor-bg/80',
          white && 'text-vsc-editor-fg/80',
        )}
      />,
    )

  if (hasRemote)
    icons.push(
      <svg
        width={12}
        height={12}
        className={cn(
          'block overflow-visible fill-transparent stroke-blue-500',
          black && 'stroke-vsc-editor-bg/80',
          white && 'stroke-vsc-editor-fg/80',
        )}
      >
        <circle cx={6} cy={6} r={4.5} strokeWidth={1.75} />
      </svg>,
    )

  return <div className="flex items-center gap-1">{icons}</div>
}
