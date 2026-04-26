import { faCodeBranch, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from './cn'

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
          black && 'text-(--vscode-editor-background)/80',
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
          'size-3 text-(--vscode-editor-foreground)/70',
          black && 'text-(--vscode-editor-background)/80',
          white && 'text-(--vscode-editor-foreground)/80',
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
          black && 'stroke-(--vscode-editor-background)/80',
          white && 'stroke-(--vscode-editor-foreground)/80',
        )}
      >
        <circle cx={6} cy={6} r={4.5} strokeWidth={1.75} />
      </svg>,
    )

  return <div className="flex items-center gap-1">{icons}</div>
}
