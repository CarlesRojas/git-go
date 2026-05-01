import { useConfig } from '@/hook/useGitQueries'
import { createContext, useContext, type ReactNode } from 'react'

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

  // Only render children when we have received a response (not loading)
  if (isLoading || !data) {
    return null
  }

  return <SettingsContext.Provider value={{ settings: data }}>{children}</SettingsContext.Provider>
}
