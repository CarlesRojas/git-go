import { TreeDataItem } from '@/component/Tree'
import { buildFileTree } from '@/util/buildFileTree'
import { sendCorrelatedMessage } from '@/util/sendCorrelatedMessage'
import type {
  GitBranch,
  GitCommit,
  GitFileChange,
  GitOperationInProgress,
  GitPushMode,
  GitRemote,
  GitTagRemoteStatus,
  GitUndoActionKind,
  GitUndoableAction,
  GitWorktree,
} from '@git/gitService'
import type { GitRepo } from '@git/repoService'
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
  dragAndDropEnabled: boolean
  dragAndDropBranchDefaultAction: 'merge' | 'rebase' | 'none'
  dragAndDropHoldDelay: number
  dragAndDropHideDelay: number
  dragAndDropAutoMerge: boolean
  dragAndDropAutoRebase: boolean
  dragAndDropAutoCherryPick: boolean
  dragAndDropAutoMergeCommit: boolean
  dragAndDropAutoPush: boolean
  dragAndDropAutoFetchIntoLocal: boolean
  branchCreateCheckout: boolean
  branchDeleteForce: boolean
  branchDeleteOnRemote: boolean
  branchPushSetUpstream: boolean
  branchPushMode: GitPushMode
  mergeFastForwardIfPossible: boolean
  mergeSquash: boolean
  mergeNoCommit: boolean
  rebaseIgnoreDate: boolean
  rebaseAutoStash: boolean
  cherryPickRecordOrigin: boolean
  cherryPickNoCommit: boolean
  revertNoCommit: boolean
  resetMode: 'soft' | 'mixed' | 'hard'
  remoteDefaultRemote: string
  remoteFetchForceFetch: boolean
  remoteFetchCheckout: boolean
  remoteFetchConfirmOnlyIfForceNeeded: boolean
  stashIncludeUntracked: boolean
  stashReinstateIndex: boolean
  tagType: 'annotated' | 'lightweight'
  tagPushAllRemotes: boolean
  tagDeleteOnRemotes: boolean
  worktreeDefaultPath: string
  worktreeOpenBehavior: 'ask' | 'newWindow' | 'currentWindow'
  worktreeOpenAfterCreate: boolean
  worktreeRemoveForce: boolean
  worktreeRemoveDeleteBranch: boolean
  undoEnabled: boolean
  undoKeyboardShortcut: boolean
  undoShow: Record<GitUndoActionKind, boolean>
  confirmMerge: boolean
  confirmRebase: boolean
  confirmPush: boolean
  confirmBranchDelete: boolean
  expandedCommitHeight: number
  showAuthorName: boolean
  theme: string
  customColors: string[]
}

const defaultConfigState: ConfigState = {
  rounded: true,
  autoOpenEnabled: false,
  pinTabEnabled: true,
  dragAndDropEnabled: true,
  dragAndDropBranchDefaultAction: 'merge',
  dragAndDropHoldDelay: 300,
  dragAndDropHideDelay: 300,
  dragAndDropAutoMerge: false,
  dragAndDropAutoRebase: false,
  dragAndDropAutoCherryPick: false,
  dragAndDropAutoMergeCommit: false,
  dragAndDropAutoPush: false,
  dragAndDropAutoFetchIntoLocal: false,
  branchCreateCheckout: true,
  branchDeleteForce: false,
  branchDeleteOnRemote: false,
  branchPushSetUpstream: true,
  branchPushMode: 'normal',
  mergeFastForwardIfPossible: true,
  mergeSquash: false,
  mergeNoCommit: false,
  rebaseIgnoreDate: true,
  rebaseAutoStash: false,
  cherryPickRecordOrigin: false,
  cherryPickNoCommit: true,
  revertNoCommit: true,
  resetMode: 'mixed',
  remoteDefaultRemote: 'origin',
  remoteFetchForceFetch: false,
  remoteFetchCheckout: true,
  remoteFetchConfirmOnlyIfForceNeeded: false,
  stashIncludeUntracked: true,
  stashReinstateIndex: false,
  tagType: 'annotated',
  tagPushAllRemotes: false,
  tagDeleteOnRemotes: false,
  worktreeDefaultPath: '../{repo}.worktrees/{branch}',
  worktreeOpenBehavior: 'ask',
  worktreeOpenAfterCreate: true,
  worktreeRemoveForce: false,
  worktreeRemoveDeleteBranch: false,
  undoEnabled: true,
  undoKeyboardShortcut: true,
  undoShow: {
    commit: true,
    amend: true,
    merge: true,
    rebase: true,
    'cherry-pick': true,
    revert: true,
    reset: true,
    pull: true,
    other: true,
  },
  confirmMerge: true,
  confirmRebase: true,
  confirmPush: true,
  confirmBranchDelete: true,
  expandedCommitHeight: 300,
  showAuthorName: true,
  theme: 'vibrant',
  customColors: [],
}

