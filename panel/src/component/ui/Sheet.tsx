import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

const handleInteractOutside = (event: Event) => {
  const isToastItem = (event.target as Element)?.closest('[data-sonner-toaster]')
  if (isToastItem) event.preventDefault()
}

import { Button } from '@/component/ui/Button'
import { cn } from '@/util/cn'
import { ComponentProps } from 'react'

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      onContextMenu={event => event.preventDefault()}
      className={cn(
        [
          // Z-Index
          'z-50',
          // Layout & Structure
          'fixed inset-0',
        ],
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        onPointerDownOutside={handleInteractOutside}
        onInteractOutside={handleInteractOutside}
        className={cn(
          [
            // Z-Index
            'z-50',
            // Layout & Structure
            'fixed flex flex-col',
            // Sizing
            'rounded-main-outer overflow-y-auto',
            'data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto',
            'data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4',
            'data-[side=right]:top-11 data-[side=right]:right-4 data-[side=right]:bottom-2 data-[side=right]:h-[calc(100%-3.25rem)] data-[side=right]:w-3/4',
            'data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto',
            'data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm',
            // Colors & Background
            'bg-vsc-editor-bg/80 bg-clip-padding backdrop-blur-md',
            // Typography
            'text-vsc-editor-fg text-sm',
            // Borders
            'border-vsc-editor-fg/15 border',
            // Animations & Transitions
            'transition duration-200 ease-in-out',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10',
            'data-[side=left]:data-[state=open]:slide-in-from-left-10',
            'data-[side=right]:data-[state=open]:slide-in-from-right-10',
            'data-[side=top]:data-[state=open]:slide-in-from-top-10',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            'data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10',
            'data-[side=left]:data-[state=closed]:slide-out-to-left-10',
            'data-[side=right]:data-[state=closed]:slide-out-to-right-10',
            'data-[side=top]:data-[state=closed]:slide-out-to-top-10',
          ],
          className,
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2">
              <FontAwesomeIcon icon={faXmark} className="size-3" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        [
          // Layout & Structure
          'border-vsc-editor-fg/15 flex flex-col border-b',
          // Spacing
          'gap-0.5 p-3',
        ],
        className,
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        [
          // Layout & Structure
          'border-vsc-editor-fg/15 mt-auto flex flex-col border-t',
          // Spacing
          'gap-2 p-3',
        ],
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        [
          // Typography
          'text-vsc-editor-fg text-sm font-medium',
        ],
        className,
      )}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(
        [
          // Typography
          'text-vsc-editor-fg/60 text-sm',
        ],
        className,
      )}
      {...props}
    />
  )
}

const SheetSeparator = ({ className, ref, ...props }: ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'my-main -mx-3 h-px',
        // Colors & Background
        'bg-vsc-editor-fg/15',
      ],
      className,
    )}
    {...props}
  />
)

const SheetLabel = ({ className, ref, ...props }: ComponentProps<'span'>) => (
  <span
    ref={ref}
    className={cn(
      [
        // Typography
        'text-vsc-editor-fg/50 text-xs',
      ],
      className,
    )}
    {...props}
  />
)

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetLabel,
  SheetSeparator,
  SheetTitle,
  SheetTrigger,
}
