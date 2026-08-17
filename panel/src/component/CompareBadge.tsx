import { cn } from '@/util/cn'
import { faCodeCompare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

/**
 * Which end of a comparison something is, shown both on the graph rows and beside the two labels
 * in the panel so the pairing is never ambiguous. A and B rather than 1 and 2 because that is what
 * git itself calls the two sides of a diff (`a/file` and `b/file` in its output). Carries the same
 * icon the compare entries in the context menus do, so the marker names what put it there.
 */
export const CompareBadge: FC<{ role: 'from' | 'to'; className?: string }> = ({ role, className }) => (
  <span
    className={cn(
      // Layout & sizing — shaped like the branch pills it sits beside
      'rounded-main flex h-5 max-h-5 min-h-5 w-fit shrink-0 items-center gap-1 px-1.5',
      // Appearance
      'border-vsc-list-highlight-fg/40 text-vsc-list-highlight-fg border',
      // Typography
      'text-[0.65rem] leading-none font-bold',
      className,
    )}
    title={role === 'from' ? 'The commit being compared from' : 'The commit being compared to'}
  >
    <FontAwesomeIcon icon={faCodeCompare} className="size-2.5 shrink-0" />

    {/* A capital has no descender, so the line box seats it fractionally high — nudged back down */}
    <span className="translate-y-[0.5px]">{role === 'from' ? 'A' : 'B'}</span>
  </span>
)
