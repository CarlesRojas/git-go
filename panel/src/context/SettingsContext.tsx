import { useConfig } from '@/hook/useGitQueries'
import { createContext, useContext, useEffect, type ReactNode } from 'react'

interface ConfigState {
  rounded: boolean
}

interface SettingsContextType {
  settings: ConfigState
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data, isLoading } = useConfig()

  useEffect(() => {
    if (!data) return

    const htmlElement = document.documentElement

    if (data.rounded) htmlElement.removeAttribute('data-theme-sharp')
    else htmlElement.setAttribute('data-theme-sharp', '')
  }, [data, data?.rounded])

  if (isLoading || !data) {
    return null
  }

  return <SettingsContext.Provider value={{ settings: data }}>{children}</SettingsContext.Provider>
}
