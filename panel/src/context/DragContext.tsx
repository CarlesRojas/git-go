import { DragActionId, DragPayload } from '@/util/dragAndDrop'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const DRAG_THRESHOLD_PX = 5
const HOLD_DELAY_MS = 450
const EDGE_ZONE_PX = 40
const MAX_SCROLL_SPEED_PX = 16
/** Keeps the ghost clear of the pointer so it never covers what is being aimed at. */
const GHOST_CURSOR_OFFSET_PX = 16

/** Set on the dragged item so it can be styled as picked-up without a React re-render. */
export const SOURCE_ATTRIBUTE = 'data-drag-source-active'

/** Actions that operate on the dragged item itself and therefore have no target. */
const SOURCE_ACTION_IDS: DragActionId[] = ['push', 'delete']

export interface PendingDrop {
  payload: DragPayload
  /** cleanName of the local branch dropped on, or null for actions that need no target. */
  targetKey: string | null
  actionId: DragActionId
}

/** Changes on every hover. Only subscribe from the handful of components that need it. */
interface DragStateContextType {
  payload: DragPayload | null
  /** Branch pill currently under the pointer, or null. */
  hoveredTargetKey: string | null
  /** Action box currently under the pointer, or null. */
  hoveredActionId: DragActionId | null
  /** Whether the pointer has rested on the current target long enough to reveal its boxes. */
  revealed: boolean
  /** Whether the pointer is back over the dragged item, which shows its own actions. */
  hoveredSource: boolean
  pendingDrop: PendingDrop | null
}

/**
 * Stable for the lifetime of the provider, so drag sources — including every commit row —
 * can start drags without re-rendering when hover state changes.
 */
interface DragActionsContextType {
  beginPress: (payload: DragPayload, event: React.PointerEvent) => void
  /**
   * Told by the overlay which action a plain release on the current target performs, since
   * only the overlay can read the settings that decide it.
   */
  setDefaultAction: (actionId: DragActionId | null) => void
  clearPendingDrop: () => void
  ghostRef: (element: HTMLDivElement | null) => void
}

const DragStateContext = createContext<DragStateContextType | null>(null)
const DragActionsContext = createContext<DragActionsContextType | null>(null)

export const useDragState = (): DragStateContextType => {
  const context = useContext(DragStateContext)
  if (!context) throw new Error('useDragState must be used within a DragProvider')
  return context
}

export const useDragActions = (): DragActionsContextType => {
  const context = useContext(DragActionsContext)
  if (!context) throw new Error('useDragActions must be used within a DragProvider')
  return context
}

