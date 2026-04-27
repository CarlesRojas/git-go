import { cn } from '@/utils/cn'
import { faCheck, faChevronRight, faCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu'
import { cva, type VariantProps } from 'class-variance-authority'
import { ComponentProps, HTMLAttributes } from 'react'

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

interface ContextMenuSubTriggerProps extends ComponentProps<typeof ContextMenuPrimitive.SubTrigger> {
  inset?: boolean
}

const ContextMenuSubTrigger = ({ className, inset, children, ref, ...props }: ContextMenuSubTriggerProps) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'flex cursor-default items-center select-none',
        // Spacing
        'h-7 px-2',
        // Typography
        'text-xs',
        // Interactive States
        'outline-hidden focus:bg-(--vscode-editor-foreground)/15 data-[state=open]:bg-(--vscode-editor-foreground)/15',
        // Icon Styles
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      ],
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <FontAwesomeIcon icon={faChevronRight} className="ml-auto size-3" />
  </ContextMenuPrimitive.SubTrigger>
)

const ContextMenuSubContent = ({
  className,
  ref,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      [
        // Z-Index
        'z-50',
        // Layout & Structure
        'overflow-hidden',
        // Sizing
        'min-w-48',
        // Colors & Background
        'border border-(--vscode-editor-foreground)/15 bg-(--vscode-editor-background)',
        // Typography
        'text-(--vscode-editor-foreground)',
        // Spacing
        'p-1',
        // Animations & Transitions
        'duration-100',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      ],
      className,
    )}
    {...props}
  />
)

const ContextMenuContent = ({ className, ref, ...props }: ComponentProps<typeof ContextMenuPrimitive.Content>) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        [
          // Z-Index
          'z-50',
          // Layout & Structure
          'overflow-hidden',
          // Sizing
          'min-w-48',
          // Colors & Background
          'border border-(--vscode-editor-foreground)/15 bg-(--vscode-editor-background)/80 backdrop-blur-md',
          // Typography
          'text-(--vscode-editor-foreground)',
          // Animations & Transitions
          'duration-100',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        ],
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
)

const contextMenuItemVariants = cva(
  [
    // Layout & Structure
    'relative flex cursor-pointer items-center select-none',
    // Spacing
    'h-7 gap-2 px-2',
    // Typography
    'text-xs font-semibold',
    // Interactive States
    'outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50',
    // Icon Styles
    '[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'focus:bg-(--vscode-editor-foreground)/15',
        destructive:
          'text-(--vscode-errorForeground) focus:bg-(--vscode-errorForeground)/10 [&_svg]:text-(--vscode-errorForeground)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface ContextMenuItemProps
  extends ComponentProps<typeof ContextMenuPrimitive.Item>, VariantProps<typeof contextMenuItemVariants> {
  inset?: boolean
}

const ContextMenuItem = ({ className, inset, variant, ref, ...props }: ContextMenuItemProps) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(contextMenuItemVariants({ variant }), inset && 'pl-8', className)}
    {...props}
  />
)

const ContextMenuCheckboxItem = ({
  className,
  children,
  checked,
  ref,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'relative flex cursor-default items-center select-none',
        // Spacing
        'h-7 pr-2 pl-8',
        // Typography
        'text-xs',
        // Interactive States
        'outline-hidden focus:bg-(--vscode-editor-foreground)/15 data-disabled:pointer-events-none data-disabled:opacity-50',
        // Icon Styles
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      ],
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <FontAwesomeIcon icon={faCheck} className="size-3" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
)

const ContextMenuRadioItem = ({
  className,
  children,
  ref,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'relative flex cursor-default items-center select-none',
        // Spacing
        'h-7 pr-2 pl-8',
        // Typography
        'text-xs',
        // Interactive States
        'outline-hidden focus:bg-(--vscode-editor-foreground)/15 data-disabled:pointer-events-none data-disabled:opacity-50',
        // Icon Styles
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      ],
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <FontAwesomeIcon icon={faCircle} className="size-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
)

interface ContextMenuLabelProps extends ComponentProps<typeof ContextMenuPrimitive.Label> {
  inset?: boolean
}

const ContextMenuLabel = ({ className, inset, ref, ...props }: ContextMenuLabelProps) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      [
        // Spacing
        'flex h-7 items-center px-2',
        // Typography
        'text-xs text-(--vscode-editor-foreground)/60',
      ],
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
)

const ContextMenuSeparator = ({ className, ref, ...props }: ComponentProps<typeof ContextMenuPrimitive.Separator>) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        '-mx-1 h-px',
        // Colors & Background
        'bg-(--vscode-editor-foreground)/15',
      ],
      className,
    )}
    {...props}
  />
)

const ContextMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        [
          // Layout & Structure
          'ml-auto',
          // Typography
          'text-xs text-(--vscode-editor-foreground)/50',
          // Spacing
          'tracking-widest',
        ],
        className,
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
}
