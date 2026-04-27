import type { GitBranch } from '@/../src/gitService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { Graph } from './Graph'
import { BranchSelector } from './components/BranchSelector'
import { ToastProvider } from './contexts/ToastContext'
import { cn } from './utils/cn'

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

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn([
          // Layout & Structure
          'flex max-h-screen min-h-screen max-w-screen min-w-screen flex-col',
          // Typography
          'font-medium text-(--vscode-editor-foreground)',
          // Colors & Background
          // 'bg-(--vscode-editor-background)',
          // Selection States
          'selection:bg-(--vscode-editor-selectionBackground)',
          'selection:text-(--vscode-editor-selectionForeground)',
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
              'bg-(--vscode-editor-background)',
              // Borders
              'border-b border-(--vscode-editor-foreground)/15',
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
