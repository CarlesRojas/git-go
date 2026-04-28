import { TreeDataItem } from '@/component/Tree'
import { buildFileTree } from '@/util/buildFileTree'
import type { GitBranch, GitCommit, GitFileChange } from '@git/gitService'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
  commitFiles: (commitHash: string) => ['git', 'commit-files', { commitHash }] as const,
  stashes: ['git', 'stashes'] as const,
  infiniteCommits: (branches?: GitBranch[]) =>
    ['git', 'infinite-commits', { branches: branches?.map(b => b.name) }] as const,
  workingChanges: ['git', 'working-changes'] as const,
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
        }, 10_000)
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
export const useInfiniteGitCommits = (branches?: GitBranch[], maxCount: number = 200) => {
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

interface GitCommitFilesProps {
  commitHash: string
  isRootCommit?: boolean
  enabled?: boolean
}

export const useGitCommitFiles = ({ commitHash, isRootCommit = false, enabled = true }: GitCommitFilesProps) => {
  return useQuery({
    queryKey: queryKeys.commitFiles(commitHash),
    queryFn: (): Promise<TreeDataItem[]> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitCommitFiles') {
            window.removeEventListener('message', messageHandler)
            resolve(buildFileTree(message.files, commitHash, isRootCommit))
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'getCommitFiles',
          commitHash: commitHash,
        })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch commit files'))
        }, 10_000)
      })
    },
    enabled: !!commitHash && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

const refreshGitData = async (queryClient: any) => {
  await queryClient.invalidateQueries({ queryKey: ['git'] })
}

// Hook to refresh git data
export const useRefreshGitData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await refreshGitData(queryClient)
    },
  })
}

export const useWorkingChanges = (includeFiles: boolean = false) => {
  return useQuery({
    queryKey: [...queryKeys.workingChanges, { includeFiles }],
    queryFn: (): Promise<{ commit: GitCommit; files: GitFileChange[] } | null> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'workingChanges') {
            window.removeEventListener('message', messageHandler)
            resolve(message.workingChanges)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'getWorkingChanges',
          includeFiles: includeFiles,
        })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch working changes'))
        }, 10_000)
      })
    },
    staleTime: 30 * 1000, // 30 seconds - working changes change frequently
    gcTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook to add a tag at a specific commit
export const useAddTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commitHash,
      tagName,
      tagMessage,
      tagType = 'annotated',
    }: {
      commitHash: string
      tagName: string
      tagMessage?: string
      tagType?: 'annotated' | 'lightweight'
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'tagCreated') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'addTag',
          commitHash,
          tagName,
          tagMessage,
          tagType,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to add tag'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to create a branch from a specific commit
export const useCreateBranchFromCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commitHash,
      branchName,
      checkout = false,
    }: {
      commitHash: string
      branchName: string
      checkout?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'branchCreated') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'createBranchFromCommit',
          commitHash,
          branchName,
          checkout,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to create branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to cherry-pick a commit
export const useCherryPickCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commitHash,
      recordOrigin = false,
      commitChanges = true,
    }: {
      commitHash: string
      recordOrigin?: boolean
      commitChanges?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'commitCherryPicked') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'cherryPickCommit',
          commitHash,
          recordOrigin,
          commitChanges,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to cherry-pick commit'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to revert a commit
export const useRevertCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commitHash, commitChanges }: { commitHash: string; commitChanges?: boolean }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'commitReverted') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'revertCommit',
          commitHash,
          commitChanges,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to revert commit'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const openFile = (file: GitFileChange, commitHash?: string, isRootCommit?: boolean): void => {
  const vscode = getVSCodeApi()

  vscode.postMessage({
    type: 'openFile',
    filePath: file.path,
    oldPath: file.oldPath,
    status: file.status,
    commitHash,
    isRootCommit: isRootCommit ?? false,
    isUncommitted: commitHash === 'working-changes',
  })
}
