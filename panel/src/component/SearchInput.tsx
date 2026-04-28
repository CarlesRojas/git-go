import { Input } from '@/component/ui/Input'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export const SearchInput: FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex items-center">
      <Input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search commits..."
        className="w-48 pl-9"
        onClear={() => onChange('')}
      />

      <FontAwesomeIcon icon={faSearch} className="pointer-events-none absolute left-2 size-3" />
    </div>
  )
}
