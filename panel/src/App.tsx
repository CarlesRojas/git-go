import { BranchSelector } from '@/component/BranchSelector'
import { Graph } from '@/component/Graph'
import { RefetchButton } from '@/component/RefreshButton'
import { SearchInput } from '@/component/SearchInput'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/context/ToastContext'
import { cn } from '@/util/cn'
import { GitBranch } from '@git/gitService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, useRef, useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import { RepoSettings } from './component/RepoSettings'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

export const App: FC = () => {
  const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const documentRef = useRef<Document>(document)

  const onGitChange = (event: MessageEvent) => {
    if (event.data.type === 'gitChanged') queryClient.invalidateQueries({ queryKey: ['git'] })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
      event.preventDefault()
      const searchInput = document.querySelector<HTMLInputElement>('input[data-type="search"]')
      searchInput?.focus()
    }
  }

  useEventListener('message', onGitChange)
  useEventListener('keydown', handleKeyDown, documentRef)

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ToastProvider>
          <div
            className={cn([
              // Layout & Structure
              'flex max-h-screen min-h-screen max-w-screen min-w-screen flex-col',
              // Typography
              'text-vsc-editor-fg font-medium',
              // Colors & Background
              // 'bg-vsc-editor-bg',
              // Selection States
              'selection:bg-vsc-editor-fg/10!',
            ])}
            style={{
              fontFamily:
                '"Monaspace Neon", "JetBrains Mono", "JetBrainsMono Nerd Font", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
            }}
          >
            <div
              className={cn([
                // Position & Layout
                'flex h-9 max-h-9 min-h-9 w-full items-center justify-between gap-2',
                // Colors & Background
                'bg-vsc-editor-bg',
                // Borders
                'border-vsc-editor-fg/15 border-b',
                // Spacing
                'px-2',
              ])}
            >
              <BranchSelector onBranchesChange={setSelectedBranches} />

              <div className="flex items-center gap-2">
                <SearchInput value={searchTerm} onChange={setSearchTerm} />

                <RefetchButton />
                <RepoSettings />
              </div>
            </div>

            <main className="graph-h relative flex flex-col overflow-y-auto">
              <Graph selectedBranches={selectedBranches} searchTerm={searchTerm} />
            </main>
          </div>
        </ToastProvider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
