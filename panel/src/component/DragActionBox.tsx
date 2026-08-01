import { cn } from '@/util/cn'
import { DragAction } from '@/util/dragAndDrop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

interface Props {
  action: DragAction
  hovered: boolean
}

/**
 * One box in a drag stack. Identical anatomy wherever it appears: icon, verb, and a line
 * saying what will happen — replaced by the reason when the action cannot run.
 */
export const DragActionBox: FC<Props> = ({ action, hovered }) => {
  const disabled = !!action.disabledReason

  return (
    <div
      data-drag-action={action.id}
      data-drag-action-disabled={disabled}
      className={cn(
        // Layout & sizing
        'rounded-main-outer pointer-events-auto flex w-56 flex-col justify-center gap-0.5 px-2 py-1.5',
        // Colors — the same surface the context menus use
        'border-vsc-editor-fg/15 bg-vsc-editor-bg/80 text-vsc-editor-fg border backdrop-blur-md',
        // State — highlight is background only, exactly as menu items do it, so the border
        // never changes and nothing inside can shift
        disabled && 'opacity-50',
        hovered && !disabled && 'bg-vsc-editor-fg/15',
        // Destructive keeps its accent when disabled; the shared opacity is what softens it
        action.destructive && 'text-vsc-error-fg',
        action.destructive && hovered && !disabled && 'bg-vsc-error-fg/10',
      )}
    >
      <div className="flex items-center gap-1.5">
        <FontAwesomeIcon icon={action.icon} className="size-3 shrink-0" />

        <span className="text-xs leading-tight font-bold tracking-wide uppercase">{action.verb}</span>
      </div>

      <span className="line-clamp-1 truncate text-[11px] leading-tight font-medium opacity-70">
        {action.disabledReason ?? action.effect}
      </span>
    </div>
  )
}
