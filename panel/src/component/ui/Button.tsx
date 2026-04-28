import { cn } from '@/util/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  [
    // Layout & Structure
    'inline-flex items-center justify-center gap-2',
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
        default: 'border-vsc-button-fg/15 bg-vsc-button-bg text-vsc-button-fg hover:bg-vsc-button-hover-bg border',
        secondary: 'border-vsc-editor-fg/15 text-vsc-editor-fg hover:bg-vsc-editor-fg/10 border bg-transparent',
        destructive: 'border-vsc-error-fg/15 bg-vsc-error-bg text-vsc-error-fg hover:bg-vsc-error-bg/80 border',
        ghost: 'text-vsc-button-fg/70 hover:text-vsc-button-fg',
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
