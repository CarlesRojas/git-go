import { Button } from '@/component/ui/Button'
import { cn } from '@/utils/cn'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cva, type VariantProps } from 'class-variance-authority'
import { InputHTMLAttributes } from 'react'

const inputVariants = cva([
  // Layout & Structure
  'flex h-7 w-full',
  // Spacing
  'px-2',
  // Typography
  'text-xs text-(--vscode-input-foreground)',
  // Colors & Background
  'bg-(--vscode-input-background)',
  // Borders
  'border border-(--vscode-editor-foreground)/15',
  // Interactions
  'transition-colors',
  // Placeholder
  'placeholder:text-(--vscode-input-placeholderForeground)/50',
  // Disabled States
  'disabled:cursor-not-allowed disabled:opacity-50',
])

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  onClear?: () => void
}

const Input = ({ className, type = 'text', onClear, ...props }: InputProps) => {
  const hasValue = props.value !== undefined ? String(props.value).length > 0 : false

  if (onClear) {
    return (
      <div className="relative w-full">
        <input type={type} className={cn(inputVariants({ className }), 'pr-9')} {...props} />

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

  return <input type={type} className={cn(inputVariants({ className }))} {...props} />
}

export { Input }
