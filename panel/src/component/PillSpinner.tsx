import { cn } from '@/util/cn'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

/**
 * The loading indicator a pill overlays on its icon or label while an action targets it.
 * Slightly smaller than the pill's own icons so it reads as a state, not a replacement icon.
 * Centered over whatever it covers, which stays in the layout so the pill keeps its size.
 */
export const PillSpinner: FC<{ className?: string }> = ({ className }) => (
  <FontAwesomeIcon
    icon={faCircleNotch}
    className={cn(
      'text-vsc-editor-fg/80 absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 animate-spin',
      className,
    )}
  />
)
