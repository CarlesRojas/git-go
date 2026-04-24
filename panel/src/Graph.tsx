import React, { useEffect, useState } from 'react'
import { CommitItem } from './CommitItem'
import type { GitCommit } from '../../src/gitService'

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
    <div className="flex flex-col p-4">
      {commits.map(commit => (
        <CommitItem key={commit.hash} commit={commit} />
      ))}
    </div>
  )
}
