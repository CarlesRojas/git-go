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
  // Interactions
  'pointer-events-auto',
  // Colors & Background
  'bg-vsc-editor-bg/80 backdrop-blur-md',
  // Borders
  'border-vsc-editor-fg/15 border',
  // Animations & Transitions
  'transition-all duration-200',
])

/** Faded out but still holding its place, so neither button moves when the other comes and goes */
const hiddenButtonClasses = 'pointer-events-none opacity-0'

interface FloatingScrollActionsProps {
  scrollRef: RefObject<HTMLElement | null>
}

/**
 * The buttons floating over the bottom right of the graph: one to the checked-out branch, one back
 * to the top. Each fades in and out with whether it has somewhere to take you.
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

  if (!settings.scrollToTopButton && !settings.scrollToCurrentBranchButton) return null

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-30 flex items-center gap-2">
      {settings.scrollToCurrentBranchButton && (
        <Button
          variant="secondary"
          onClick={scrollToCurrentBranch}
          tabIndex={showScrollToBranch ? 0 : -1}
          aria-hidden={!showScrollToBranch}
          className={cn(floatingButtonClasses, !showScrollToBranch && hiddenButtonClasses)}
        >
          <FontAwesomeIcon icon={faLocationCrosshairs} className="size-3" />
          Scroll to Current Branch
        </Button>
      )}

      {settings.scrollToTopButton && (
        <Button
          variant="secondary"
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          tabIndex={showScrollToTop ? 0 : -1}
          aria-hidden={!showScrollToTop}
          className={cn(floatingButtonClasses, !showScrollToTop && hiddenButtonClasses)}
        >
          <FontAwesomeIcon icon={faArrowUp} className="size-3" />
          Scroll to Top
        </Button>
      )}
    </div>
  )
}
