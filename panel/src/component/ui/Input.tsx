import { cn } from '@/util/cn'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cva, type VariantProps } from 'class-variance-authority'
import { ComponentProps, forwardRef } from 'react'

const inputVariants = cva([
  // Layout & Structure
  'rounded-main flex h-7 w-full',
  // Spacing
  'px-2',
  // Typography
  'text-vsc-input-fg text-xs',
  // Colors & Background
  'bg-vsc-input-bg',
  // Borders
  'border-vsc-editor-fg/15 border',
  // Interactions
  'transition-colors',
  // Placeholder
  'placeholder:text-vsc-input-placeholder-fg/50',
  // Disabled States
  'disabled:cursor-not-allowed disabled:opacity-50',
])

export interface InputProps extends ComponentProps<'input'>, VariantProps<typeof inputVariants> {
  onClear?: () => void
  dataType?: 'normal' | 'search'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, dataType = 'normal', type = 'text', onClear, ...props }, ref) => {
    const hasValue = props.value !== undefined ? String(props.value).length > 0 : false

    if (onClear) {
      return (
        <div className="relative w-full">
          <input
            ref={ref}
            type={type}
            data-type={dataType}
            className={cn(inputVariants({ className }), hasValue && 'pr-7')}
            {...props}
          />

          {hasValue && (
            <button
              type="button"
              tabIndex={-1}
              title="Clear"
              onMouseDown={e => e.preventDefault()}
              onClick={onClear}
              className={cn(
                'absolute top-1/2 right-1 -translate-y-1/2',
                'flex size-5 cursor-pointer items-center justify-center rounded-sm transition-opacity',
                'hover:bg-vsc-editor-fg/10',
              )}
            >
              <FontAwesomeIcon icon={faTimes} className="pointer-events-none size-2.5" />
            </button>
          )}
        </div>
      )
    }

    return <input ref={ref} type={type} data-type={dataType} className={cn(inputVariants({ className }))} {...props} />
  },
)

Input.displayName = 'Input'

export { Input }
