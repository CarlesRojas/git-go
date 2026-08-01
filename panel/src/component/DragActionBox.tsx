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
        'rounded-main pointer-events-auto flex w-56 flex-col justify-center gap-0.5 px-2 py-1.5',
        // Colors
        'bg-vsc-editor-bg border-vsc-editor-fg/20 border',
        // State — the highlight is a ring so it costs no layout and cannot shift the contents
        disabled && 'opacity-50',
        hovered && !disabled && 'ring-vsc-editor-fg ring-2',
        // Destructive keeps its accent when disabled; the shared opacity is what softens it
        action.destructive && 'text-vsc-error-fg border-vsc-error-fg/40',
        action.destructive && hovered && !disabled && 'ring-vsc-error-fg',
      )}
    >
      <div className="flex items-center gap-1.5">
        <FontAwesomeIcon icon={action.icon} className="size-3 shrink-0" />

        <span className="text-xs leading-tight font-bold tracking-wide uppercase">{action.verb}</span>

        {action.isDefault && !disabled && (
          <span className="ml-auto text-[10px] leading-tight font-medium opacity-50">on release</span>
        )}
      </div>

      <span className="line-clamp-1 truncate text-[11px] leading-tight font-medium opacity-70">
        {action.disabledReason ?? action.effect}
      </span>
    </div>
  )
}
