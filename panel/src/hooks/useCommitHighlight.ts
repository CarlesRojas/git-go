import { useCallback, useEffect, useRef } from 'react'

export function useCommitHighlight() {
  const hoveredCircleRefs = useRef<Element[]>([])
  const hoveredPathsRef = useRef<Element[]>([])
  const dimTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = () => {
    hoveredCircleRefs.current.forEach(el => el.classList.remove('highlighted'))
    hoveredCircleRefs.current = []

    hoveredPathsRef.current.forEach(el => el.classList.remove('dimmed'))
    hoveredPathsRef.current = []

    if (dimTimeoutRef.current) {
      clearTimeout(dimTimeoutRef.current)
      dimTimeoutRef.current = null
    }
  }

  const onCommitHover = useCallback((hash: string | null, row: number | null) => {
    cleanup()

    if (hash && row !== null) {
      const elements = document.querySelectorAll(`[data-hash="${hash}"]`)
      elements.forEach(el => {
        el.classList.add('highlighted')
        hoveredCircleRefs.current.push(el)
      })

      dimTimeoutRef.current = setTimeout(() => {
        const paths = document.querySelectorAll('[data-rows]')
        paths.forEach(path => {
          const rows = path.getAttribute('data-rows')?.split(',') ?? []
          if (!rows.includes(String(row))) {
            path.classList.add('dimmed')
            hoveredPathsRef.current.push(path)
          }
        })
        dimTimeoutRef.current = null
      }, 1_000)
    }
  }, [])

  useEffect(() => {
    return () => cleanup()
  }, [])

  return { onCommitHover }
}
