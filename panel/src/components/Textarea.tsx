import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../utils/cn'

const textareaVariants = cva([
  // Layout & Structure
  'flex min-h-[60px] w-full resize-none',
  // Spacing
  'px-3 py-2',
  // Typography
  'text-sm text-(--vscode-input-foreground)',
  // Colors & Background
  'bg-(--vscode-input-background)',
  // Borders
  'border border-(--vscode-editor-foreground)/15',
  // Interactions
  'transition-colors',
  // Placeholder
  'placeholder:text-(--vscode-input-placeholderForeground)/70',
  // Disabled States
  'disabled:cursor-not-allowed disabled:opacity-50',
])

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return <textarea className={cn(textareaVariants({ className }))} ref={ref} {...props} />
})
Textarea.displayName = 'Textarea'

export { Textarea }
