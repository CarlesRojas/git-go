import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

export interface SearchMatchState {
  /** 1-based position of the current match, 0 while none has been navigated to */
  current: number
  total: number
  /** The git-side search is still running, or a jump is still loading pages to reach its match */
  isSearching: boolean
}

export type SearchNavigate = (direction: 'next' | 'prev') => void

interface SearchContextType {
  matchState: SearchMatchState | null
  setMatchState: (state: SearchMatchState | null) => void
  navigate: SearchNavigate
  registerNavigator: (navigate: SearchNavigate | null) => void
}

const SearchContext = createContext<SearchContextType | null>(null)

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearch must be used within a SearchProvider')
  return context
}

interface SearchProviderProps {
  children: ReactNode
}

/**
 * Bridges the toolbar's search input and the graph: the graph publishes its match counter here
 * and registers the navigator the input's prev/next buttons and Enter shortcuts call.
 */
export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [matchState, setMatchState] = useState<SearchMatchState | null>(null)
  const navigatorRef = useRef<SearchNavigate | null>(null)

  const registerNavigator = useCallback((navigate: SearchNavigate | null) => {
    navigatorRef.current = navigate
  }, [])

  const navigate = useCallback<SearchNavigate>(direction => {
    navigatorRef.current?.(direction)
  }, [])

  const value = useMemo(
    () => ({ matchState, setMatchState, navigate, registerNavigator }),
    [matchState, navigate, registerNavigator],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
