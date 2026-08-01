import { useEffect, useRef, useState } from 'react'

/** Matches the pill's scale transition, so the row stays unclipped until it has finished. */
const SCALE_TRANSITION_MS = 150

/**
 * A hovered pill grows by roughly this many pixels rather than by a fixed ratio, so a long
 * branch name does not balloon while a short one barely moves. Clamped at both ends.
 */
const HOVER_GROWTH_PX = 8
const MIN_HOVER_SCALE = 1.02
const MAX_HOVER_SCALE = 1.12

/**
 * The growth a pill shows while it is the one a release would act on, whether that is a drop
 * target or the dragged item itself. Shared so every kind of pill reacts identically.
 */
export const useDragHoverScale = <T extends HTMLElement>(isHovered: boolean) => {
  const ref = useRef<T>(null)
  const [scale, setScale] = useState(1)
  const [unclipped, setUnclipped] = useState(false)

  useEffect(() => {
    if (!isHovered) return

    const width = ref.current?.offsetWidth
    if (!width) return

    setScale(Math.min(Math.max(1 + HOVER_GROWTH_PX / width, MIN_HOVER_SCALE), MAX_HOVER_SCALE))
  }, [isHovered])

  // The row stops clipping so the scaled pill is not cut off. Dropping that the moment the
  // pointer leaves would clip the scale-down instead, so it outlives the transition.
  useEffect(() => {
    if (isHovered) {
      setUnclipped(true)
      return
    }

    if (!unclipped) return

    const timeout = window.setTimeout(() => setUnclipped(false), SCALE_TRANSITION_MS)
    return () => window.clearTimeout(timeout)
  }, [isHovered, unclipped])

  return { ref, scale, unclipped }
}
