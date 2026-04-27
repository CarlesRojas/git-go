import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ComponentProps } from 'react'
import { cn } from '../utils/cn'

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
        'bg-(--vscode-editor-background)/80 backdrop-blur-sm',
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
          'fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
          // Z-Index
          'z-50',
          // Layout & Structure
          'grid w-full gap-4',
          // Sizing
          'max-w-lg',
          // Colors & Background
          'border border-(--vscode-editor-foreground)/15 bg-(--vscode-editor-background)',
          // Spacing
          'p-6',
          // Typography
          'text-(--vscode-editor-foreground)',
          // Shadow & Effects
          'shadow-lg',
          // Animations & Transitions
          'duration-200',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        ],
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-(--vscode-editor-background) transition-opacity hover:opacity-100 focus:ring-2 focus:ring-(--vscode-editor-foreground)/50 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-(--vscode-editor-foreground)/10 data-[state=open]:text-(--vscode-editor-foreground)/70">
        <FontAwesomeIcon icon={faXmark} className="size-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
)

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        // Layout & Structure
        'flex flex-col',
        // Spacing
        'space-y-1.5',
        // Typography
        'text-center sm:text-left',
      ],
      className,
    )}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      [
        // Layout & Structure
        'flex flex-col-reverse sm:flex-row sm:justify-end',
        // Spacing
        'sm:space-x-2',
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
        'text-lg leading-none font-semibold tracking-tight text-(--vscode-editor-foreground)',
      ],
      className,
    )}
    {...props}
  />
)

const DialogDescription = ({ className, ref, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      [
        // Typography
        'text-sm text-(--vscode-editor-foreground)/70',
      ],
      className,
    )}
    {...props}
  />
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
