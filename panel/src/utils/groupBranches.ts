import type { GitBranch } from '../../../src/gitService'

export type GroupedBranch = {
  local: GitBranch | null
  remotes: GitBranch[]
}

export const groupBranches = (branches: GitBranch[], ignoreHash: boolean = true): Record<string, GroupedBranch> => {
  const result = branches.reduce(
    (acc, branch) => {
      const baseName = branch.cleanName
      const key = ignoreHash ? baseName : `${baseName}-${branch.hash}`

      if (!acc[key]) {
        acc[key] = { local: null, remotes: [] }
      }

      if (branch.remote) {
        acc[key].remotes.push(branch)
      } else {
        acc[key].local = branch
      }

      return acc
    },
    {} as Record<string, GroupedBranch>,
  )

  return result
}
