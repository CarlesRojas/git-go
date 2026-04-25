import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../utils/cn'
import { Button } from './Button'

const inputVariants = cva([
  // Layout & Structure
  'flex h-7 w-full',
  // Spacing
  'px-2.5',
  // Typography
  'text-xs text-(--vscode-input-foreground)',
  // Colors & Background
  'bg-(--vscode-input-background)',
  // Borders
  'border border-(--vscode-editor-foreground)/10',
  // Interactions
  'transition-colors',
  // Placeholder
  'placeholder:text-(--vscode-input-placeholderForeground)/70',
  // Disabled States
  'disabled:cursor-not-allowed disabled:opacity-50',
])

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', onClear, ...props }, ref) => {
  const hasValue = props.value !== undefined ? String(props.value).length > 0 : false

  if (onClear) {
    return (
      <div className="relative">
        <input type={type} className={cn(inputVariants({ className }), 'pr-9')} ref={ref} {...props} />

        {hasValue && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClear}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <FontAwesomeIcon icon={faTimes} className="pointer-events-none size-3" />
          </Button>
        )}
      </div>
    )
  }

  return <input type={type} className={cn(inputVariants({ className }))} ref={ref} {...props} />
})
Input.displayName = 'Input'

export { Input }
