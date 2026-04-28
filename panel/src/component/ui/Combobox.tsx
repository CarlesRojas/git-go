import { Input } from '@/component/ui/Input'
import { cn } from '@/util/cn'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { faCheck, faChevronDown, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRef } from 'react'

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        [
          // Group
          'group',
          // Layout & Structure
          'flex h-7 w-64 items-center justify-between gap-2',
          // Spacing
          'px-2.5',
          // Typography
          'text-vsc-input-fg text-xs whitespace-nowrap',
          // Colors & Background
          'bg-vsc-input-fg/5',
          // Borders
          'border border-(--vscode-editor-foreground)/15',
        ],
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-row items-center gap-2">
        <FontAwesomeIcon icon={faCodeBranch} className="text-vsc-editor-fg/70 size-2.5 min-w-2.5" />
        {children}
      </div>

      <FontAwesomeIcon
        className="pointer-events-none size-2.5 min-w-2.5 opacity-50 transition-transform group-data-popup-open:rotate-180"
        icon={faChevronDown}
      />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  onClear,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  onClear?: () => void
}) {
  return (
    <ComboboxPrimitive.Input
      render={<Input disabled={disabled} className="border-vsc-editor-fg/15 border-b! border-none" onClear={onClear} />}
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            [
              // Group State
              'group/combobox-content',
              // Layout & Structure
              'relative overflow-hidden',
              // Sizing
              'max-h-(--available-height) w-[calc(var(--anchor-width)+1px)]',
              'max-w-[calc(var(--anchor-width)+1px)] min-w-[calc(var(--anchor-width)+1px)]',
              // Transform Origin
              'origin-(--transform-origin)',
              // Colors & Background
              'bg-vsc-editor-bg/80 text-vsc-editor-fg backdrop-blur-md',
              'border-vsc-editor-fg/15 border',
              // Animations & Transitions
              'duration-100',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
              'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              // Slide Animations
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
              'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
              'data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2',
              // Chips State
              'data-[chips=true]:min-w-(--anchor-width)',
            ],
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        [
          // Scrolling
          'no-scrollbar scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain',
          // Sizing
          'max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))]',
          // Empty State
          'data-empty:p-0',
        ],
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        [
          // Layout & Structure
          'relative flex w-full items-center gap-2',
          // Cursor & Selection
          'cursor-pointer outline-hidden select-none',
          // Spacing
          'py-1 pr-8 pl-1.5',
          // Typography
          'text-xs',
          // Interactive States
          'data-highlighted:bg-vsc-editor-fg/15! data-selected:bg-vsc-editor-fg/7',
          // Disabled States
          'data-disabled:pointer-events-none data-disabled:opacity-50',
          // Icon Styles
          '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        ],
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-3 items-center justify-center">
            <FontAwesomeIcon icon={faCheck} className="text-vsc-editor-fg/70 pointer-events-none size-3" />
          </span>
        }
      />
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        [
          // Spacing
          'px-1.5 py-1',
          // Typography
          'text-vsc-editor-fg/50 text-xs',
        ],
        className,
      )}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        [
          // Layout & Structure
          'hidden w-full',
          // Spacing
          'px-2.5 py-2',
          // Typography
          'text-vsc-editor-fg/50 text-xs',
          // Group States
          'group-data-empty/combobox-content:flex',
        ],
        className,
      )}
      {...props}
    />
  )
}
function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn('bg-vsc-editor-fg/15 -mx-1 h-px', className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
