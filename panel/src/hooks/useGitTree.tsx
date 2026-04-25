import { FC, Fragment, ReactElement, useMemo } from 'react'
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

const BRANCH_COLORS = [
  // '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  // '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  // '#f43f5e', // rose-500
  '#84cc16', // lime-500
  // '#10b981', // emerald-500
  '#14b8a6', // teal-500
  // '#6366f1', // indigo-500
  '#a855f7', // purple-500
  // '#d946ef', // fuchsia-500
  '#ef4444', // red-500
  // '#f97316', // orange-500
  '#eab308', // yellow-500
  // '#22c55e', // green-500
]

// Get color for column index (loops through color array)
const getColumnColor = (columnIndex: number): string => {
  return BRANCH_COLORS[columnIndex % BRANCH_COLORS.length]!
}

// SVG Components
const CirclePoint: FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <circle
    cx={x + 8} // Center in the column (w-4 = 16px, so center at 8px)
    cy={y + 12} // Center vertically in the h-6 row (24px, so center at 12px)
    r={5}
    fill={color}
    stroke="var(--vscode-editor-background)"
    strokeWidth={2}
  />
)

const VerticalLine: FC<{ x: number; y: number; color: string; extraHalf?: boolean }> = ({ x, y, color, extraHalf }) => (
  <line
    x1={x + 8} // Center in the column
    y1={y}
    x2={x + 8}
    y2={y + (extraHalf ? 36 : 24)} // Full height of h-6 row or half extra
    stroke={color}
    strokeWidth={2.5}
  />
)

const ConnectingLine: FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <line
    x1={x + 8} // Center in the column
    y1={y + 12} // Start from center of current commit point
    x2={x + 8}
    y2={y + 36} // Go down to the next row center
    stroke={color}
    strokeWidth={2.5}
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
          const nextRow = treeRows[rowIndex + 1] // Get the next row for connection checking

          return row.segments.map((segment, columnIndex) => {
            const x = columnIndex * columnWidth
            const color = getColumnColor(columnIndex)

            if (segment === '|')
              return (
                <VerticalLine
                  key={`${row.hash}-${columnIndex}-line`}
                  x={x}
                  y={y}
                  color={color}
                  extraHalf={!!nextRow && !!nextRow.segments[columnIndex]}
                />
              )

            if (segment === '*')
              return (
                <Fragment key={`${row.hash}-${columnIndex}`}>
                  {nextRow && nextRow.segments[columnIndex] && <ConnectingLine x={x} y={y} color={color} />}

                  <CirclePoint x={x} y={y} color={color} />
                </Fragment>
              )

            return null
          })
        })}
      </svg>
    </div>
  )
}
