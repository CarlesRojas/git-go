import React from 'react'

export const App: React.FC = () => {
  return (
    <div className="flex min-h-screen min-w-screen max-h-screen max-w-screen flex-col items-center justify-center p-4" style={{
      backgroundColor: 'var(--vscode-editor-background)',
      color: 'var(--vscode-editor-foreground)'
    }}>
      <h1 className="mb-4 text-3xl font-bold">GitGo Git Graph</h1>

      <p className="mb-2">This is a placeholder for the git graph UI.</p>

      {/* TODO: Implement git graph visualization */}
    </div>
  )
}
