import { cn } from '@/util/cn'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { ComponentProps } from 'react'

const RadioGroup = ({ className, ref, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) => (
  <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />
)

const RadioGroupItem = ({ className, ref, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      [
        // Layout & Structure
        'flex size-4 cursor-pointer items-center justify-center rounded-full',
        // Colors & Background
        'border-vsc-editor-fg/15 bg-vsc-input-bg border-2',
        // Interactive States
        'disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-vsc-editor-fg/5',
        // Data states
        'data-[state=checked]:border-vsc-button-bg data-[state=checked]:bg-vsc-button-bg',
      ],
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="bg-vsc-button-fg size-2 rounded-full" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
)

export { RadioGroup, RadioGroupItem }
