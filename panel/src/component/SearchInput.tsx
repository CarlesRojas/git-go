import { useSearch } from '@/context/SearchContext'
import { Input } from '@/component/ui/Input'
import { cn } from '@/util/cn'
import { faChevronDown, faChevronUp, faCircleNotch, faSearch } from '@fortawesome/free-solid-svg-icons'
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
  const { matchState, navigate } = useSearch()

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
    if (event.key === 'Enter') {
      event.preventDefault()
      navigate(event.shiftKey ? 'prev' : 'next')
      return
    }

    if (event.key !== 'Escape') return

    setLocalValue('')
    onChange('')
    inputRef.current?.blur()
  }

  // The counter and prev/next only make sense once the active term produced a match state
  const showMatches = matchState !== null && localValue.trim().length > 0
  const hasMatches = matchState !== null && matchState.total > 0

  return (
    <div
      className={cn([
        // Layout & Structure
        'relative flex h-7 shrink-0 items-center',
        // Animations & Transitions
        'transition-[width] duration-200 ease-out',
        // Sizing
        expanded ? (showMatches ? 'w-72' : 'w-48') : 'w-7',
      ])}
    >
      {/* Collapsed, the field drops its padding — 28px of box cannot hold it, and the overflow
          would spill over the button to its right. */}
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search commits..."
        className={cn('w-full pl-7', !expanded && 'cursor-pointer px-0 placeholder:opacity-0')}
        // The clear button owns right-1; the counter and arrows sit left of it, over the input
        style={showMatches ? { paddingRight: '7rem' } : undefined}
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

      {showMatches && (
        <div className="absolute right-8 flex items-center gap-0.5">
          {matchState.isSearching && (
            <FontAwesomeIcon icon={faCircleNotch} className="size-2.5 animate-spin opacity-60" />
          )}

          <span className="min-w-fit text-[10px] leading-none tabular-nums opacity-60">
            {`${matchState.current}/${matchState.total}`}
          </span>

          <button
            type="button"
            tabIndex={-1}
            title="Previous match (Shift+Enter)"
            disabled={!hasMatches}
            onMouseDown={e => e.preventDefault()}
            onClick={() => navigate('prev')}
            className={cn(
              'flex size-5 cursor-pointer items-center justify-center rounded-sm transition-opacity',
              hasMatches ? 'hover:bg-vsc-editor-fg/10' : 'cursor-default opacity-30',
            )}
          >
            <FontAwesomeIcon icon={faChevronUp} className="pointer-events-none size-2.5" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            title="Next match (Enter)"
            disabled={!hasMatches}
            onMouseDown={e => e.preventDefault()}
            onClick={() => navigate('next')}
            className={cn(
              'flex size-5 cursor-pointer items-center justify-center rounded-sm transition-opacity',
              hasMatches ? 'hover:bg-vsc-editor-fg/10' : 'cursor-default opacity-30',
            )}
          >
            <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none size-2.5" />
          </button>
        </div>
      )}
    </div>
  )
}
