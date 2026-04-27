import { cn } from '@/util/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes } from 'react'

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
          'border border-(--vscode-button-foreground)/15 bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground)',
        secondary:
          'border border-(--vscode-editor-foreground)/15 bg-transparent text-(--vscode-button-foreground) hover:bg-(--vscode-editor-foreground)/10',
        destructive:
          'border border-(--vscode-errorForeground)/15 bg-(--vscode-inputValidation-errorBackground) text-(--vscode-errorForeground) hover:bg-(--vscode-inputValidation-errorBackground)/80',
        ghost: 'text-(--vscode-button-foreground)/70 hover:text-(--vscode-button-foreground)',
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

const Button = ({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) => (
  <button className={cn(buttonVariants({ variant, size, className }))} type={type} {...props} />
)

export { Button }
