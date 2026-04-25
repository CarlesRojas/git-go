import { faCloud, faCodeBranch, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { GitBranch } from '../../../src/gitService'

export const getBranchIcons = (local: GitBranch | null, remote: GitBranch | null, current: boolean) => {
  const icons = []

  if (current) icons.push(<FontAwesomeIcon key="current" icon={faStar} className="size-3 text-yellow-500" />)

  if (local)
    icons.push(
      <FontAwesomeIcon key="local" icon={faCodeBranch} className="size-3 text-(--vscode-editor-foreground)/60" />,
    )

  if (remote) icons.push(<FontAwesomeIcon key="remote" icon={faCloud} className="size-3 text-blue-500" />)

  return <div className="flex items-center gap-1">{icons}</div>
}
