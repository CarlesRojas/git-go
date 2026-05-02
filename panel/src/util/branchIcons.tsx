import { cn } from '@/util/cn'
import { faCloud, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
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
      <svg
        width={12}
        height={12}
        className={cn(
          'block overflow-visible fill-transparent stroke-yellow-500',
          black && 'stroke-vsc-editor-bg/80',
          white && 'stroke-vsc-editor-fg/80',
        )}
      >
        <circle cx={6} cy={6} r={4.5} strokeWidth={1.75} />
      </svg>,
    )

  if (isLocal)
    icons.push(
      <FontAwesomeIcon
        key="local"
        icon={faCodeBranch}
        className={cn(
          'text-vsc-editor-fg/70 size-3 max-w-3',
          black && 'text-vsc-editor-bg/80',
          white && 'text-vsc-editor-fg/80',
        )}
      />,
    )

  if (hasRemote)
    icons.push(
      <FontAwesomeIcon
        key="remote"
        icon={faCloud}
        className={cn(
          'text-vsc-list-highlight-fg/80 size-3 max-w-3 origin-center scale-105',
          black && 'text-vsc-editor-bg/80',
          white && 'text-vsc-editor-fg/80',
        )}
      />,
    )

  return <div className="flex items-center gap-1">{icons}</div>
}
