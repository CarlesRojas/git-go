import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ComponentProps } from 'react'
import { cn } from '../utils/cn'

const Checkbox = ({ className, ref, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'peer flex size-4 items-center justify-center',
        // Colors & Background
        'border border-(--vscode-editor-foreground)/15 bg-(--vscode-input-background)',
        // Interactive States
        'focus-visible:ring-2 focus-visible:ring-(--vscode-editor-foreground)/50 focus-visible:outline-hidden',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Data states
        'data-[state=checked]:bg-(--vscode-button-background) data-[state=checked]:text-(--vscode-button-foreground)',
        'data-[state=checked]:border-(--vscode-button-background)',
      ],
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <FontAwesomeIcon icon={faCheck} className="size-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)

export { Checkbox }
