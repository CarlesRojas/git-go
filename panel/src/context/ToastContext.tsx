import { Toaster } from '@/component/ui/sonner'
import { useGraphScroll } from '@/context/GraphScrollContext'
import { cn } from '@/util/cn'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createContext, FC, ReactNode, useContext } from 'react'
import { toast } from 'sonner'

const TOAST_DURATION = 4_000
const MAX_ERROR_TEXT_LENGTH = 300
/** Clears the graph's floating buttons: their own inset, their height, and a gap of the same inset */
const FLOATING_ACTIONS_OFFSET = '3.25rem'

let toastCount = 0

interface Toast {
  text: string
  icon: IconDefinition
  type?: 'info' | 'warning' | 'error' | 'success'
  className?: string
}

interface ToastContextValue {
  showToast: (toast: Toast) => void
  closeToast: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const { areFloatingActionsVisible } = useGraphScroll()

  const showToast = (toastData: Toast) => {
    const { text, type = 'info', icon } = toastData

    const id = `git-go-toast-${++toastCount}`
    const displayText =
      type === 'error' && text.length > MAX_ERROR_TEXT_LENGTH ? `${text.slice(0, MAX_ERROR_TEXT_LENGTH)}…` : text

    const content = (
      <div
        className={cn(
          'rounded-main-outer relative flex w-full gap-3 pr-8 pl-3',
          'pointer-events-auto',
          type === 'success' && 'bg-vsc-git-added-fg/5 pointer-events-auto',
          type === 'error' && 'bg-vsc-git-deleted-fg/5 pointer-events-auto',
          type === 'warning' && 'bg-vsc-git-modified-fg/5 pointer-events-auto',
        )}
      >
        <div className="flex h-fit min-h-10 w-fit items-center justify-center">
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'text-vsc-editor-fg/80 m-0! size-4 max-h-4 min-h-4 p-0!',
              type === 'success' && 'text-vsc-git-added-fg',
              type === 'error' && 'text-vsc-git-deleted-fg',
              type === 'warning' && 'text-vsc-git-modified-fg',
            )}
          />
        </div>

        <span className="py-3 text-xs leading-tight">{displayText}</span>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => toast.dismiss(id)}
          className="text-vsc-editor-fg/50 hover:text-vsc-editor-fg absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center"
        >
          <FontAwesomeIcon icon={faXmark} className="m-0! size-3 max-h-3 min-h-3 p-0!" />
        </button>
      </div>
    )

    switch (type) {
      case 'success':
        toast.success(content, { duration: TOAST_DURATION, id })
        break
      case 'error':
        toast.error(content, { duration: TOAST_DURATION, id })
        break
      case 'warning':
        toast.warning(content, { duration: TOAST_DURATION, id })
        break
      case 'info':
      default:
        toast.info(content, { duration: TOAST_DURATION, id })
        break
    }
  }

  const closeToast = () => {
    toast.dismiss()
  }

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}

      <Toaster
        offset={areFloatingActionsVisible ? { bottom: FLOATING_ACTIONS_OFFSET } : undefined}
        mobileOffset={areFloatingActionsVisible ? { bottom: FLOATING_ACTIONS_OFFSET } : undefined}
      />
    </ToastContext.Provider>
  )
}
