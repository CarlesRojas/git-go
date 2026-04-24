import React from 'react'
import { Graph } from './Graph'

export const App: React.FC = () => {
  return (
    <div
      className="flex min-h-screen min-w-screen flex-col font-medium"
      style={{
        backgroundColor: 'var(--vscode-editor-background)',
        color: 'var(--vscode-editor-foreground)',
        fontFamily:
          '"Monaspace Neon", "JetBrains Mono", "JetBrainsMono Nerd Font", "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace',
      }}
    >
      <Graph />
    </div>
  )
}
