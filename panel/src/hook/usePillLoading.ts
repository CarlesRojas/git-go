import { GitBranch } from '@git/gitService'
import { useMutationState } from '@tanstack/react-query'

interface PendingPillMutation {
  key: string
  variables: Record<string, unknown>
}

/**
 * Every mutation that acts on a specific branch, tag or stash carries a mutationKey named after
 * its message, so pills can show their own spinner for operations targeting them no matter where
 * they were started — double click, context menu, dialog or drag and drop.
 */
export const usePendingPillMutations = (): PendingPillMutation[] =>
  useMutationState({
    filters: { status: 'pending', predicate: mutation => !!mutation.options.mutationKey },
    select: mutation => ({
      key: String((mutation.options.mutationKey as readonly unknown[])[0]),
      variables: (mutation.state.variables ?? {}) as Record<string, unknown>,
    }),
  })

/**
 * Mutations that act on a branch they name by its clean name. Merging or rebasing a remote
 * branch goes through these too, so a remote-only pill also checks its own clean name here.
 */
export const isBranchNameLoading = (pending: PendingPillMutation[], cleanName: string): boolean =>
  pending.some(({ key, variables }) => {
    switch (key) {
      case 'checkoutLocalBranch':
      case 'pushBranch':
      case 'mergeBranch':
      case 'rebaseBranch':
      case 'deleteBranch':
      case 'addWorktree':
        return variables.branchName === cleanName
      case 'renameBranch':
        return variables.oldName === cleanName
      default:
        return false
    }
  })

export const isLocalBranchLoading = (pending: PendingPillMutation[], branch: GitBranch): boolean =>
  isBranchNameLoading(pending, branch.cleanName) ||
  pending.some(
    ({ key, variables }) =>
      key === 'removeWorktree' && !!branch.worktreePath && variables.worktreePath === branch.worktreePath,
  )

export const isRemoteBranchLoading = (pending: PendingPillMutation[], remote: GitBranch): boolean =>
  pending.some(({ key, variables }) => {
    switch (key) {
      case 'fetchIntoLocalBranch':
      // The pre-check hits the network before the fetch itself starts, so the spinner has to
      // cover it too or the pill sits still for the first seconds of the action.
      case 'fetchIntoLocalBranchNeedsForce':
        return variables.remote === remote.remoteName && variables.remoteBranch === remote.cleanName
      case 'checkoutRemoteBranch':
        return (
          variables.remoteBranchName === remote.name ||
          variables.remoteBranchName === `${remote.remoteName}/${remote.cleanName}`
        )
      case 'deleteRemoteBranch':
        return variables.remote === remote.remoteName && variables.branchName === remote.cleanName
      default:
        return false
    }
  })

export const isTagLoading = (pending: PendingPillMutation[], tagName: string): boolean =>
  pending.some(({ key, variables }) => (key === 'pushTag' || key === 'deleteTag') && variables.tagName === tagName)

export const isStashLoading = (pending: PendingPillMutation[], stashRef: string): boolean =>
  pending.some(
    ({ key, variables }) =>
      (key === 'applyStash' || key === 'popStash' || key === 'dropStash') && variables.stashSelector === stashRef,
  )
