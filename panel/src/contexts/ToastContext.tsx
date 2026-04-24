import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { cn } from '../utils/cn'

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

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
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

    timeoutRef.current = setTimeout(() => {
      setToast(null)
      timeoutRef.current = null
    }, 5000)
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
            'fixed top-2 right-2 z-50 flex max-w-3xl items-center gap-3 border border-(--vscode-editor-foreground)/10 bg-(--vscode-editor-foreground)/5 p-2.5 text-sm backdrop-blur-md transition-all duration-300',
            toast.className,
          )}
        >
          {toast.icon && (
            <span className="shrink-0">
              <FontAwesomeIcon
                icon={toast.icon}
                className={cn(
                  'size-4 max-h-4 min-h-4 text-neutral-500/90',
                  toast.type === 'success' && 'text-green-500/90',
                  toast.type === 'error' && 'text-red-500/90',
                  toast.type === 'warning' && 'text-amber-500/90',
                )}
              />
            </span>
          )}

          <span className="line-clamp-2 text-xs leading-tight text-ellipsis">{toast.text}</span>

          <button
            onClick={closeToast}
            className="ml-4 cursor-pointer opacity-50 transition-opacity hover:opacity-100"
            type="button"
            aria-label="Close toast"
          >
            <FontAwesomeIcon icon={faTimes} className="size-3" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
