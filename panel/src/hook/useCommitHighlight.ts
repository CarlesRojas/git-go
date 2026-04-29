import { useCallback, useEffect, useRef } from 'react'
import { useEventListener } from 'usehooks-ts'

interface Props {
  enabled: boolean
}

export function useCommitHighlight({ enabled }: Props) {
  const highlightedRefs = useRef<Element[]>([])
  const dimmedElementsRef = useRef<Element[]>([])
  const dimTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    highlightedRefs.current.forEach(el => el.classList.remove('highlighted'))
    highlightedRefs.current = []

    dimmedElementsRef.current.forEach(el => el.classList.remove('dimmed'))
    dimmedElementsRef.current = []

    if (dimTimeoutRef.current) {
      clearTimeout(dimTimeoutRef.current)
      dimTimeoutRef.current = null
    }
  }, [])

  const onCommitHover = useCallback(
    (hash: string | null, row: number | null) => {
      cleanup()

      const openContextMenu = document.querySelector('[data-disable-commit-highlight]')
      if (openContextMenu) return

      if (!hash || row === null || !enabled) return

      const elements = document.querySelectorAll(`[data-hash="${hash}"]`)
      elements.forEach(el => {
        el.classList.add('highlighted')
        highlightedRefs.current.push(el)
      })

      dimTimeoutRef.current = setTimeout(() => {
        if (hash === 'working-changes') return

        const activeRows = new Set<string>()
        const paths = document.querySelectorAll('[data-rows]')

        paths.forEach(path => {
          const rows = path.getAttribute('data-rows')?.split(',') ?? []
          if (rows.includes(String(row))) {
            rows.forEach(r => activeRows.add(r))
          } else {
            path.classList.add('dimmed')
            dimmedElementsRef.current.push(path)
          }
        })

        const allDots = document.querySelectorAll('[data-hash]')

        allDots.forEach(dot => {
          const dotRow = dot.getAttribute('data-row')
          if (dotRow && !activeRows.has(dotRow)) {
            dot.classList.add('dimmed')
            dimmedElementsRef.current.push(dot)
          }
        })

        const allCommitRows = document.querySelectorAll('[data-commit-row]')
        allCommitRows.forEach(el => {
          const r = el.getAttribute('data-commit-row')
          if (r && !activeRows.has(r)) {
            el.classList.add('dimmed')
            dimmedElementsRef.current.push(el)
          }
        })

        dimTimeoutRef.current = null
      }, 1_500)
    },
    [cleanup, enabled],
  )

  useEventListener('scroll', cleanup, undefined, { capture: true })
  useEventListener('keydown', cleanup)

  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return { onCommitHover }
}
