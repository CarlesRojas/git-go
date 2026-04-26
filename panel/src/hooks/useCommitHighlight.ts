import { useCallback, useEffect, useRef } from 'react'

export function useCommitHighlight() {
  const hoveredCircleRefs = useRef<Element[]>([])
  const hoveredPathsRef = useRef<Element[]>([])

  const onCommitHover = useCallback((hash: string | null, row: number | null) => {
    hoveredCircleRefs.current.forEach(el => el.classList.remove('highlighted'))
    hoveredCircleRefs.current = []

    hoveredPathsRef.current.forEach(el => el.classList.remove('dimmed'))
    hoveredPathsRef.current = []

    if (hash && row !== null) {
      const elements = document.querySelectorAll(`[data-hash="${hash}"]`)
      elements.forEach(el => {
        el.classList.add('highlighted')
        hoveredCircleRefs.current.push(el)
      })

      const paths = document.querySelectorAll('[data-rows]')
      paths.forEach(path => {
        const rows = path.getAttribute('data-rows')?.split(',') ?? []
        if (!rows.includes(String(row))) {
          path.classList.add('dimmed')
          hoveredPathsRef.current.push(path)
        }
      })
    }
  }, [])

  useEffect(() => {
    return () => {
      hoveredCircleRefs.current.forEach(el => el.classList.remove('highlighted'))
      hoveredCircleRefs.current = []

      hoveredPathsRef.current.forEach(el => el.classList.remove('dimmed'))
      hoveredPathsRef.current = []
    }
  }, [])

  return { onCommitHover }
}
