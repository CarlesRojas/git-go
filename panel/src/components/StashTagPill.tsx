import { faInbox, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { cn } from '../utils/cn'

interface StashTagPillProps {
  type: 'stash' | 'tag'
  label: string
}

function formatStash(ref: string): string {
  const match = ref.match(/^stash@\{(\d+)\}$/)
  return match ? `Stash ${match[1]}` : ref
}

const StashTagPill: FC<StashTagPillProps> = ({ type, label }) => {
  const icon = type === 'stash' ? faInbox : faTag
  const iconColor = type === 'stash' ? 'text-(--vscode-editor-foreground)/70' : 'text-amber-500'

  return (
    <div
      className={cn(
        // Layout & sizing
        'flex h-4.5 max-h-4.5 min-h-4.5 min-w-fit items-center rounded-sm',
        // Spacing
        'gap-1.5 px-1.5',
        // Typography
        'text-xs font-medium',
        // Colors
        'border border-(--vscode-editor-foreground)/15 bg-(--vscode-editor-foreground)/15 text-(--vscode-editor-foreground)',
      )}
    >
      <FontAwesomeIcon icon={icon} className={cn('size-3', iconColor)} />
      <span className="line-clamp-1 leading-tight text-nowrap">{type === 'stash' ? formatStash(label) : label}</span>
    </div>
  )
}

export default StashTagPill
