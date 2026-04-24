import { faCheck, faChevronDown, faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Popover from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import * as React from 'react'
import { cn } from '../utils/cn'

interface ComboboxProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  items: { value: string; label: string; icon?: React.ReactNode }[]
  className?: string
}

export const Combobox: React.FC<ComboboxProps> = ({
  value = [],
  onValueChange,
  placeholder = 'Select items...',
  items,
  className,
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [open])

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      const newValue = value.includes(selectedValue)
        ? value.filter(v => v !== selectedValue)
        : [...value, selectedValue]

      onValueChange?.(newValue)
    },
    [value, onValueChange],
  )

  const filteredItems = React.useMemo(
    () =>
      items.filter(
        item =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.value.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  )

  const displayText = React.useMemo(() => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      const item = items.find(item => item.value === value[0])
      return item?.label || value[0]
    }
    return `${value.length} branches`
  }, [value, items, placeholder])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            'border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-7 w-64 items-center justify-between gap-2 border bg-transparent px-3 py-1 text-xs whitespace-nowrap shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
            className,
          )}
          style={{
            backgroundColor: 'var(--vscode-input-background)',
            borderColor: 'var(--vscode-input-border)',
            color: 'var(--vscode-input-foreground)',
          }}
        >
          <div className="flex min-w-0 flex-row items-center gap-2">
            <FontAwesomeIcon icon={faCodeBranch} className="h-3 w-3 shrink-0 opacity-60" />
            <span className="truncate">{displayText}</span>
          </div>

          <FontAwesomeIcon
            icon={faChevronDown}
            className={cn('h-3 w-3 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
          />
        </button>
      </Popover.Trigger>

      <Popover.Content
        className="w-(--radix-popover-trigger-width) p-0"
        style={{
          backgroundColor: 'var(--vscode-dropdown-background)',
          borderColor: 'var(--vscode-dropdown-border)',
          boxShadow: 'var(--vscode-widget-shadow)',
        }}
      >
        <Command className="border-border overflow-hidden rounded-md border">
          <Command.Input
            ref={inputRef}
            placeholder="Search branches..."
            value={search}
            onValueChange={setSearch}
            className="placeholder:text-muted-foreground flex h-8 w-full rounded-md border-none bg-transparent py-2 text-xs outline-none disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: 'var(--vscode-input-background)',
              color: 'var(--vscode-input-foreground)',
            }}
          />

          <Command.List className="max-h-50 overflow-y-auto">
            <Command.Empty className="py-6 text-center text-xs">No branches found.</Command.Empty>
            <Command.Group>
              {filteredItems.map(item => (
                <Command.Item
                  key={item.value}
                  value={item.value}
                  onSelect={() => handleSelect(item.value)}
                  className={cn(
                    'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none select-none',
                    'hover:bg-accent hover:text-accent-foreground',
                  )}
                  style={{
                    backgroundColor: value.includes(item.value)
                      ? 'var(--vscode-list-activeSelectionBackground)'
                      : 'transparent',
                    color: value.includes(item.value)
                      ? 'var(--vscode-list-activeSelectionForeground)'
                      : 'var(--vscode-dropdown-foreground)',
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </div>

                  {value.includes(item.value) && <FontAwesomeIcon icon={faCheck} className="h-3 w-3 min-w-3" />}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover.Root>
  )
}
