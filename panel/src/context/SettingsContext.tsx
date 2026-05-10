import { ConfigState, RepoState, useConfig, useRepoState, useThemeKind } from '@/hook/useGitQueries'
import { createContext, useContext, useEffect, type ReactNode } from 'react'

interface SettingsContextType {
  settings: RepoState & ConfigState & { isDark: boolean }
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
  const { data: configData, isLoading: isConfigLoading } = useConfig()
  const { data: repoData, isLoading: isRepoLoading } = useRepoState()
  const { isDark, isLoading: isThemeLoading } = useThemeKind()

  useEffect(() => {
    if (!configData) return

    const htmlElement = document.documentElement

    if (configData.rounded) htmlElement.removeAttribute('data-theme-sharp')
    else htmlElement.setAttribute('data-theme-sharp', '')
  }, [configData, configData?.rounded])

  if (isConfigLoading || !configData || isRepoLoading || !repoData || isThemeLoading || isDark === undefined)
    return null

  const combinedSettings = { ...configData, ...repoData, isDark }

  return <SettingsContext.Provider value={{ settings: combinedSettings }}>{children}</SettingsContext.Provider>
}
