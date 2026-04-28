import { cn } from '@/util/cn'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ComponentProps, HTMLAttributes } from 'react'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = ({ className, ref, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      [
        // Layout & Position
        'fixed inset-0',
        // Z-Index
        'z-50',
        // Colors & Background
        'bg-vsc-editor-bg/80 backdrop-blur-md',
        // Animations & Transitions
        'duration-200',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
      ],
      className,
    )}
    {...props}
  />
)

const DialogContent = ({ className, children, ref, ...props }: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        [
          // Layout & Position
          'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          // Layout & Structure
          'grid w-full gap-4',
          // Sizing
          'max-w-[min(calc(100%-2rem),28rem)]',
          // Colors & Background
          'border-vsc-editor-fg/15 bg-vsc-editor-bg/80 border',
          // Spacing
          'p-3',
          // Typography
          'text-vsc-editor-fg',

          // Animations & Transitions
          'duration-200',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        ],
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="data-[state=open]:bg-vsc-editor-fg/10 data-[state=open]:text-vsc-editor-fg/70 absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none">
        <FontAwesomeIcon icon={faXmark} className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        // Layout & Structure
        'flex h-6 flex-col justify-center',
        // Typography
        'text-left',
      ],
      className,
    )}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        // Layout & Structure
        'flex flex-col-reverse sm:flex-row sm:justify-end',
        // Spacing
        'gap-2',
      ],
      className,
    )}
    {...props}
  />
)

const DialogTitle = ({ className, ref, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      [
        // Typography
        'text-vsc-editor-fg text-sm leading-none font-semibold',
      ],
      className,
    )}
    {...props}
  />
)

const DialogDescription = ({ className, ref, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description ref={ref} className={cn(['text-vsc-editor-fg/70 text-xs'], className)} {...props} />
)

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
