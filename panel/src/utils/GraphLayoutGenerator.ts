import { GitCommit } from '../../../src/gitService'

export interface CommitLayout {
  commit: GitCommit
  row: number
  column: number
  /**
   * Edges to draw in the gap BELOW this row (between row and row+1).
   * Each edge goes from (fromColumn at this row) to (toColumn at next row).
   *
   * colorIndex: the column index whose color should be used for this edge.
   * For straight/passing-through edges: colorIndex = fromColumn (the lane's own color).
   * For merge-parent edges (branch opening): colorIndex = toColumn (the new lane's color).
   * For merge-converging edges (branch closing left): colorIndex = toColumn (the target lane).
   */
  edges: LayoutEdge[]
}

export interface LayoutEdge {
  fromColumn: number
  toColumn: number
  colorIndex: number
}

/**
 * Pure function. Commits must be newest-first.
 */
export function computeGraphLayout(commits: GitCommit[]): CommitLayout[] {
  // lanes[i] = SHA we expect to arrive at lane i on the next row, or null if free
  const lanes: (string | null)[] = []
  const result: CommitLayout[] = []

  const allocateLane = (sha: string): number => {
    const free = lanes.indexOf(null)
    if (free !== -1) {
      lanes[free] = sha
      return free
    }
    lanes.push(sha)
    return lanes.length - 1
  }

  const trimLanes = () => {
    while (lanes.length > 0 && lanes[lanes.length - 1] === null) lanes.pop()
  }

  for (let row = 0; row < commits.length; row++) {
    const commit = commits[row]
    if (!commit) continue

    // 1. Find this commit's column
    let column = lanes.indexOf(commit.hash)
    if (column === -1) column = allocateLane(commit.hash)

    // 2. Snapshot lanes BEFORE mutation
    const before = lanes.slice()

    // 3. Update lanes for the next row
    const [firstParent, ...mergeParents] = commit.parents
    lanes[column] = firstParent ?? null

    // Allocate/find lanes for merge parents
    const mergeTargetCols: number[] = []
    for (const sha of mergeParents) {
      const existing = lanes.indexOf(sha)
      if (existing !== -1) {
        mergeTargetCols.push(existing)
      } else {
        mergeTargetCols.push(allocateLane(sha))
      }
    }

    trimLanes()

    // 4. Build edges
    const edges: LayoutEdge[] = []
    const after = lanes.slice()
    const claimedAfterCols = new Set<number>()

    for (let i = 0; i < before.length; i++) {
      const sha = before[i]
      if (sha === null || sha === undefined) continue

      if (sha === commit.hash) {
        // This commit's own lane
        if (firstParent) {
          // Straight down — keep same color as this lane
          edges.push({ fromColumn: column, toColumn: column, colorIndex: column })
          claimedAfterCols.add(column)
        }

        // Merge parent edges — branch opening diagonals
        for (const targetCol of mergeTargetCols) {
          if (!claimedAfterCols.has(targetCol)) {
            // Use the target column's color (the new branch's color)
            edges.push({ fromColumn: column, toColumn: targetCol, colorIndex: targetCol })
            claimedAfterCols.add(targetCol)
          }
        }
      } else {
        // Passing-through lane
        const nextIdx = after.indexOf(sha)
        if (nextIdx !== -1 && !claimedAfterCols.has(nextIdx)) {
          edges.push({ fromColumn: i, toColumn: nextIdx, colorIndex: i })
          claimedAfterCols.add(nextIdx)
        }
      }
    }

    result.push({ commit, row, column, edges })
  }

  return result
}
