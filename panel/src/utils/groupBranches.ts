import type { GitBranch } from '../../../src/gitService'

export type GroupedBranch = {
  local: GitBranch | null
  remote: GitBranch | null
}

export const groupBranches = (branches: GitBranch[], ignoreHash: boolean = true): Record<string, GroupedBranch> => {
  return branches.reduce(
    (acc, branch) => {
      const baseName = branch.cleanName

      const key = ignoreHash ? baseName : `${baseName}-${branch.hash}`

      if (!acc[key]) {
        acc[key] = { local: null, remote: null }
      }

      if (branch.remote) {
        acc[key].remote = branch
      } else {
        acc[key].local = branch
      }

      return acc
    },
    {} as Record<string, GroupedBranch>,
  )
}
