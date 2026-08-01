import { cn } from '@/util/cn'
import { DragAction } from '@/util/dragAndDrop'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

interface Props {
  action: DragAction
  hovered: boolean
  /** Position in its stack, so only the outer corners of the group are rounded. */
  isFirst: boolean
  isLast: boolean
}

/**
 * One box in a drag stack: just the icon and the verb. What the action would do —
 * and why it cannot, when it is refused — is said once, in the label under the dragged item,
 * rather than repeated on every box.
 */
export const DragActionBox: FC<Props> = ({ action, hovered, isFirst, isLast }) => {
  const disabled = !!action.disabledReason

  return (
    <div
      data-drag-action={action.id}
      data-drag-action-disabled={disabled}
      className={cn(
        // Layout & sizing
        'pointer-events-auto flex w-56 items-center gap-2 px-3 py-3',
        // The stack reads as one block, so only its outer corners are rounded and neighbours
        // share a single edge rather than stacking two borders against each other.
        isFirst && 'rounded-t-main-outer',
        isLast && 'rounded-b-main-outer',
        !isFirst && 'border-t-0',
        // Colors — the same surface the context menus use
        'border-vsc-editor-fg/15 bg-vsc-editor-bg/80 text-vsc-editor-fg border backdrop-blur-md',
        // State — highlight is background only, exactly as menu items do it, so the border
        // never changes and nothing inside can shift. Disabled fades the contents rather than
        // the box, so the surface never thins and lets the graph through.
        hovered && !disabled && 'bg-vsc-editor-fg/8',
        // Destructive keeps its accent when disabled; the shared opacity is what softens it
        action.destructive && 'text-vsc-error-fg',
        action.destructive && hovered && !disabled && 'bg-vsc-error-fg/10',
        disabled && '[&>*]:opacity-50',
      )}
    >
      <FontAwesomeIcon icon={action.icon} className="size-3 shrink-0" />

      <span className="text-xs leading-tight font-bold tracking-wide uppercase">{action.verb}</span>
    </div>
  )
}
