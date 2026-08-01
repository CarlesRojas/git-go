import { Input } from '@/component/ui/Input'
import { cn } from '@/util/cn'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedOnChange = useDebounceCallback(onChange, 300)

  useEffect(() => {
    if (localValue !== value) debouncedOnChange(localValue)
  }, [localValue, debouncedOnChange, value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }

  // Expansion follows focus rather than the click, so the Cmd+F shortcut opens it too.
  const handleFocus = () => setExpanded(true)

  // An active search keeps the field open, otherwise it collapses back to the icon.
  const handleBlur = () => {
    if (localValue.length === 0) setExpanded(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return

    setLocalValue('')
    onChange('')
    inputRef.current?.blur()
  }

  return (
    <div
      className={cn([
        // Layout & Structure
        'relative flex h-7 shrink-0 items-center',
        // Animations & Transitions
        'transition-[width] duration-200 ease-out',
        // Sizing
        expanded ? 'w-48' : 'w-7',
      ])}
    >
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search commits..."
        className={cn('w-full pl-7', !expanded && 'cursor-pointer placeholder:opacity-0')}
        dataType="search"
        onClear={handleClear}
      />

      <button
        type="button"
        tabIndex={-1}
        title="Search commits"
        onClick={() => inputRef.current?.focus()}
        className="absolute left-0 flex size-7 cursor-pointer items-center justify-center"
      >
        <FontAwesomeIcon icon={faSearch} className="pointer-events-none size-3" />
      </button>
    </div>
  )
}
