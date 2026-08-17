import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * One end of a comparison: the ref git is given, the name the header shows, and the commit it
 * resolves to so the graph can mark the row. A branch or tag keeps its own name as the ref, so
 * the header can say `main → v1.2.0` rather than repeating two hashes.
 */
export interface CompareSide {
  ref: string
  label: string
  hash: string
}

export interface Comparison {
  from: CompareSide
  to: CompareSide
}

interface CompareContextType {
  comparison: Comparison | null
  /**
   * The commit the graph has expanded. Every entry point compares it with whatever was picked
   * next, so "compare with selected" always reads from this side to the other.
   */
  selected: CompareSide | null
  setSelected: (side: CompareSide | null) => void
  compare: (from: CompareSide, to: CompareSide) => void
  swap: () => void
  close: () => void
}

const CompareContext = createContext<CompareContextType | null>(null)

export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within a CompareProvider')
  return context
}

/** Whether two sides address the same thing, so a re-publish of the selection changes nothing. */
const sameSide = (a: CompareSide | null, b: CompareSide | null) =>
  a === b || (!!a && !!b && a.ref === b.ref && a.hash === b.hash && a.label === b.label)

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [selected, setSelectedState] = useState<CompareSide | null>(null)

  // The graph republishes the selection whenever its commit list changes, which is every page
  // fetch — so an unchanged selection must not re-render everything subscribed to it.
  const setSelected = useCallback((side: CompareSide | null) => {
    setSelectedState(previous => (sameSide(previous, side) ? previous : side))
  }, [])

  const compare = useCallback((from: CompareSide, to: CompareSide) => {
    setComparison({ from, to })
  }, [])

  const swap = useCallback(() => {
    setComparison(previous => (previous ? { from: previous.to, to: previous.from } : previous))
  }, [])

  const close = useCallback(() => setComparison(null), [])

  const value = useMemo(
    () => ({ comparison, selected, setSelected, compare, swap, close }),
    [comparison, selected, setSelected, compare, swap, close],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
