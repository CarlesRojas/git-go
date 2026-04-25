// Alternative implementation using commit hash-based pagination
// This is more reliable than skip-based pagination for git repositories

import { useInfiniteQuery } from '@tanstack/react-query'
import type { GitBranch, GitCommit } from '../../../src/gitService'
import { getVSCodeApi } from './useGitQueries'

interface GitCommitPage {
  commits: GitCommit[]
  hasMore: boolean
  lastCommitHash?: string // For hash-based pagination
}

/**
 * Alternative infinite query that uses commit hashes for pagination
 * This is more reliable for git repositories as it handles concurrent commits better
 */
export const useInfiniteGitCommitsWithHash = (branches?: GitBranch[], maxCount: number = 50) => {
  const branchNames = branches?.map(b => b.name)

  return useInfiniteQuery({
    queryKey: ['git', 'infinite-commits-hash', { branches: branchNames }],
    queryFn: ({ pageParam }: { pageParam: string | undefined }): Promise<GitCommitPage> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitCommits') {
            window.removeEventListener('message', messageHandler)

            const commits: GitCommit[] = message.commits || []
            const lastCommitHash = commits.length > 0 ? commits[commits.length - 1]?.hash : undefined

            resolve({
              commits,
              hasMore: message.hasMore,
              lastCommitHash,
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
          skipAfterHash: pageParam, // Use commit hash instead of skip count
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch commits'))
        }, 15000)
      })
    },
    initialPageParam: undefined as string | undefined, // Start with no hash (get latest commits)
    getNextPageParam: lastPage => {
      // Return the last commit hash if more pages are available
      return lastPage.hasMore ? lastPage.lastCommitHash : undefined
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Bidirectional infinite query for loading commits in both directions
 * Useful for jumping to specific commits and loading context around them
 * NOTE: This is a placeholder implementation - requires additional git service methods
 */
export const useBidirectionalInfiniteCommits = (
  branches?: GitBranch[],
  initialCommitHash?: string,
  maxCount: number = 50,
) => {
  // This would require implementing both getNextPageParam and getPreviousPageParam
  // and handling the more complex data structure
  // Currently disabled due to incomplete implementation

  throw new Error('useBidirectionalInfiniteCommits is not yet implemented - requires additional git service methods')

  /*
  return useInfiniteQuery({
    queryKey: ['git', 'bidirectional-commits', { branches: branches?.map(b => b.name), initialCommitHash }],
    queryFn: ({ pageParam, direction = 'next' }) => {
      // Implementation would handle both forward and backward pagination
      // This requires more complex git commands using commit ranges
      throw new Error('Not implemented - requires additional git service methods')
    },
    initialPageParam: initialCommitHash,
    getNextPageParam: lastPage => (lastPage.hasMoreAfter ? lastPage.lastCommitHash : undefined),
    getPreviousPageParam: firstPage => (firstPage.hasMoreBefore ? firstPage.firstCommitHash : undefined),
  })
  */
}
