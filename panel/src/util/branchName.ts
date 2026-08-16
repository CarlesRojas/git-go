import { GitBranch } from '@git/gitService'

/**
 * The name git resolves to this branch: prefixed with its remote for a remote branch, so
 * commands act on the remote ref rather than a same-named local branch.
 */
export const qualifiedBranchName = (branch: GitBranch) =>
  branch.remote && branch.remoteName ? `${branch.remoteName}/${branch.cleanName}` : branch.cleanName
