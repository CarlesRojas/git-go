import { TreeDataItem } from '@/component/Tree'
import { buildFileTree } from '@/util/buildFileTree'
import type { GitBranch, GitCommit, GitFileChange, GitRemote } from '@git/gitService'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

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

interface GlobalState {
  selectedBranches: string[]
}

const defaultGlobalState: GlobalState = {
  selectedBranches: [],
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
  currentBranch: ['git', 'current-branch'] as const,
  remotes: ['git', 'remotes'] as const,
  state: (key: string) => ['state', key] as const,
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

// Custom hook for fetching remotes
export const useGitRemotes = () => {
  return useQuery({
    queryKey: queryKeys.remotes,
    queryFn: (): Promise<GitRemote[]> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'gitRemotes') {
            window.removeEventListener('message', messageHandler)
            resolve(message.remotes)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({ type: 'getGitRemotes' })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch remotes'))
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
  isStash?: boolean
  enabled?: boolean
}

export const useGitCommitFiles = ({ commitHash, isRootCommit = false, isStash = false, enabled = true }: GitCommitFilesProps) => {
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
          isStash: isStash,
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

// Hook to fetch from git and refresh git data
export const useFetchFromGit = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'fetchComplete') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({ type: 'fetch' })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch from git'))
        }, 30_000) // Longer timeout for network operations
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
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
      noCommit = false,
    }: {
      commitHash: string
      recordOrigin?: boolean
      noCommit?: boolean
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
          noCommit,
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
    mutationFn: async ({ commitHash, noCommit }: { commitHash: string; noCommit?: boolean }) => {
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
          noCommit,
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

// Hook to checkout a local branch
export const useCheckoutLocalBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName }: { branchName: string }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'branchCheckedOut' && message.isLocal) {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'checkoutLocalBranch',
          branchName,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to checkout local branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to checkout a remote branch (creates local branch)
export const useCheckoutRemoteBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      remoteBranchName,
      localBranchName,
    }: {
      remoteBranchName: string
      localBranchName: string
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'branchCheckedOut' && !message.isLocal) {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'checkoutRemoteBranch',
          remoteBranchName,
          localBranchName,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to checkout remote branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Custom hook for fetching current branch
export const useCurrentBranch = () => {
  return useQuery({
    queryKey: queryKeys.currentBranch,
    queryFn: (): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'currentBranch') {
            window.removeEventListener('message', messageHandler)
            resolve(message.currentBranch)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({ type: 'getCurrentBranch' })

        // Cleanup timeout to prevent memory leaks
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch current branch'))
        }, 10_000)
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook to push a branch
export const usePushBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      branchName,
      remote = 'origin',
      setUpstream = false,
      pushMode = 'normal',
    }: {
      branchName: string
      remote?: string
      setUpstream?: boolean
      pushMode?: 'normal' | 'force-with-lease' | 'force'
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'pushBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'pushBranch',
          branchName,
          remote,
          setUpstream,
          pushMode,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to push branch'))
        }, 30_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to rename a branch
export const useRenameBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'renameBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'renameBranch',
          oldName,
          newName,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to rename branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to delete a branch
export const useDeleteBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, force = false }: { branchName: string; force?: boolean }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'deleteBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'deleteBranch',
          branchName,
          force,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to delete branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to merge a branch into current branch
export const useMergeBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      branchName,
      fastFordwardIfPossible = false,
      squash = false,
      noCommit = false,
    }: {
      branchName: string
      fastFordwardIfPossible?: boolean
      squash?: boolean
      noCommit?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'mergeBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'mergeBranch',
          branchName,
          fastFordwardIfPossible,
          squash,
          noCommit,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to merge branch'))
        }, 30_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Hook to rebase current branch onto target branch
export const useRebaseBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, ignoreDate = false }: { branchName: string; ignoreDate?: boolean }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'rebaseBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'rebaseBranch',
          branchName,
          ignoreDate,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to rebase branch'))
        }, 30_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Stash operations

