import { Button } from '@/component/ui/Button'
import { cn } from '@/util/cn'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, RefObject, useEffect, useState } from 'react'

/** How far down the graph has to be scrolled before the button appears */
const SHOW_AFTER = 200

interface ScrollToTopButtonProps {
  scrollRef: RefObject<HTMLElement | null>
}

export const ScrollToTopButton: FC<ScrollToTopButtonProps> = ({ scrollRef }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const update = () => setIsVisible(container.scrollTop > SHOW_AFTER)
    update()

    container.addEventListener('scroll', update, { passive: true })
    return () => container.removeEventListener('scroll', update)
  }, [scrollRef])

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Scroll to top"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn([
        // Position & Layout
        'fixed bottom-3 left-3 z-30',
        // Colors & Background
        'bg-vsc-editor-bg',
        // Borders
        'border-vsc-editor-fg/25',
        // Interactions
        'transition-all duration-200',
        // Visibility
        isVisible ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      ])}
    >
      <FontAwesomeIcon icon={faArrowUp} className="size-3" />
    </Button>
  )
}