export const DragProvider = ({ children }: { children: ReactNode }) => {
  const [payload, setPayload] = useState<DragPayload | null>(null)
  const [hoveredTargetKey, setHoveredTargetKey] = useState<string | null>(null)
  const [hoveredActionId, setHoveredActionId] = useState<DragActionId | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [hoveredSource, setHoveredSource] = useState(false)
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null)

  // Everything below is deliberately kept out of React state: it changes every frame and
  // must never re-render the graph.
  const pointer = useRef({ x: 0, y: 0 })
  const ghost = useRef<HTMLDivElement | null>(null)
  const frame = useRef<number | null>(null)
  const holdTimer = useRef<number | null>(null)
  const scrollContainer = useRef<HTMLElement | null>(null)
  const isAutoScrolling = useRef(false)
  const sourceElement = useRef<HTMLElement | null>(null)
  const currentTargetKey = useRef<string | null>(null)
  const currentActionId = useRef<DragActionId | null>(null)
  const currentActionDisabled = useRef(false)
  const currentSourceHovered = useRef(false)
  const defaultAction = useRef<DragActionId | null>(null)
  const suppressNextClick = useRef(false)

  const ghostRef = useCallback((element: HTMLDivElement | null) => {
    ghost.current = element
  }, [])

  const setDefaultAction = useCallback((actionId: DragActionId | null) => {
    defaultAction.current = actionId
  }, [])

  const clearHoldTimer = useCallback(() => {
    if (holdTimer.current === null) return
    window.clearTimeout(holdTimer.current)
    holdTimer.current = null
  }, [])

  const startHoldTimer = useCallback(() => {
    clearHoldTimer()
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null
      setRevealed(true)
    }, HOLD_DELAY_MS)
  }, [clearHoldTimer])

  const teardown = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    clearHoldTimer()

    sourceElement.current?.removeAttribute(SOURCE_ATTRIBUTE)
    sourceElement.current = null
    document.documentElement.removeAttribute('data-dragging')

    currentTargetKey.current = null
    currentActionId.current = null
    currentActionDisabled.current = false
    currentSourceHovered.current = false
    defaultAction.current = null
    isAutoScrolling.current = false
    scrollContainer.current = null

    setPayload(null)
    setHoveredTargetKey(null)
    setHoveredActionId(null)
    setRevealed(false)
    setHoveredSource(false)
  }, [clearHoldTimer])

  const autoScroll = useCallback(() => {
    const container = scrollContainer.current
    if (!container) return

    const bounds = container.getBoundingClientRect()
    const { y } = pointer.current

    const fromTop = y - bounds.top
    const fromBottom = bounds.bottom - y

    let delta = 0
    if (fromTop < EDGE_ZONE_PX) delta = -MAX_SCROLL_SPEED_PX * (1 - Math.max(fromTop, 0) / EDGE_ZONE_PX)
    else if (fromBottom < EDGE_ZONE_PX) delta = MAX_SCROLL_SPEED_PX * (1 - Math.max(fromBottom, 0) / EDGE_ZONE_PX)

    const wasScrolling = isAutoScrolling.current
    isAutoScrolling.current = delta !== 0

    if (delta !== 0) {
      container.scrollTop += delta
      // Content slides under a stationary pointer, so resting here is not a deliberate hold.
      clearHoldTimer()
      setRevealed(false)
    } else if (wasScrolling && currentTargetKey.current !== null) {
      startHoldTimer()
    }
  }, [clearHoldTimer, startHoldTimer])

  const hitTest = useCallback(() => {
    const { x, y } = pointer.current
    const element = document.elementFromPoint(x, y)

    // The dragged item shows its own actions whenever the pointer is back over it, or over
    // the stack those actions live in. That stack only mounts a frame after the drag begins,
    // so until it exists a fast opening gesture must not clear the flag — otherwise the boxes
    // are dismissed before they were ever rendered.
    const sourceHovered = !!element?.closest('[data-drag-source-active], [data-drag-source-zone]')
    const stackMounted = !!document.querySelector('[data-drag-source-zone]')
    if (sourceHovered !== currentSourceHovered.current && (sourceHovered || stackMounted)) {
      currentSourceHovered.current = sourceHovered
      setHoveredSource(sourceHovered)
    }

    const actionElement = element?.closest<HTMLElement>('[data-drag-action]') ?? null
    const actionId = (actionElement?.getAttribute('data-drag-action') as DragActionId | null) ?? null
    currentActionDisabled.current = actionElement?.getAttribute('data-drag-action-disabled') === 'true'

    if (actionId !== currentActionId.current) {
      currentActionId.current = actionId
      setHoveredActionId(actionId)
    }

    // Boxes sit above the graph; while over one, the target underneath must not change.
    if (actionElement) return

    const targetElement = element?.closest<HTMLElement>('[data-drop-target]') ?? null
    // The drag handle can be nested inside the drop target, so containment — not identity —
    // is what marks a pill as the one being dragged.
    const isSource = !!sourceElement.current && !!targetElement?.contains(sourceElement.current)
    const resolvedTarget = isSource ? null : (targetElement?.getAttribute('data-drop-target') ?? null)

    if (resolvedTarget === currentTargetKey.current) return

    currentTargetKey.current = resolvedTarget
    setHoveredTargetKey(resolvedTarget)
    setRevealed(false)

    if (resolvedTarget === null) clearHoldTimer()
    else if (!isAutoScrolling.current) startHoldTimer()
  }, [clearHoldTimer, startHoldTimer])

  const tick = useCallback(() => {
    const { x, y } = pointer.current

    if (ghost.current) {
      ghost.current.style.transform = `translate3d(${x + GHOST_CURSOR_OFFSET_PX}px, ${y}px, 0)`
    }

    autoScroll()
    hitTest()

    frame.current = requestAnimationFrame(tick)
  }, [autoScroll, hitTest])

  /**
   * Resolves what a release performs. Dropping on a disabled box does nothing rather than
   * quietly falling through to the default action.
   */
  const resolveDrop = useCallback((dragPayload: DragPayload): PendingDrop | null => {
    if (currentActionId.current !== null) {
      if (currentActionDisabled.current) return null
      if (currentActionId.current === 'cancel') return null

      const actionId = currentActionId.current
      const needsTarget = !SOURCE_ACTION_IDS.includes(actionId)
      return { payload: dragPayload, targetKey: needsTarget ? currentTargetKey.current : null, actionId }
    }

    if (currentTargetKey.current === null || defaultAction.current === null) return null

    return { payload: dragPayload, targetKey: currentTargetKey.current, actionId: defaultAction.current }
  }, [])

  const beginPress = useCallback(
    (dragPayload: DragPayload, event: React.PointerEvent) => {
      if (event.button !== 0) return

      // A drag cancelled with Escape never produces the click it was armed to swallow, so the
      // flag is cleared per press rather than left to be consumed by an unrelated one later.
      suppressNextClick.current = false

      const origin = { x: event.clientX, y: event.clientY }
      const element = event.currentTarget as HTMLElement
      let started = false

      const cleanup = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleCancel)
        window.removeEventListener('blur', handleCancel)
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('contextmenu', handleContextMenu)
      }

      function handleMove(moveEvent: PointerEvent) {
        pointer.current = { x: moveEvent.clientX, y: moveEvent.clientY }

        if (started) return
        if (Math.hypot(moveEvent.clientX - origin.x, moveEvent.clientY - origin.y) < DRAG_THRESHOLD_PX) return

        started = true
        suppressNextClick.current = true

        // The dragged item's own actions are visible from the moment it is picked up.
        currentSourceHovered.current = true
        setHoveredSource(true)

        sourceElement.current = element
        element.setAttribute(SOURCE_ATTRIBUTE, '')
        document.documentElement.setAttribute('data-dragging', dragPayload.kind)
        scrollContainer.current = document.querySelector<HTMLElement>('[data-drag-scroll-container]')

        setPayload(dragPayload)
        frame.current = requestAnimationFrame(tick)
      }

      function handleUp() {
        cleanup()
        if (!started) return

        const drop = resolveDrop(dragPayload)
        teardown()
        if (drop) setPendingDrop(drop)
      }

      function handleCancel() {
        cleanup()
        if (started) teardown()
      }

      function handleKeyDown(keyEvent: KeyboardEvent) {
        if (keyEvent.key !== 'Escape') return
        keyEvent.preventDefault()
        handleCancel()
      }

      function handleContextMenu(menuEvent: MouseEvent) {
        if (!started) return
        menuEvent.preventDefault()
        handleCancel()
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleCancel)
      window.addEventListener('blur', handleCancel)
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('contextmenu', handleContextMenu)
    },
    [resolveDrop, teardown, tick],
  )

  // A completed drag ends with a pointerup over a pill, which the browser also reports as a
  // click. Swallow that one so dropping on a branch never also checks it out.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!suppressNextClick.current) return
      suppressNextClick.current = false
      event.stopPropagation()
      event.preventDefault()
    }

    window.addEventListener('click', handleClick, true)
    return () => window.removeEventListener('click', handleClick, true)
  }, [])

  useEffect(() => teardown, [teardown])

  const clearPendingDrop = useCallback(() => setPendingDrop(null), [])

  const actions = useMemo(
    () => ({ beginPress, setDefaultAction, clearPendingDrop, ghostRef }),
    [beginPress, setDefaultAction, clearPendingDrop, ghostRef],
  )

  const state = useMemo(
    () => ({ payload, hoveredTargetKey, hoveredActionId, revealed, hoveredSource, pendingDrop }),
    [payload, hoveredTargetKey, hoveredActionId, revealed, hoveredSource, pendingDrop],
  )

  return (
    <DragActionsContext.Provider value={actions}>
      <DragStateContext.Provider value={state}>{children}</DragStateContext.Provider>
    </DragActionsContext.Provider>
  )
}
