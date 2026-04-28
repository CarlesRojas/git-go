import { cn } from '@/util/cn'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ComponentProps } from 'react'

const Checkbox = ({ className, ref, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'peer flex size-4 cursor-pointer items-center justify-center',
        // Colors & Background
        'border-vsc-editor-fg/15 bg-vsc-input-bg border',
        // Interactive States
        'disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-vsc-editor-fg/5 data-[state=checked]:hover:bg-vsc-button-bg/70',
        // Data states
        'data-[state=checked]:bg-vsc-button-bg data-[state=checked]:text-vsc-button-fg',
        'data-[state=checked]:border-vsc-button-bg',
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
