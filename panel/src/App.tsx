import { BranchSelector } from '@/component/BranchSelector'
import { Graph } from '@/component/Graph'
import { ToastProvider } from '@/context/ToastContext'
import { cn } from '@/util/cn'
import { GitBranch } from '@git/gitService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useEventListener } from 'usehooks-ts'

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

  const onGitChange = (event: MessageEvent) => {
    if (event.data.type === 'gitChanged') queryClient.invalidateQueries({ queryKey: ['git'] })
  }

  useEventListener('message', onGitChange)

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn([
          // Layout & Structure
          'flex max-h-screen min-h-screen max-w-screen min-w-screen flex-col',
          // Typography
          'text-vsc-editor-fg font-medium',
          // Colors & Background
          // 'bg-vsc-editor-bg',
          // Selection States
          'selection:bg-vsc-editor-fg/10',
        ])}
        style={{
          fontFamily:
            '"Monaspace Neon", "JetBrains Mono", "JetBrainsMono Nerd Font", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
        }}
      >
        <ToastProvider>
          <div
            className={cn([
              // Position & Layout
              'flex h-9 max-h-9 min-h-9 w-full items-center',
              // Colors & Background
              'bg-vsc-editor-bg',
              // Borders
              'border-vsc-editor-fg/15 border-b',
              // Spacing
              'px-4',
            ])}
          >
            <BranchSelector onBranchesChange={setSelectedBranches} />
          </div>

          <main className="graph-h relative flex flex-col overflow-y-auto">
            <Graph selectedBranches={selectedBranches} />
          </main>
        </ToastProvider>
      </div>
    </QueryClientProvider>
  )
}
