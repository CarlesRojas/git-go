import { cn } from '@/util/cn'
import { IS_MAC } from '@/util/platform'
import { FC } from 'react'

/**
 * A mouse with its left button filled in. Drawn here rather than taken from the icon set: every
 * mouse in Font Awesome's free solid family is a single filled silhouette, so there is no button
 * to pick out.
 */
const LeftClickIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
    {/* The button being pressed, so the glyph names one rather than just saying "mouse". Inset
        from the shell: flush against it the two merge into a blob at this size, and the gap it
        leaves draws the button split without needing divider strokes of its own. */}
    <path d="M7.5 3A3 3 0 0 0 5 6v1h2.5Z" fill="currentColor" />

    <rect x="3.5" y="1.5" width="9" height="13" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
)

/**
 * How each part of a shortcut is printed. Anything absent is printed as written, so a plain
 * letter or a named key needs no entry.
 */
const GLYPHS: Record<string, string> = {
  // The one that follows the platform, which is what most shortcuts want
  mod: IS_MAC ? '⌘' : 'Ctrl',
  cmd: '⌘',
  ctrl: IS_MAC ? '⌃' : 'Ctrl',
  alt: IS_MAC ? '⌥' : 'Alt',
  shift: '⇧',
  enter: '↵',
  esc: 'Esc',
  escape: 'Esc',
  tab: '⇥',
  space: '␣',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
}

/** The parts that are drawn rather than spelled. */
const ICONS: Record<string, FC<{ className?: string }>> = {
  click: LeftClickIcon,
}

/** How a part reads aloud, for the label screen readers get instead of the glyphs. */
const spoken = (part: string) => (part.toLowerCase() === 'mod' ? (IS_MAC ? 'Command' : 'Control') : part)

interface ShortcutProps {
  /** The parts, separated by `+` — `Mod+Click`, `Shift+Enter`, `Mod+F` */
  keys: string
  className?: string
}

/**
 * A shortcut as a row of key caps. Deliberately render-only: it knows how to print a shortcut,
 * not how to listen for one, so nothing has to be registered to show a hint.
 */
export const Shortcut: FC<ShortcutProps> = ({ keys, className }) => {
  const parts = keys
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)

  return (
    <span
      className={cn('flex items-center gap-0.5', className)}
      aria-label={parts.map(spoken).join(' + ')}
      title={parts.map(spoken).join(' + ')}
    >
      {parts.map((part, index) => {
        const token = part.toLowerCase()
        const Icon = ICONS[token]

        return (
          <kbd
            key={`${token}-${index}`}
            aria-hidden="true"
            className={cn(
              // Layout & sizing — square for a single glyph, stretching only for a spelled-out key
              'flex h-5 min-w-5 items-center justify-center px-1',
              // Appearance
              'rounded-small border-vsc-editor-fg/25 border',
              // Typography
              'font-inherit text-[0.7rem] leading-none font-medium tracking-normal',
            )}
          >
            {/* Held back a little: a drawn glyph carries more ink than a typeface's, so at equal
                colour it reads as the heavier of the two beside a ⌘ or a ⇧ */}
            {Icon ? (
              <Icon className="size-4 opacity-80" />
            ) : (
              (GLYPHS[token] ?? (part.length === 1 ? part.toUpperCase() : part))
            )}
          </kbd>
        )
      })}
    </span>
  )
}
