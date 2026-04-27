import { cn } from '@/utils/cn'
import { faCheck, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ComponentProps } from 'react'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = ({ className, children, ref, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'flex h-10 w-full items-center justify-between',
        // Spacing
        'px-3 py-2',
        // Typography
        'text-xs placeholder:text-(--vscode-input-placeholderForeground)/50',
        // Colors & Background
        'border border-(--vscode-editor-foreground)/15 bg-(--vscode-input-background)',
        // Interactive States
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Icon Styles
        '[&>span]:line-clamp-1',
      ],
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <FontAwesomeIcon icon={faChevronDown} className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
)

const SelectScrollUpButton = ({ className, ref, ...props }: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <FontAwesomeIcon icon={faChevronUp} className="size-4" />
  </SelectPrimitive.ScrollUpButton>
)

const SelectScrollDownButton = ({
  className,
  ref,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <FontAwesomeIcon icon={faChevronDown} className="size-4" />
  </SelectPrimitive.ScrollDownButton>
)

const SelectContent = ({
  className,
  children,
  position = 'popper',
  ref,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        [
          // Position & Layout
          'relative z-50 max-h-96 min-w-32 overflow-hidden',
          // Colors & Background
          'border border-(--vscode-editor-foreground)/15 bg-(--vscode-editor-background)',
          // Typography
          'text-(--vscode-editor-foreground)',
          // Animations
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        ],
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' && 'h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
)

const SelectLabel = ({ className, ref, ...props }: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pr-2 pl-8 text-xs font-semibold text-(--vscode-editor-foreground)/70', className)}
    {...props}
  />
)

const SelectItem = ({ className, children, ref, ...props }: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'relative flex w-full cursor-default items-center select-none',
        // Spacing
        'py-1.5 pr-2 pl-8',
        // Typography
        'text-xs outline-hidden',
        // Interactive States
        'focus:bg-(--vscode-editor-foreground)/15 data-disabled:pointer-events-none data-disabled:opacity-50',
      ],
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <FontAwesomeIcon icon={faCheck} className="size-3" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
)

const SelectSeparator = ({ className, ref, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-(--vscode-editor-foreground)/15', className)}
    {...props}
  />
)

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