export const useApplyStash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stashSelector,
      reinstateIndex = false,
    }: {
      stashSelector: string
      reinstateIndex?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'applyStashSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'applyStash',
          stashSelector,
          reinstateIndex,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to apply stash'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const usePopStash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stashSelector,
      reinstateIndex = false,
    }: {
      stashSelector: string
      reinstateIndex?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'popStashSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'popStash',
          stashSelector,
          reinstateIndex,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to pop stash'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useDropStash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ stashSelector }: { stashSelector: string }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'dropStashSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'dropStash',
          stashSelector,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to drop stash'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useCreateStash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      message = '',
      includeUntracked = false,
    }: {
      message?: string
      includeUntracked?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const messageData = event.data

          if (messageData.type === 'createStashSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(messageData)
          } else if (messageData.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(messageData.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'createStash',
          message,
          includeUntracked,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to create stash'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Remote branch operations

export const useDeleteRemoteBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, remote }: { branchName: string; remote: string }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'deleteRemoteBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'deleteRemoteBranch',
          branchName,
          remote,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to delete remote branch'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useFetchIntoLocalBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      remote,
      remoteBranch,
      localBranch,
      forceFetch = false,
    }: {
      remote: string
      remoteBranch: string
      localBranch: string
      forceFetch?: boolean
    }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'fetchIntoLocalBranchSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'fetchIntoLocalBranch',
          remote,
          remoteBranch,
          localBranch,
          forceFetch,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to fetch into local branch'))
        }, 30_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Tag operations

export const useGetTagDetails = (tagName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['git', 'tag-details', tagName],
    queryFn: (): Promise<{
      hash: string
      taggerName: string
      taggerEmail: string
      taggerDate: string
      message: string
    }> => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'tagDetails') {
            window.removeEventListener('message', messageHandler)
            resolve(message.details)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'getTagDetails',
          tagName,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to get tag details'))
        }, 10_000)
      })
    },
    enabled: !!tagName && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePushTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tagName, remotes }: { tagName: string; remotes: string[] }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'pushTagSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'pushTag',
          tagName,
          remotes,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to push tag'))
        }, 30_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tagName, deleteOnRemote }: { tagName: string; deleteOnRemote?: string }) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'deleteTagSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'deleteTag',
          tagName,
          deleteOnRemote,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to delete tag'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

// Uncommitted changes operations

export const useStashUncommittedChanges = () => {
  return useCreateStash()
}

export const useResetUncommittedChanges = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mode = 'hard',
    }: {
      mode?: 'mixed' | 'hard'
    } = {}) => {
      return new Promise((resolve, reject) => {
        const vscode = getVSCodeApi()

        const messageHandler = (event: MessageEvent) => {
          const message = event.data

          if (message.type === 'resetUncommittedChangesSuccess') {
            window.removeEventListener('message', messageHandler)
            resolve(message)
          } else if (message.type === 'gitError') {
            window.removeEventListener('message', messageHandler)
            reject(new Error(message.error))
          }
        }

        window.addEventListener('message', messageHandler)
        vscode.postMessage({
          type: 'resetUncommittedChanges',
          mode,
        })

        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          reject(new Error('Timeout: Failed to reset uncommitted changes'))
        }, 10_000)
      })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useGlobalState = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.state('globalState'),
    queryFn: (): Promise<GlobalState | null> => {
      return new Promise(resolve => {
        const vscode = getVSCodeApi()

        const handler = (event: MessageEvent) => {
          console.log('LOAD', event.data.value)
          if (event.data.type === 'stateLoaded' && event.data.key === 'globalState') {
            window.removeEventListener('message', handler)
            resolve(event.data.value ?? null)
          }
        }

        window.addEventListener('message', handler)
        vscode.postMessage({ type: 'loadState', key: 'globalState' })

        setTimeout(() => {
          window.removeEventListener('message', handler)
          resolve(null)
        }, 3000)
      })
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const setGlobalState = useCallback(
    (value: Partial<GlobalState>) => {
      const currentState = query.data ?? defaultGlobalState
      const newState = { ...currentState, ...value }
      const vscode = getVSCodeApi()
      console.log('SAVE', newState)
      vscode.postMessage({ type: 'saveState', key: 'globalState', value: newState })
      queryClient.setQueryData(queryKeys.state('globalState'), newState)
    },
    [query.data, queryClient],
  )

  return {
    data: query.data ?? defaultGlobalState,
    isLoading: query.isLoading,
    setGlobalState,
  }
}
