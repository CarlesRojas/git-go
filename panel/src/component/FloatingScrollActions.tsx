import { Button } from '@/component/ui/Button'
import { useGraphScroll } from '@/context/GraphScrollContext'
import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/util/cn'
import { faArrowUp, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, RefObject, useEffect, useState } from 'react'

/** How far down the graph has to be scrolled before the scroll to top button appears */
const SHOW_AFTER = 200

const floatingButtonClasses = cn([
  // Colors & Background
  'bg-vsc-editor-bg',
  // Borders
  'border-vsc-editor-fg/25',
  // Animation
  'animate-in fade-in slide-in-from-bottom-2 duration-200',
])

interface FloatingScrollActionsProps {
  scrollRef: RefObject<HTMLElement | null>
}

/**
 * The buttons floating over the bottom left of the graph: one back to the top, one to the
 * checked-out branch. Each is only there while it has somewhere to take you.
 */
export const FloatingScrollActions: FC<FloatingScrollActionsProps> = ({ scrollRef }) => {
  const { settings } = useSettings()
  const { isCurrentBranchOffScreen, scrollToCurrentBranch, setAreFloatingActionsVisible } = useGraphScroll()

  const [isScrolledDown, setIsScrolledDown] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const update = () => setIsScrolledDown(container.scrollTop > SHOW_AFTER)
    update()

    container.addEventListener('scroll', update, { passive: true })
    return () => container.removeEventListener('scroll', update)
  }, [scrollRef])

  const showScrollToTop = settings.scrollToTopButton && isScrolledDown
  const showScrollToBranch = settings.scrollToCurrentBranchButton && isCurrentBranchOffScreen

  useEffect(() => {
    setAreFloatingActionsVisible(showScrollToTop || showScrollToBranch)
    return () => setAreFloatingActionsVisible(false)
  }, [showScrollToTop, showScrollToBranch, setAreFloatingActionsVisible])

  if (!showScrollToTop && !showScrollToBranch) return null

  return (
    <div className="fixed bottom-3 left-3 z-30 flex items-center gap-2">
      {showScrollToTop && (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Scroll to top"
          aria-label="Scroll to top"
          className={floatingButtonClasses}
        >
          <FontAwesomeIcon icon={faArrowUp} className="size-3" />
        </Button>
      )}

      {showScrollToBranch && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToCurrentBranch}
          title="Scroll to the current branch"
          aria-label="Scroll to the current branch"
          className={floatingButtonClasses}
        >
          <FontAwesomeIcon icon={faLocationCrosshairs} className="size-3" />
        </Button>
      )}
    </div>
  )
}
