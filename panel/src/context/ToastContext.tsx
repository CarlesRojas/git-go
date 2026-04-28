import { Button } from '@/component/ui/Button'
import { cn } from '@/util/cn'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface Toast {
  text: string
  icon?: IconDefinition
  type?: 'info' | 'warning' | 'error' | 'success'
  className?: string
}

interface ToastContextValue {
  toast: Toast | null
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
  const [toast, setToast] = useState<Toast | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const closeToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback((newToast: Toast) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    setToast(newToast)

    timeoutRef.current = setTimeout(
      () => {
        setToast(null)
        timeoutRef.current = null
      },
      newToast.type === 'error' ? 30_000 : 6_000,
    )
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, showToast, closeToast }}>
      {children}
      {toast && (
        <div
          className={cn(
            'border-vsc-editor-fg/15 bg-vsc-editor-bg/80 fixed right-2 bottom-2 z-50 flex max-w-lg gap-3 border p-2.5 backdrop-blur-md transition-all duration-300',
            toast.type === 'error' && 'border-vsc-git-deleted-fg/30 bg-vsc-git-deleted-fg/10',
            toast.className,
          )}
        >
          <div className="flex items-center gap-3">
            {toast.icon && (
              <span className="shrink-0">
                <FontAwesomeIcon
                  icon={toast.icon}
                  className={cn(
                    'text-vsc-editor-fg/50 size-4 max-h-4 min-h-4',
                    toast.type === 'success' && 'text-vsc-git-added-fg',
                    toast.type === 'error' && 'text-vsc-git-deleted-fg',
                    toast.type === 'warning' && 'text-vsc-git-modified-fg',
                  )}
                />
              </span>
            )}

            <span className="text-xs leading-tight">{toast.text}</span>
          </div>

          <Button onClick={closeToast} className="ml-4" variant="ghost" size="iconSmall" aria-label="Close toast">
            <FontAwesomeIcon icon={faTimes} className="size-3" />
          </Button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
