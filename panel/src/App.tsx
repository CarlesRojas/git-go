import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Graph } from './Graph'
import { ToastProvider } from './contexts/ToastContext'
import { BranchSelector } from './components/BranchSelector'
import type { GitBranch } from '../../src/gitService'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

export const App: React.FC = () => {
  const [selectedBranches, setSelectedBranches] = useState<GitBranch[]>([])

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="flex min-h-screen min-w-screen flex-col bg-(--vscode-editor-background) leading-relaxed font-medium text-(--vscode-editor-foreground) selection:bg-(--vscode-editor-selectionBackground) selection:text-(--vscode-editor-selectionForeground)"
        style={{
          fontFamily:
            '"Monaspace Neon", "JetBrains Mono", "JetBrainsMono Nerd Font", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
        }}
      >
        <ToastProvider>
          <div className="sticky top-0 z-10 border-b border-(--vscode-panel-border) bg-(--vscode-editor-background) px-4 py-3">
            <BranchSelector onBranchesChange={setSelectedBranches} />
          </div>

          <Graph selectedBranches={selectedBranches} />
        </ToastProvider>
      </div>
    </QueryClientProvider>
  )
}