export const queryKeys = {
  repos: ['repos'] as const,
  branches: ['git', 'branches'] as const,
  commits: (branches?: GitBranch[]) => ['git', 'commits', { branches: branches?.map(b => b.name) }] as const,
  commitFiles: (commitHash: string) => ['git', 'commit-files', { commitHash }] as const,
  stashes: ['git', 'stashes'] as const,
  infiniteCommits: (branches?: GitBranch[]) =>
    ['git', 'infinite-commits', { branches: branches?.map(b => b.name) }] as const,
  workingChanges: ['git', 'working-changes'] as const,
  currentBranch: ['git', 'current-branch'] as const,
  operationInProgress: ['git', 'operation-in-progress'] as const,
  undoableAction: ['git', 'undoable-action'] as const,
  worktrees: ['git', 'worktrees'] as const,
  remotes: ['git', 'remotes'] as const,
  repoName: ['git', 'repo-name'] as const,
  gitUserConfig: ['git', 'user-config'] as const,
  tagDetails: (tagName: string) => ['git', 'tag-details', tagName] as const,
  // Deliberately outside the 'git' namespace: resolving it hits the network (ls-remote),
  // so it must not be refetched by the blanket 'git' invalidation after every mutation
  tagRemotes: ['remote-tags'] as const,
  // Also outside the 'git' namespace: resolving it hits the remote's API
  avatar: (email: string) => ['avatar', email] as const,
  state: (key: string) => ['state', key] as const,
  theme: ['theme'] as const,
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

/**
 * Resolve an author's profile picture from the repository's remote, as a data URI.
 * Keyed by email only, so every commit by the same author shares a single lookup.
 * Resolves to null when the remote has no picture for that author, leaving Gravatar as the fallback.
 */
export const useAvatar = (email: string, commitHash?: string) => {
  return useQuery({
    queryKey: queryKeys.avatar(email),
    queryFn: async (): Promise<string | null> => {
      const response = await sendCorrelatedMessage<{ avatar: string | null }>('getAvatar', { email, commitHash }, 20000)
      return response.avatar ?? null
    },
    enabled: !!email && !!commitHash,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
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
    meta: { gitActionLabel: 'Fetching' },
    mutationFn: async () => {
      return await sendCorrelatedMessage('fetch', {}, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.tagRemotes })
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
    meta: { gitActionLabel: 'Creating tag' },
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
    meta: { gitActionLabel: 'Creating branch' },
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
    meta: { gitActionLabel: 'Cherry picking' },
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
    meta: { gitActionLabel: 'Reverting' },
    mutationFn: async ({ commitHash, noCommit }: { commitHash: string; noCommit?: boolean }) => {
      return await sendCorrelatedMessage('revertCommit', { commitHash, noCommit })
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useResetBranchToCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Resetting branch' },
    mutationFn: async ({ commitHash, mode }: { commitHash: string; mode: 'soft' | 'mixed' | 'hard' }) => {
      return await sendCorrelatedMessage('resetBranchToCommit', { commitHash, mode }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRebaseBranchToCommit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Rebasing' },
    mutationFn: async ({
      commitHash,
      ignoreDate = false,
      autoStash = false,
    }: {
      commitHash: string
      ignoreDate?: boolean
      autoStash?: boolean
    }) => {
      return await sendCorrelatedMessage('rebaseBranchToCommit', { commitHash, ignoreDate, autoStash }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useMergeCommitIntoCurrentBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Merging' },
    mutationFn: async ({
      commitHash,
      fastForwardIfPossible = true,
      squash = false,
      noCommit = false,
    }: {
      commitHash: string
      fastForwardIfPossible?: boolean
      squash?: boolean
      noCommit?: boolean
    }) => {
      return await sendCorrelatedMessage(
        'mergeCommitIntoCurrentBranch',
        { commitHash, fastForwardIfPossible, squash, noCommit },
        30_000,
      )
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
    mutationKey: ['checkoutLocalBranch'],
    meta: { gitActionLabel: 'Checking out' },
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
    mutationKey: ['checkoutRemoteBranch'],
    meta: { gitActionLabel: 'Checking out' },
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

export const useOperationInProgress = () => {
  return useQuery({
    queryKey: queryKeys.operationInProgress,
    queryFn: async (): Promise<GitOperationInProgress | null> => {
      const response = await sendCorrelatedMessage<{ operation: GitOperationInProgress | null }>(
        'getOperationInProgress',
      )
      return response.operation
    },
    staleTime: 5 * 1000,
    gcTime: 60 * 1000,
  })
}

export const useAbortOperation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Aborting' },
    mutationFn: async ({ operation }: { operation: GitOperationInProgress }) => {
      return await sendCorrelatedMessage('abortOperation', { operation }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useUndoableAction = (enabled = true) => {
  return useQuery({
    enabled,
    queryKey: queryKeys.undoableAction,
    queryFn: async (): Promise<GitUndoableAction | null> => {
      const response = await sendCorrelatedMessage<{ undoableAction: GitUndoableAction | null }>('getUndoableAction')
      return response.undoableAction
    },
    staleTime: 5 * 1000,
    gcTime: 60 * 1000,
  })
}

export const useUndoLastAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Undoing' },
    mutationFn: async ({ previousHash, discardChanges }: { previousHash: string; discardChanges: boolean }) => {
      return await sendCorrelatedMessage('undoLastAction', { previousHash, discardChanges }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useWorktrees = () => {
  return useQuery({
    queryKey: queryKeys.worktrees,
    queryFn: async (): Promise<GitWorktree[]> => {
      const response = await sendCorrelatedMessage<{ worktrees: GitWorktree[] }>('getWorktrees')
      return response.worktrees
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useAddWorktree = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['addWorktree'],
    meta: { gitActionLabel: 'Creating worktree' },
    mutationFn: async ({ worktreePath, branchName }: { worktreePath: string; branchName: string }) => {
      return await sendCorrelatedMessage<{ worktreePath: string }>('addWorktree', { worktreePath, branchName }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useRemoveWorktree = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['removeWorktree'],
    meta: { gitActionLabel: 'Removing worktree' },
    mutationFn: async ({
      worktreePath,
      force = false,
      deleteBranch,
    }: {
      worktreePath: string
      force?: boolean
      deleteBranch?: string
    }) => {
      return await sendCorrelatedMessage('removeWorktree', { worktreePath, force, deleteBranch }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const openWorktree = (worktreePath: string, newWindow: boolean): void => {
  const vscode = getVSCodeApi()
  vscode.postMessage({ type: 'openWorktree', worktreePath, newWindow })
}

export const usePushBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['pushBranch'],
    meta: { gitActionLabel: 'Pushing' },
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
    mutationKey: ['renameBranch'],
    meta: { gitActionLabel: 'Renaming branch' },
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
    mutationKey: ['deleteBranch'],
    meta: { gitActionLabel: 'Deleting branch' },
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
    mutationKey: ['mergeBranch'],
    meta: { gitActionLabel: 'Merging' },
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
    mutationKey: ['rebaseBranch'],
    meta: { gitActionLabel: 'Rebasing' },
    mutationFn: async ({
      branchName,
      ignoreDate = false,
      autoStash = false,
    }: {
      branchName: string
      ignoreDate?: boolean
      autoStash?: boolean
    }) => {
      return await sendCorrelatedMessage('rebaseBranch', { branchName, ignoreDate, autoStash }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useApplyStash = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['applyStash'],
    meta: { gitActionLabel: 'Applying stash' },
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
    mutationKey: ['popStash'],
    meta: { gitActionLabel: 'Popping stash' },
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
    mutationKey: ['dropStash'],
    meta: { gitActionLabel: 'Dropping stash' },
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
    meta: { gitActionLabel: 'Stashing' },
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
    mutationKey: ['deleteRemoteBranch'],
    meta: { gitActionLabel: 'Deleting remote branch' },
    mutationFn: async ({ branchName, remote }: { branchName: string; remote: string }) => {
      return await sendCorrelatedMessage('deleteRemoteBranch', { branchName, remote }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
    },
  })
}

export const useFetchIntoLocalBranchNeedsForce = () => {
  return useMutation({
    mutationKey: ['fetchIntoLocalBranchNeedsForce'],
    meta: { gitActionLabel: 'Checking remote' },
    mutationFn: async ({
      remote,
      remoteBranch,
      localBranch,
    }: {
      remote: string
      remoteBranch: string
      localBranch: string
    }) => {
      const response = await sendCorrelatedMessage<{ needsForce: boolean }>(
        'fetchIntoLocalBranchNeedsForce',
        { remote, remoteBranch, localBranch },
        30_000,
      )
      return response.needsForce
    },
  })
}

export const useFetchIntoLocalBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['fetchIntoLocalBranch'],
    meta: { gitActionLabel: 'Fetching' },
    mutationFn: async ({
      remote,
      remoteBranch,
      localBranch,
      forceFetch = false,
      checkout = false,
    }: {
      remote: string
      remoteBranch: string
      localBranch: string
      forceFetch?: boolean
      checkout?: boolean
    }) => {
      return await sendCorrelatedMessage(
        'fetchIntoLocalBranch',
        { remote, remoteBranch, localBranch, forceFetch, checkout },
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

export const useTagRemotes = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tagRemotes,
    queryFn: async (): Promise<GitTagRemoteStatus[]> => {
      const response = await sendCorrelatedMessage<{ tagRemotes: GitTagRemoteStatus[] }>('getTagRemotes', {}, 30_000)
      return response.tagRemotes
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const usePushTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['pushTag'],
    meta: { gitActionLabel: 'Pushing tag' },
    mutationFn: async ({ tagName, remotes }: { tagName: string; remotes: string[] }) => {
      return await sendCorrelatedMessage('pushTag', { tagName, remotes }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.tagRemotes })
    },
  })
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteTag'],
    meta: { gitActionLabel: 'Deleting tag' },
    mutationFn: async ({
      tagName,
      deleteOnRemotes = [],
      deleteLocal = true,
    }: {
      tagName: string
      deleteOnRemotes?: string[]
      deleteLocal?: boolean
    }) => {
      return await sendCorrelatedMessage('deleteTag', { tagName, deleteOnRemotes, deleteLocal }, 30_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.tagRemotes })
    },
  })
}

export const useStashUncommittedChanges = () => {
  return useCreateStash()
}

export const useResetUncommittedChanges = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Discarding changes' },
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

/**
 * The git repositories of the workspace folders and their subfolders, and the one being shown.
 */
export const useRepos = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.repos,
    queryFn: async (): Promise<{ repos: GitRepo[]; activeRepo: GitRepo | null }> => {
      const response = await sendCorrelatedMessage<{ repos: GitRepo[]; activeRepo: GitRepo | null }>(
        'getRepos',
        {},
        30_000,
      )
      return { repos: response.repos ?? [], activeRepo: response.activeRepo ?? null }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })

  // The workspace folders changing, or the depth Git Go scans to, can find other repositories
  const onReposChanged = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === 'reposChanged') queryClient.invalidateQueries({ queryKey: queryKeys.repos })
    },
    [queryClient],
  )

  useEffect(() => {
    window.addEventListener('message', onReposChanged)
    return () => window.removeEventListener('message', onReposChanged)
  }, [onReposChanged])

  return query
}

/**
 * Show another one of the workspace's repositories, dropping everything read from the previous one.
 */
export const useSetActiveRepo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Switching repository' },
    mutationFn: async (repoPath: string) => {
      return await sendCorrelatedMessage<{ activeRepo: GitRepo }>('setActiveRepo', { repoPath }, 10_000)
    },
    onSuccess: response => {
      queryClient.setQueryData(queryKeys.repos, (previous: { repos: GitRepo[] } | undefined) =>
        previous ? { ...previous, activeRepo: response.activeRepo } : previous,
      )
      // Everything else was read from the repository that is no longer being shown
      queryClient.removeQueries({ queryKey: ['git'] })
      queryClient.removeQueries({ queryKey: ['remote-tags'] })
      queryClient.removeQueries({ queryKey: ['avatar'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.state('repoState') })
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

enum ThemeKind {
  LIGHT = 'light',
  DARK = 'dark',
}

export const useThemeKind = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.theme,
    queryFn: async (): Promise<{ isDark?: boolean } | null> => {
      try {
        const response = await sendCorrelatedMessage<{ isDark: boolean }>('getTheme', {}, 3000)
        return { isDark: response.isDark }
      } catch (error) {
        return null
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'themeChanged') {
        queryClient.setQueryData(queryKeys.theme, { isDark: event.data.isDark })
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [queryClient])

  return {
    isDark: query.data?.isDark ?? undefined,
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
    meta: { gitActionLabel: 'Updating git user' },
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
    meta: { gitActionLabel: 'Adding remote' },
    mutationFn: async (remote: { name: string; fetchUrl: string; pushUrl: string }) => {
      return await sendCorrelatedMessage('addGitRemote', { remote }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.tagRemotes })
    },
  })
}

export const useRemoveGitRemote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    meta: { gitActionLabel: 'Removing remote' },
    mutationFn: async (remoteName: string) => {
      return await sendCorrelatedMessage('removeGitRemote', { remoteName }, 10_000)
    },
    onSuccess: () => {
      refreshGitData(queryClient)
      queryClient.invalidateQueries({ queryKey: queryKeys.tagRemotes })
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
