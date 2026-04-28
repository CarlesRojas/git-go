import { useCallback, useRef } from 'react'

export function useDoubleClick(onDoubleClick: () => void, onSingleClick?: () => void, delay: number = 250) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      onDoubleClick()
    } else {
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        onSingleClick?.()
      }, delay)
    }
  }, [onDoubleClick, onSingleClick, delay])

  return handleClick
}
