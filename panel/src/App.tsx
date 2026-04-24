import React from 'react'
import { Graph } from './Graph'

export const App: React.FC = () => {
  return (
    <div
      className="flex min-h-screen min-w-screen flex-col"
      style={{
        backgroundColor: 'var(--vscode-editor-background)',
        color: 'var(--vscode-editor-foreground)',
      }}
    >
      <header
        className="border-opacity-20 border-b p-4"
        style={{
          borderColor: 'var(--vscode-widget-border, rgba(255,255,255,0.1))',
        }}
      >
        <h1 className="text-xl font-bold">GitGo Git Graph</h1>
      </header>

      <main className="flex-1 overflow-auto">
        <Graph />
      </main>
    </div>
  )
}
