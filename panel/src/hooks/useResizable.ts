import { useCallback, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

interface UseResizableOptions {
  initialHeight?: number
  minHeight?: number
}

export function useResizable({ initialHeight = 164, minHeight = 164 }: UseResizableOptions) {
  const [height, setHeight] = useState(initialHeight)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const dragState = useRef({
    startY: 0,
    startHeight: 0,
    maxHeight: 0,
  })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const deltaY = e.clientY - dragState.current.startY
      const newHeight = Math.min(
        Math.max(dragState.current.startHeight + deltaY, minHeight),
        dragState.current.maxHeight,
      )
      setHeight(newHeight)
    },
    [isDragging, minHeight],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging) {
      return
    }
    setIsDragging(false)
  }, [isDragging])

  useEventListener('mousemove', handleMouseMove)
  useEventListener('mouseup', handleMouseUp)

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()

      let maxHeight = window.innerHeight * 0.9

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const distanceToBottom = window.innerHeight - rect.top
        maxHeight = Math.max(distanceToBottom - 32, minHeight)
      }

      dragState.current = {
        startY: e.clientY,
        startHeight: height,
        maxHeight,
      }

      setIsDragging(true)
    },
    [height, minHeight],
  )

  return {
    height,
    isDragging,
    handleMouseDown,
    containerRef,
  }
}
