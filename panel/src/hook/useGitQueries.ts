import { TreeDataItem } from '@/component/Tree'
import { buildFileTree } from '@/util/buildFileTree'
import { sendCorrelatedMessage } from '@/util/sendCorrelatedMessage'
import type { GitBranch, GitCommit, GitFileChange, GitRemote } from '@git/gitService'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

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

export interface RepoState {
  selectedBranches: string[]
  showStashes: boolean
  showTags: boolean
  showRemotes: boolean
  hiddenRemotes: string[]
}

const defaultRepoState: RepoState = {
  selectedBranches: [],
  showStashes: true,
  showTags: true,
  showRemotes: true,
  hiddenRemotes: [],
}

export interface ConfigState {
  rounded: boolean
  autoOpenEnabled: boolean
  pinTabEnabled: boolean
  branchCreateCheckout: boolean
  branchDeleteForce: boolean
  branchPushSetUpstream: boolean
  branchRebaseIgnoreDate: boolean
  mergeFastForwardIfPossible: boolean
  mergeSquash: boolean
  mergeNoCommit: boolean
  cherryPickRecordOrigin: boolean
  cherryPickNoCommit: boolean
  revertNoCommit: boolean
  remoteFetchForceFetch: boolean
  stashIncludeUntracked: boolean
  expandedCommitHeight: number
}

const defaultConfigState: ConfigState = {
  rounded: true,
  autoOpenEnabled: false,
  pinTabEnabled: true,
  branchCreateCheckout: true,
  branchDeleteForce: false,
  branchPushSetUpstream: true,
  branchRebaseIgnoreDate: true,
  mergeFastForwardIfPossible: true,
  mergeSquash: false,
  mergeNoCommit: false,
  cherryPickRecordOrigin: false,
  cherryPickNoCommit: true,
  revertNoCommit: true,
  remoteFetchForceFetch: false,
  stashIncludeUntracked: true,
  expandedCommitHeight: 300,
}

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
  repoName: ['git', 'repo-name'] as const,
  gitUserConfig: ['git', 'user-config'] as const,
  tagDetails: (tagName: string) => ['git', 'tag-details', tagName] as const,
  state: (key: string) => ['state', key] as const,
}

