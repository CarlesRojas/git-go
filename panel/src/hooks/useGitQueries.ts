import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GitBranch, GitCommit } from '../../../src/gitService'

interface VSCodeApi {
  postMessage(message: any): void
}

declare global {
  interface Window {
    acquireVsCodeApi(): VSCodeApi
  }
}

let vscodeApi: VSCodeApi | null = null

const getVSCodeApi = (): VSCodeApi => {
  if (!vscodeApi) {
    vscodeApi = window.acquireVsCodeApi()
  }
  return vscodeApi
}

// Query keys
export const queryKeys = {
  branches: ['git', 'branches'] as const,
  commits: (branches?: GitBranch[]) => ['git', 'commits', { branches: branches?.map(b => b.name) }] as const,
}

// Custom hook for fetching branches
export const useGitBranches = () => {
  return useQuery({
    queryKey: queryKeys.branches,
    queryFn: (): Promise<GitBranch[]> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitBranches') {
            window.removeEventListener('message', messageHandler)
            resolve(message.branches)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({ type: 'getGitBranches' })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch branches'))
        }, 10000)
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Custom hook for fetching commits
export const useGitCommits = (branches?: GitBranch[]) => {
  const branchNames = branches?.map(b => b.name)

  return useQuery({
    queryKey: queryKeys.commits(branches),
    queryFn: (): Promise<GitCommit[]> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitCommits') {
            window.removeEventListener('message', messageHandler)
            resolve(message.commits)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'getGitCommits',
          branches: branchNames && branchNames.length > 0 ? branchNames : undefined,
        })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch commits'))
        }, 15000)
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to refresh git data
export const useRefreshGitData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['git'] })
    },
  })
}
