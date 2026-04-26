import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export const getVSCodeApi = (): VSCodeApi => {
  if (!vscodeApi) {
    vscodeApi = window.acquireVsCodeApi()
  }
  return vscodeApi
}

// Query keys
export const queryKeys = {
  branches: ['git', 'branches'] as const,
  commits: (branches?: GitBranch[]) => ['git', 'commits', { branches: branches?.map(b => b.name) }] as const,
  stashes: ['git', 'stashes'] as const,
  infiniteCommits: (branches?: GitBranch[]) =>
    ['git', 'infinite-commits', { branches: branches?.map(b => b.name) }] as const,
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

// Custom hook for fetching commits with infinite loading
export const useInfiniteGitCommits = (branches?: GitBranch[], maxCount: number = 100) => {
  const branchNames = branches?.map(b => b.name)

  return useInfiniteQuery({
    queryKey: queryKeys.infiniteCommits(branches),
    queryFn: ({ pageParam = 0 }): Promise<{ commits: GitCommit[]; hasMore: boolean; skip: number }> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitCommits') {
            window.removeEventListener('message', messageHandler)
            resolve({
              commits: message.commits,
              hasMore: message.hasMore,
              skip: message.skip,
            })
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'getGitCommits',
          branches: branchNames && branchNames.length > 0 ? branchNames : undefined,
          maxCount: maxCount,
          skip: pageParam,
        })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch commits'))
        }, 15000)
      })
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.skip + maxCount : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: branches && branches.length > 0,
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