export const useGitBranches = () => {
  return useQuery({
    queryKey: queryKeys.branches,
    queryFn: async (): Promise<GitBranch[]> => {
      const response = await sendCorrelatedMessage<{ branches: GitBranch[] }>('getGitBranches')
      return response.branches
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useGitRemotes = () => {
  return useQuery({
    queryKey: queryKeys.remotes,
    queryFn: async (): Promise<GitRemote[]> => {
      const response = await sendCorrelatedMessage<{ remotes: GitRemote[] }>('getGitRemotes')
      return response.remotes
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useGitCommits = (branches?: GitBranch[]) => {
  const branchNames = branches?.map(b => b.name)

  return useQuery({
    queryKey: queryKeys.commits(branches),
    queryFn: async (): Promise<GitCommit[]> => {
      const response = await sendCorrelatedMessage<{ commits: GitCommit[] }>(
        'getGitCommits',
        { branches: branchNames && branchNames.length > 0 ? branchNames : undefined },
        15000,
      )
      return response.commits
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useInfiniteGitCommits = (branches?: GitBranch[], maxCount: number = 200) => {
  const branchNames = branches?.map(b => b.name)

  return useInfiniteQuery({
    queryKey: queryKeys.infiniteCommits(branches),
    queryFn: async ({ pageParam = 0 }): Promise<{ commits: GitCommit[]; hasMore: boolean; skip: number }> => {
      const response = await sendCorrelatedMessage<{ commits: GitCommit[]; hasMore: boolean; skip: number }>(
        'getGitCommits',
        {
          branches: branchNames && branchNames.length > 0 ? branchNames : undefined,
          maxCount: maxCount,
          skip: pageParam,
        },
        15000,
      )

      return { commits: response.commits, hasMore: response.hasMore, skip: response.skip }
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      return lastPage.hasMore ? lastPage.skip + maxCount : undefined
    },
    placeholderData: previousData => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: branches && branches.length > 0,
  })
}

interface GitCommitFilesProps {
  commitHash: string
  isRootCommit?: boolean
  isStash?: boolean
  enabled?: boolean
}

export const useGitCommitFiles = ({
  commitHash,
  isRootCommit = false,
  isStash = false,
  enabled = true,
}: GitCommitFilesProps) => {
  return useQuery({
    queryKey: queryKeys.commitFiles(commitHash),
    queryFn: async (): Promise<TreeDataItem[]> => {
      const response = await sendCorrelatedMessage<{ files: GitFileChange[] }>('getCommitFiles', {
        commitHash: commitHash,
        isStash: isStash,
      })
      return buildFileTree(response.files, commitHash, isRootCommit, isStash)
    },
    enabled: !!commitHash && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

const refreshGitData = async (queryClient: any) => {
  await queryClient.invalidateQueries({ queryKey: ['git'] })
}

export const useFetchFromGit = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await sendCorrelatedMessage('fetch', {}, 30_000)
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
    queryFn: async (): Promise<{ commit: GitCommit; files: GitFileChange[] } | null> => {
      const response = await sendCorrelatedMessage<{
        workingChanges: { commit: GitCommit; files: GitFileChange[] } | null
      }>('getWorkingChanges', { includeFiles: includeFiles })
      return response.workingChanges
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

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
      return await sendCorrelatedMessage('addTag', { commitHash, tagName, tagMessage, tagType })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

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
      return await sendCorrelatedMessage('createBranchFromCommit', { commitHash, branchName, checkout })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

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
      return await sendCorrelatedMessage('cherryPickCommit', { commitHash, recordOrigin, noCommit })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRevertCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commitHash, noCommit }: { commitHash: string; noCommit?: boolean }) => {
      return await sendCorrelatedMessage('revertCommit', { commitHash, noCommit })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const openFile = (file: GitFileChange, commitHash?: string, isRootCommit?: boolean, isStash?: boolean): void => {
  const vscode = getVSCodeApi()

  vscode.postMessage({
    type: 'openFile',
    filePath: file.path,
    oldPath: file.oldPath,
    status: file.status,
    commitHash,
    sourceCommit: file.sourceCommit,
    isRootCommit: isRootCommit ?? false,
    isUncommitted: commitHash === 'working-changes',
    isStash: isStash ?? false,
  })
}

export const useCheckoutLocalBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName }: { branchName: string }) => {
      return await sendCorrelatedMessage('checkoutLocalBranch', { branchName })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

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
      return sendCorrelatedMessage('checkoutRemoteBranch', { remoteBranchName, localBranchName })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useCurrentBranch = () => {
  return useQuery({
    queryKey: queryKeys.currentBranch,
    queryFn: async (): Promise<string | null> => {
      const response = await sendCorrelatedMessage<{ currentBranch: string | null }>('getCurrentBranch')
      return response.currentBranch
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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
      return await sendCorrelatedMessage('pushBranch', { branchName, remote, setUpstream, pushMode }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRenameBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      return sendCorrelatedMessage('renameBranch', { oldName, newName })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useDeleteBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, force = false }: { branchName: string; force?: boolean }) => {
      return sendCorrelatedMessage('deleteBranch', { branchName, force })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useMergeBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      branchName,
      fastForwardIfPossible = false,
      squash = false,
      noCommit = false,
    }: {
      branchName: string
      fastForwardIfPossible?: boolean
      squash?: boolean
      noCommit?: boolean
    }) => {
      return await sendCorrelatedMessage('mergeBranch', { branchName, fastForwardIfPossible, squash, noCommit }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRebaseBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, ignoreDate = false }: { branchName: string; ignoreDate?: boolean }) => {
      return await sendCorrelatedMessage('rebaseBranch', { branchName, ignoreDate }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

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
      return await sendCorrelatedMessage('applyStash', { stashSelector, reinstateIndex }, 10_000)
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
      return await sendCorrelatedMessage('popStash', { stashSelector, reinstateIndex }, 10_000)
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
      return await sendCorrelatedMessage('dropStash', { stashSelector }, 10_000)
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
      return await sendCorrelatedMessage('createStash', { message, includeUntracked }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useDeleteRemoteBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ branchName, remote }: { branchName: string; remote: string }) => {
      return await sendCorrelatedMessage('deleteRemoteBranch', { branchName, remote }, 10_000)
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
      return await sendCorrelatedMessage(
        'fetchIntoLocalBranch',
        { remote, remoteBranch, localBranch, forceFetch },
        30_000,
      )
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useGetTagDetails = (tagName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tagDetails(tagName),
    queryFn: async (): Promise<{
      hash: string
      taggerName: string
      taggerEmail: string
      taggerDate: string
      message: string
    }> => {
      const response = await sendCorrelatedMessage<{
        details: { hash: string; taggerName: string; taggerEmail: string; taggerDate: string; message: string }
      }>('getTagDetails', { tagName }, 10_000)
      return response.details
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
      return await sendCorrelatedMessage('pushTag', { tagName, remotes }, 30_000)
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
      return await sendCorrelatedMessage('deleteTag', { tagName, deleteOnRemote }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

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
      return await sendCorrelatedMessage('resetUncommittedChanges', { mode }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRepoState = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.state('repoState'),
    queryFn: async (): Promise<RepoState | null> => {
      try {
        const response = await sendCorrelatedMessage<{ value: RepoState | null }>(
          'loadRepoState',
          { key: 'repoState' },
          3000,
        )
        const loadedState = response.value ? { ...defaultRepoState, ...response.value } : defaultRepoState
        return loadedState
      } catch (error) {
        return null
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })

  const setRepoState = useCallback(
    (value: Partial<RepoState>) => {
      const currentState = query.data ?? defaultRepoState
      const newState = { ...currentState, ...value }
      const vscode = getVSCodeApi()
      vscode.postMessage({ type: 'saveRepoState', key: 'repoState', value: newState })
      queryClient.setQueryData(queryKeys.state('repoState'), newState)
    },
    [query.data, queryClient],
  )

  return {
    data: query.data ?? defaultRepoState,
    isLoading: query.isLoading,
    setRepoState,
  }
}

export const useConfig = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.state('config'),
    queryFn: async (): Promise<ConfigState | null> => {
      try {
        const response = await sendCorrelatedMessage<{ config: ConfigState | null }>('getConfig', {}, 3000)
        return response.config ?? null
      } catch (error) {
        return null
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'configChanged' || event.data.type === 'config') {
        queryClient.setQueryData(queryKeys.state('config'), event.data.config)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [queryClient])

  return {
    data: query.data ?? defaultConfigState,
    isLoading: query.isLoading,
  }
}

export const useRepoName = () => {
  return useQuery({
    queryKey: queryKeys.repoName,
    queryFn: async (): Promise<string> => {
      const response = await sendCorrelatedMessage<{ name: string }>('getRepoName', {}, 10_000)
      return response.name
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useGitUserConfig = () => {
  return useQuery({
    queryKey: queryKeys.gitUserConfig,
    queryFn: async (): Promise<{ userName: string; userEmail: string; isLocal: boolean }> => {
      const response = await sendCorrelatedMessage<{
        config: { userName: string; userEmail: string; isLocal: boolean }
      }>('getGitUserConfig', {}, 10_000)
      return response.config
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

export const useSetGitUserConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: { userName?: string; userEmail?: string; isLocal: boolean }) => {
      return await sendCorrelatedMessage('setGitUserConfig', { config }, 10_000)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gitUserConfig })
    },
  })
}

export const useAddGitRemote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (remote: { name: string; fetchUrl: string; pushUrl: string }) => {
      return await sendCorrelatedMessage('addGitRemote', { remote }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRemoveGitRemote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (remoteName: string) => {
      return await sendCorrelatedMessage('removeGitRemote', { remoteName }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useOpenSettings = () => {
  return useMutation({
    mutationFn: async (query: string = '@ext:git-go') => {
      return await sendCorrelatedMessage('openSettings', { query }, 5_000)
    },
  })
}
