import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../utils/cn'

const buttonVariants = cva(
  [
    // Layout & Structure
    'inline-flex items-center justify-center',
    // Typography
    'text-xs font-medium whitespace-nowrap',
    // Interactions
    'cursor-pointer transition-colors',
    // Disabled States
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground)',
        secondary:
          'border border-(--vscode-editor-foreground)/15 bg-transparent text-(--vscode-button-foreground)/80 hover:bg-(--vscode-editor-foreground)/10',
        ghost: 'text-(--vscode-button-foreground)/80 hover:text-(--vscode-button-foreground)',
      },
      size: {
        default: 'h-7 px-3',
        icon: 'h-7 w-7',
        iconSmall: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />
  },
)
Button.displayName = 'Button'

export { Button }
