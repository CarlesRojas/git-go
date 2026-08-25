import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

interface GraphScrollContextType {
  /** Whether the checked-out branch has a pill in the graph and it sits outside the viewport */
  isCurrentBranchOffScreen: boolean
  setIsCurrentBranchOffScreen: (offScreen: boolean) => void
  scrollToCurrentBranch: () => void
  registerScrollToCurrentBranch: (scroll: (() => void) | null) => void
  /** Whether any of the graph's floating buttons is on screen, so the toasts can clear them */
  areFloatingActionsVisible: boolean
  setAreFloatingActionsVisible: (visible: boolean) => void
}

const GraphScrollContext = createContext<GraphScrollContextType | null>(null)

export const useGraphScroll = (): GraphScrollContextType => {
  const context = useContext(GraphScrollContext)
  if (!context) throw new Error('useGraphScroll must be used within a GraphScrollProvider')
  return context
}

interface GraphScrollProviderProps {
  children: ReactNode
}

/**
 * Bridges the graph and the buttons floating over it: the graph publishes where the checked-out
 * branch sits and registers the jump to it, and the buttons publish whether they are on screen so
 * the toasts can sit above them instead of over them.
 */
export const GraphScrollProvider = ({ children }: GraphScrollProviderProps) => {
  const [isCurrentBranchOffScreen, setIsCurrentBranchOffScreen] = useState(false)
  const [areFloatingActionsVisible, setAreFloatingActionsVisible] = useState(false)
  const scrollRef = useRef<(() => void) | null>(null)

  const registerScrollToCurrentBranch = useCallback((scroll: (() => void) | null) => {
    scrollRef.current = scroll
  }, [])

  const scrollToCurrentBranch = useCallback(() => {
    scrollRef.current?.()
  }, [])

  const value = useMemo(
    () => ({
      isCurrentBranchOffScreen,
      setIsCurrentBranchOffScreen,
      scrollToCurrentBranch,
      registerScrollToCurrentBranch,
      areFloatingActionsVisible,
      setAreFloatingActionsVisible,
    }),
    [isCurrentBranchOffScreen, areFloatingActionsVisible, scrollToCurrentBranch, registerScrollToCurrentBranch],
  )

  return <GraphScrollContext.Provider value={value}>{children}</GraphScrollContext.Provider>
}
