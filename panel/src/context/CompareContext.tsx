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

interface CompareState {
  /**
   * The side picked as A — either waiting for its counterpart or the left side of the open
   * comparison, which are the same thing as far as picking a second side goes.
   */
  pending: CompareSide | null
  comparison: Comparison | null
}

interface CompareContextType extends CompareState {
  /**
   * What every entry point does, whatever the state: arm A when nothing is picked, complete the
   * comparison when something is, and clear the pick when it is the one already armed.
   */
  pick: (side: CompareSide) => void
  /** Compare two sides outright, for the gestures that name both at once */
  compare: (from: CompareSide, to: CompareSide) => void
  swap: () => void
  close: () => void
}

const EMPTY: CompareState = { pending: null, comparison: null }

const CompareContext = createContext<CompareContextType | null>(null)

export const useCompare = (): CompareContextType => {
  const context = useContext(CompareContext)
  if (!context) throw new Error('useCompare must be used within a CompareProvider')
  return context
}

/**
 * The compare entry for one thing that can be compared — a commit, a branch tip, a tag — as the
 * context menus render it: arming a side, completing the pair, or taking the pick back. Null for
 * the rows that cannot take part, so the entry is left out. A plain function rather than a hook,
 * since a menu handed its subject per invocation cannot call one.
 */
export const compareEntryFor = (
  { pending, pick }: Pick<CompareContextType, 'pending' | 'pick'>,
  side: CompareSide | null,
) => {
  if (side === null) return null

  const isPending = pending !== null && pending.hash === side.hash

  return {
    label: pending === null ? 'Select to compare' : isPending ? 'Clear compare selection' : 'Compare with selected',
    onSelect: () => pick(side),
  }
}

export const useCompareEntry = (side: CompareSide | null) => compareEntryFor(useCompare(), side)

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CompareState>(EMPTY)

  const pick = useCallback((side: CompareSide) => {
    setState(previous => {
      if (previous.pending === null) return { pending: side, comparison: null }
      // Picking the armed side again is how a selection is taken back
      if (previous.pending.hash === side.hash) return EMPTY
      return { pending: previous.pending, comparison: { from: previous.pending, to: side } }
    })
  }, [])

  // A is left armed at the compared-from side, so a second pick keeps comparing against the same
  // baseline rather than starting over
  const compare = useCallback((from: CompareSide, to: CompareSide) => {
    setState({ pending: from, comparison: { from, to } })
  }, [])

  const swap = useCallback(() => {
    setState(previous =>
      previous.comparison
        ? {
            pending: previous.comparison.to,
            comparison: { from: previous.comparison.to, to: previous.comparison.from },
          }
        : previous,
    )
  }, [])

  // Dismissing the panel drops the selection too, so the graph is left unmarked
  const close = useCallback(() => setState(EMPTY), [])

  const value = useMemo(() => ({ ...state, pick, compare, swap, close }), [state, pick, compare, swap, close])

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}
