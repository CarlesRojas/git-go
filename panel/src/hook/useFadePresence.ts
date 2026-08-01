import { useEffect, useState } from 'react'

/**
 * Keeps content mounted long enough to fade out after it stops being visible.
 * `shown` drives the opacity and only turns on a frame after mounting, so the transition has
 * a starting value to animate from rather than snapping straight to full opacity.
 */
export const useFadePresence = (visible: boolean, exitMs: number) => {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }

    setShown(false)
    const timeout = window.setTimeout(() => setMounted(false), exitMs)
    return () => window.clearTimeout(timeout)
  }, [visible, exitMs])

  return { mounted, shown }
}
