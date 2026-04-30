import { Button } from '@/component/ui/Button'
import { cn } from '@/util/cn'
import { icon } from '@fortawesome/fontawesome-svg-core'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useRef } from 'react'

interface Toast {
  text: string
  icon?: IconDefinition
  type?: 'info' | 'warning' | 'error' | 'success'
  className?: string
}

interface ToastContextValue {
  showToast: (toast: Toast) => void
  closeToast: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// Vanilla JS toast controller - no React state!
class ToastController {
  private toastElement: HTMLDivElement | null = null
  private iconElement: HTMLSpanElement | null = null
  private textElement: HTMLSpanElement | null = null
  private timeout: NodeJS.Timeout | null = null

  init(toastEl: HTMLDivElement) {
    this.toastElement = toastEl
    this.iconElement = toastEl.querySelector('[data-toast-icon]') as HTMLSpanElement
    this.textElement = toastEl.querySelector('[data-toast-text]') as HTMLSpanElement
  }

  showToast(toast: Toast) {
    if (!this.toastElement) return

    this.closeToast()

    if (this.textElement) this.textElement.textContent = toast.text

    if (this.iconElement) {
      if (toast.icon) {
        this.iconElement.style.display = 'block'

        const iconSvg = icon(toast.icon, {
          classes: cn(
            'text-vsc-editor-fg/50 size-4 max-h-4 min-h-4',
            toast.type === 'success' && 'text-vsc-git-added-fg',
            toast.type === 'error' && 'text-vsc-git-deleted-fg',
            toast.type === 'warning' && 'text-vsc-git-modified-fg',
          ).split(' '),
        }).html[0]

        if (iconSvg) this.iconElement.innerHTML = iconSvg
      } else {
        this.iconElement.style.display = 'none'
      }
    }

    this.toastElement.className = cn(
      'fixed right-2 bottom-2 z-60 flex max-w-lg gap-3 border p-2.5 backdrop-blur-md transition-all duration-300',
      'border-vsc-editor-fg/15 bg-vsc-editor-bg/80',
      toast.type === 'error' && 'border-vsc-git-deleted-fg/30 bg-vsc-git-deleted-fg/10',
      toast.className,
    )

    this.toastElement.style.transform = 'translateX(100%)'
    this.toastElement.style.opacity = '0'
    this.toastElement.style.pointerEvents = 'all'

    requestAnimationFrame(() => {
      if (this.toastElement) {
        this.toastElement.style.transform = 'translateX(0)'
        this.toastElement.style.opacity = '1'
      }
    })

    this.timeout = setTimeout(this.closeToast, toast.type === 'error' ? 30_000 : 6_000)
  }

  closeToast() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.toastElement) {
      this.toastElement.style.transform = 'translateX(100%)'
      this.toastElement.style.opacity = '0'
      this.toastElement.style.pointerEvents = 'none'
    }
  }
}

const toastController = new ToastController()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const toastRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((toast: Toast) => {
    toastController.showToast(toast)
  }, [])

  const closeToast = useCallback(() => {
    toastController.closeToast()
  }, [])

  useEffect(() => {
    if (toastRef.current) toastController.init(toastRef.current)

    return () => {
      toastController.closeToast()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}

      {/* Static toast component - controlled by vanilla JS */}
      <div
        ref={toastRef}
        className={cn(
          'fixed right-2 bottom-2 z-60 flex max-w-lg gap-3 border p-2.5 backdrop-blur-md transition-all duration-300',
          'border-vsc-editor-fg/15 bg-vsc-editor-bg/80',
        )}
        style={{ opacity: 0, pointerEvents: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span data-toast-icon className="shrink-0">
            <FontAwesomeIcon icon={faCheckCircle} className={cn('text-vsc-editor-fg/50 size-4 max-h-4 min-h-4')} />
          </span>

          <span data-toast-text className="text-xs leading-tight"></span>
        </div>

        <Button
          onClick={e => {
            e.stopPropagation()
            closeToast()
          }}
          className="ml-4"
          variant="ghost"
          size="iconSmall"
          aria-label="Close toast"
        >
          <FontAwesomeIcon icon={faTimes} className="size-3" />
        </Button>
      </div>
    </ToastContext.Provider>
  )
}
