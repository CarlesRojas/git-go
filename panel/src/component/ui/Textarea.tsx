import { cn } from '@/util/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { TextareaHTMLAttributes } from 'react'

const textareaVariants = cva([
  // Layout & Structure
  'flex min-h-15 w-full resize-none',
  // Spacing
  'px-3 py-1.5',
  // Typography
  'text-sm text-(--vscode-input-foreground)',
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

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {}

const Textarea = ({ className, ...props }: TextareaProps) => {
  return <textarea className={cn(textareaVariants({ className }))} {...props} />
}

export { Textarea }
