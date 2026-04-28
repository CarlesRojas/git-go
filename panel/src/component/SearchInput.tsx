import { Input } from '@/component/ui/Input'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value)
  const debouncedOnChange = useDebounceCallback(onChange, 300)

  useEffect(() => {
    if (localValue !== value) debouncedOnChange(localValue)
  }, [localValue, debouncedOnChange, value])

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  return (
    <div className="relative flex items-center">
      <Input
        type="text"
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        placeholder="Search commits..."
        className="w-56 pl-7"
        onClear={handleClear}
      />

      <FontAwesomeIcon icon={faSearch} className="pointer-events-none absolute left-2 size-3" />
    </div>
  )
}
