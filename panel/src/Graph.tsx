import React, { useEffect, useState } from 'react'

interface GitCommit {
  hash: string
  author: string
  date: string
  message: string
  refs?: string
}

interface VSCodeApi {
  postMessage(message: any): void
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeApi
  }
}

export const Graph: React.FC = () => {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const vscode = window.acquireVsCodeApi()

    const messageHandler = (event: MessageEvent) => {
      const message = event.data

      switch (message.type) {
        case 'gitCommits':
          setCommits(message.commits)
          setLoading(false)
          break
        case 'gitError':
          setError(message.error)
          setLoading(false)
          break
      }
    }

    window.addEventListener('message', messageHandler)

    vscode.postMessage({ type: 'getGitCommits' })

    return () => {
      window.removeEventListener('message', messageHandler)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-current"></div>
        <p>Loading git history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-red-400">
        <p>Error loading git history:</p>
        <p className="font-mono text-sm">{error}</p>
      </div>
    )
  }

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-center text-gray-400">No commits found in this repository.</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      {commits.map(commit => (
        <div
          key={commit.hash}
          className="border-opacity-20 flex items-start gap-4 rounded-lg border p-4"
          style={{
            backgroundColor: 'var(--vscode-list-inactiveSelectionBackground, rgba(255,255,255,0.04))',
            borderColor: 'var(--vscode-widget-border, rgba(255,255,255,0.1))',
          }}
        >
          <div
            className="mt-2 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--vscode-gitDecoration-addedResourceForeground, #4caf50)' }}
          />

          <div className="min-w-0 grow">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-gray-400">{commit.hash.substring(0, 8)}</span>
              {commit.refs && (
                <span
                  className="rounded px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--vscode-badge-background)',
                    color: 'var(--vscode-badge-foreground)',
                  }}
                >
                  {commit.refs}
                </span>
              )}
            </div>

            <p className="font-medium">{commit.message}</p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{commit.author}</span>
              <span>{new Date(commit.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
