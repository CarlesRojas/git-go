import { useEffect, useRef } from 'react'

/**
 * Hook that ensures a callback is executed only once, on component mount.
 * Uses a ref to prevent multiple executions even in React strict mode.
 */
export const useOnMount = (callback: () => void) => {
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (!hasRunRef.current) {
      hasRunRef.current = true
      callback()
    }
  }, [callback])
}
