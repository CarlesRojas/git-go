import { useSettings } from '@/context/SettingsContext'
import { DragActionId, DragPayload, SOURCE_ACTION_IDS, TARGETLESS_KINDS } from '@/util/dragAndDrop'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

const DRAG_THRESHOLD_PX = 5
const EDGE_ZONE_PX = 40
const MAX_SCROLL_SPEED_PX = 16
/** Keeps the ghost clear of the pointer so it never covers what is being aimed at. */
const GHOST_CURSOR_OFFSET_PX = 16

/** Set on the dragged item so it can be styled as picked-up without a React re-render. */
export const SOURCE_ATTRIBUTE = 'data-drag-source-active'

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
  /** Whether the pointer is over the dragged item right now, before any hold has elapsed. */
  pointerOverSource: boolean
  /** Whether the pointer is over the hovered target right now, as opposed to its boxes lingering. */
  pointerOverTarget: boolean
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
  const [pointerOverSource, setPointerOverSource] = useState(false)
  const [pointerOverTarget, setPointerOverTarget] = useState(false)
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
  /** Whether the pointer is physically over the source, as opposed to its stack being shown. */
  const inSourceRegion = useRef(false)
  const sourceHoldTimer = useRef<number | null>(null)
  /** Pending dismissals, so stepping away briefly and coming back keeps the boxes open. */
  const hideTimer = useRef<number | null>(null)
  const sourceHideTimer = useRef<number | null>(null)
  const isRevealed = useRef(false)
  /** Distinct from `currentTargetKey`, which outlives the pointer for the length of the linger. */
  const isPointerOverTarget = useRef(false)
  const payloadKind = useRef<DragPayload['kind'] | null>(null)
  const defaultAction = useRef<DragActionId | null>(null)
  const suppressNextClick = useRef(false)

  const { settings } = useSettings()
  const holdDelay = useRef(settings.dragAndDropHoldDelay)
  holdDelay.current = settings.dragAndDropHoldDelay
  const hideDelay = useRef(settings.dragAndDropHideDelay)
  hideDelay.current = settings.dragAndDropHideDelay

  const ghostRef = useCallback((element: HTMLDivElement | null) => {
    ghost.current = element
  }, [])

  const setDefaultAction = useCallback((actionId: DragActionId | null) => {
    defaultAction.current = actionId
  }, [])

  const setRevealedTracked = useCallback((value: boolean) => {
    isRevealed.current = value
    setRevealed(value)
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
      setRevealedTracked(true)
    }, holdDelay.current)
  }, [clearHoldTimer, setRevealedTracked])

  const clearSourceHoldTimer = useCallback(() => {
    if (sourceHoldTimer.current === null) return
    window.clearTimeout(sourceHoldTimer.current)
    sourceHoldTimer.current = null
  }, [])

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current === null) return
    window.clearTimeout(hideTimer.current)
    hideTimer.current = null
  }, [])

  const clearSourceHideTimer = useCallback(() => {
    if (sourceHideTimer.current === null) return
    window.clearTimeout(sourceHideTimer.current)
    sourceHideTimer.current = null
  }, [])

  const teardown = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    clearHoldTimer()
    clearSourceHoldTimer()
    clearHideTimer()
    clearSourceHideTimer()

    sourceElement.current?.removeAttribute(SOURCE_ATTRIBUTE)
    sourceElement.current = null
    document.documentElement.removeAttribute('data-dragging')

    currentTargetKey.current = null
    currentActionId.current = null
    currentActionDisabled.current = false
    currentSourceHovered.current = false
    inSourceRegion.current = false
    isPointerOverTarget.current = false
    payloadKind.current = null
    defaultAction.current = null
    isAutoScrolling.current = false
    scrollContainer.current = null

    setPayload(null)
    setHoveredTargetKey(null)
    setHoveredActionId(null)
    setRevealedTracked(false)
    setHoveredSource(false)
    setPointerOverSource(false)
    setPointerOverTarget(false)
  }, [clearHideTimer, clearHoldTimer, clearSourceHideTimer, clearSourceHoldTimer, setRevealedTracked])

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
      setRevealedTracked(false)
    } else if (wasScrolling && currentTargetKey.current !== null) {
      startHoldTimer()
    }
  }, [clearHoldTimer, setRevealedTracked, startHoldTimer])

  const hitTest = useCallback(() => {
    const { x, y } = pointer.current
    const element = document.elementFromPoint(x, y)

    // The dragged item's actions are shown from pickup, but coming back to it later costs the
    // same hold as any other pill. Evaluated every frame rather than on transitions so the
    // initial show can survive until its stack has actually mounted. A commit has no actions
    // of its own, so it has no stack to track at all.
    const inRegion = !!element?.closest('[data-drag-source-active], [data-drag-source-zone]')
    const stackMounted = !!document.querySelector('[data-drag-source-zone]')

    if (inRegion !== inSourceRegion.current) {
      inSourceRegion.current = inRegion
      // The pill reacts to the pointer immediately; only its boxes wait for the hold.
      if (payloadKind.current !== 'commit') setPointerOverSource(inRegion)
    }

    if (payloadKind.current === 'commit') {
      // Nothing to show or hide.
    } else if (!inRegion) {
      clearSourceHoldTimer()
      // A tag or stash has no valid drop target, so its own actions are the only ones it
      // will ever offer and they stay up for the whole drag.
      // A fast opening gesture also leaves the source before the stack exists; dismissing
      // then would hide boxes that were never rendered.
      if (
        currentSourceHovered.current &&
        stackMounted &&
        !TARGETLESS_KINDS.includes(payloadKind.current!) &&
        sourceHideTimer.current === null
      ) {
        sourceHideTimer.current = window.setTimeout(() => {
          sourceHideTimer.current = null
          if (inSourceRegion.current) return
          currentSourceHovered.current = false
          setHoveredSource(false)
        }, hideDelay.current)
      }
    } else {
      // Back before the dismissal ran, so the boxes were never really gone.
      clearSourceHideTimer()

      if (!currentSourceHovered.current && sourceHoldTimer.current === null) {
        sourceHoldTimer.current = window.setTimeout(() => {
          sourceHoldTimer.current = null
          if (!inSourceRegion.current) return
          currentSourceHovered.current = true
          setHoveredSource(true)
        }, holdDelay.current)
      }
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
    // A kind with no valid target never registers one, so pills do not react to it at all.
    const canTarget = !TARGETLESS_KINDS.includes(payloadKind.current!)
    const targetKey = isSource || !canTarget ? null : (targetElement?.getAttribute('data-drop-target') ?? null)

    // The stack's own padding and the gaps between its boxes keep the target alive so it does
    // not close as the pointer travels, but they are not the target: resting there arms
    // nothing and highlights nothing, since a release lands on neither pill nor box.
    const bridgeKey = element?.closest<HTMLElement>('[data-drop-bridge]')?.getAttribute('data-drop-bridge') ?? null
    const resolvedTarget = targetKey ?? bridgeKey

    if ((targetKey !== null) !== isPointerOverTarget.current) {
      isPointerOverTarget.current = targetKey !== null
      setPointerOverTarget(isPointerOverTarget.current)
    }

    // Back on the same pill before the dismissal ran, so its boxes stay put and keep the hold
    // they already earned.
    if (resolvedTarget !== null && resolvedTarget === currentTargetKey.current) clearHideTimer()

    if (resolvedTarget === currentTargetKey.current) return

    // Stepping off a revealed pill only schedules the dismissal, so a brief overshoot on the
    // way to a box does not close it. Moving onto a different pill commits immediately.
    if (resolvedTarget === null && isRevealed.current) {
      if (hideTimer.current === null) {
        hideTimer.current = window.setTimeout(() => {
          hideTimer.current = null
          currentTargetKey.current = null
          setHoveredTargetKey(null)
          setRevealedTracked(false)
        }, hideDelay.current)
      }
      return
    }

    clearHideTimer()
    currentTargetKey.current = resolvedTarget
    setHoveredTargetKey(resolvedTarget)
    setRevealedTracked(false)

    if (resolvedTarget === null) clearHoldTimer()
    else if (!isAutoScrolling.current) startHoldTimer()
  }, [clearHideTimer, clearHoldTimer, clearSourceHideTimer, clearSourceHoldTimer, setRevealedTracked, startHoldTimer])

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

      const actionId = currentActionId.current
      const needsTarget = !SOURCE_ACTION_IDS.includes(actionId)
      return { payload: dragPayload, targetKey: needsTarget ? currentTargetKey.current : null, actionId }
    }

    // The boxes outlive the pointer by design, but the drop does not — releasing once the
    // pointer has left the pill must do nothing, however long they are still on screen.
    if (!isPointerOverTarget.current) return null
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

        payloadKind.current = dragPayload.kind

        // Visible from the moment it is picked up; only returning to it later costs a hold.
        if (dragPayload.kind !== 'commit') {
          currentSourceHovered.current = true
          inSourceRegion.current = true
          setHoveredSource(true)
          setPointerOverSource(true)
        }

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
    () => ({
      payload,
      hoveredTargetKey,
      hoveredActionId,
      revealed,
      hoveredSource,
      pointerOverSource,
      pointerOverTarget,
      pendingDrop,
    }),
    [
      payload,
      hoveredTargetKey,
      hoveredActionId,
      revealed,
      hoveredSource,
      pointerOverSource,
      pointerOverTarget,
      pendingDrop,
    ],
  )

  return (
    <DragActionsContext.Provider value={actions}>
      <DragStateContext.Provider value={state}>{children}</DragStateContext.Provider>
    </DragActionsContext.Provider>
  )
}
