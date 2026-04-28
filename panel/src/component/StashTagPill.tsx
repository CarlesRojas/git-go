import { cn } from '@/util/cn'
import { faInbox, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

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
  const iconColor = type === 'stash' ? 'text-vsc-editor-fg/80' : 'text-amber-500'

  return (
    <div
      className={cn(
        // Layout & sizing
        'h-5 max-h-5 min-h-5 min-w-fit',
        // Colors
        'bg-vsc-editor-bg',
      )}
    >
      <div
        className={cn(
          // Layout & sizing
          'flex h-5 max-h-5 min-h-5 min-w-fit items-center',
          // Spacing
          'gap-1.5 px-1',
          // Colors
          'border-vsc-editor-fg/20 bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20 text-vsc-editor-fg border',
        )}
      >
        <FontAwesomeIcon icon={icon} className={cn('size-3', iconColor)} />
        <span className="line-clamp-1 text-xs leading-tight font-medium text-nowrap">
          {type === 'stash' ? formatStash(label) : label}
        </span>
      </div>
    </div>
  )
}

export default StashTagPill
