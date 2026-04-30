import { Toaster } from '@/component/ui/sonner'
import { cn } from '@/util/cn'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createContext, FC, ReactNode, useContext } from 'react'
import { toast } from 'sonner'

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

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const showToast = (toastData: Toast) => {
    const { text, type = 'info', icon } = toastData

    const content = icon ? (
      <div className="flex items-center gap-3">
        <span className="shrink-0">
          <FontAwesomeIcon
            icon={icon}
            className={cn(
              'text-vsc-editor-fg/80 size-4 max-h-4 min-h-4',
              type === 'success' && 'text-vsc-git-added-fg',
              type === 'error' && 'text-vsc-git-deleted-fg',
              type === 'warning' && 'text-vsc-git-modified-fg',
            )}
          />
        </span>
        <span className="text-xs leading-tight">{text}</span>
      </div>
    ) : (
      text
    )

    switch (type) {
      case 'success':
        toast.success(content, { duration: 6_000 })
        break
      case 'error':
        toast.error(content, { duration: 30_000 })
        break
      case 'warning':
        toast.warning(content, { duration: 30_000 })
        break
      case 'info':
      default:
        toast.info(content, { duration: 6_000 })
        break
    }
  }

  const closeToast = () => {
    toast.dismiss()
  }

  return (
    <ToastContext.Provider value={{ showToast, closeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}
