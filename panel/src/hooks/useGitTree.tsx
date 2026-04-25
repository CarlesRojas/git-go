import { FC, ReactElement, useMemo } from 'react'
import type { GitCommit } from '../../../src/gitService'

export interface GitTreeResponse {
  treeComponent: ReactElement
  treeWidth: number
}

export interface GitTreeRow {
  /** The visual representation for this commit's row */
  content: string
  /** Index of this commit in the array */
  commitIndex: number
  /** The commit hash for this row */
  hash: string
  /** Parsed graph segments (split by spaces) */
  segments: string[]
  /** Maximum number of columns needed */
  columnCount: number
}

/**
 * Hook that processes git commits and generates tree visualization
 * @param commits Array of git commits with graph data
 * @returns Tree component and layout information
 */
export const useGitTree = (commits: GitCommit[]): GitTreeResponse => {
  const treeRows: GitTreeRow[] = useMemo(() => {
    const parsedCommits = commits.map((commit, index) => {
      const content = commit.graph || '*'
      const segments = content.split(' ')
      return {
        content,
        commitIndex: index,
        hash: commit.hash,
        segments,
      }
    })

    const maxColumns = Math.max(...parsedCommits.map(commit => commit.segments.length), 1)

    return parsedCommits.map(commit => ({
      ...commit,
      columnCount: maxColumns,
    }))
  }, [commits])

  const maxColumns = treeRows[0]?.columnCount || 1

  const columnWidth = 16 // pixels per column (w-4)
  const treeWidth = maxColumns * columnWidth

  const treeComponent = useMemo(
    () => <GitTreeComponent treeRows={treeRows} treeWidth={treeWidth} columnWidth={columnWidth} />,
    [treeRows, treeWidth, columnWidth],
  )

  return { treeComponent, treeWidth }
}

interface GitTreeComponentProps {
  treeRows: GitTreeRow[]
  treeWidth: number
  columnWidth: number
}

// SVG Components
const CirclePoint: FC<{ x: number; y: number }> = ({ x, y }) => (
  <circle
    cx={x + 8} // Center in the column (w-4 = 16px, so center at 8px)
    cy={y + 12} // Center vertically in the h-6 row (24px, so center at 12px)
    r={3}
    fill="white"
  />
)

const VerticalLine: FC<{ x: number; y: number }> = ({ x, y }) => (
  <line
    x1={x + 8} // Center in the column
    y1={y}
    x2={x + 8}
    y2={y + 24} // Full height of h-6 row
    stroke="white"
    strokeWidth={1}
  />
)

/**
 * Component that renders the git tree visualization
 */
const GitTreeComponent: FC<GitTreeComponentProps> = ({ treeRows, treeWidth, columnWidth }) => {
  return (
    <div className="pointer-events-none absolute top-0 left-0 z-10 h-fit py-3" style={{ width: treeWidth }}>
      <svg width={treeWidth} height={treeRows.length * 24}>
        {treeRows.map((row, rowIndex) => {
          const y = rowIndex * 24 // Each row is h-6 (24px)

          return row.segments.map((segment, columnIndex) => {
            const x = columnIndex * columnWidth

            if (segment === '*') {
              return <CirclePoint key={`${row.hash}-${columnIndex}-point`} x={x} y={y} />
            } else if (segment === '|') {
              return <VerticalLine key={`${row.hash}-${columnIndex}-line`} x={x} y={y} />
            }

            return null
          })
        })}
      </svg>
    </div>
  )
}
