import React, { useMemo } from 'react'
import type { GitCommit } from '../../../src/gitService'
import { computeGraphLayout } from '../utils/GraphLayoutGenerator'

const BRANCH_COLORS = [
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#ef4444', // red-500
  '#eab308', // yellow-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
]

const ROW_HEIGHT = 24
const COL_WIDTH = 16
const DOT_RADIUS = 3
const MERGE_DOT_RADIUS = 4
const LINE_WIDTH = 1.5

const getColor = (index: number) => BRANCH_COLORS[index % BRANCH_COLORS.length]
const cx = (col: number) => col * COL_WIDTH + COL_WIDTH / 2
const cy = (row: number) => row * ROW_HEIGHT + ROW_HEIGHT / 2

/**
 * Build an SVG path for an edge from (x1,y1) to (x2,y2).
 *
 * Curve style matches the reference images:
 * - If straight (same column): simple vertical line
 * - If diagonal going RIGHT (new branch opening below): go straight down most
 *   of the gap, then curve right at the bottom — like a branch peeling off
 * - If diagonal going LEFT (branch merging back): curve left immediately at
 *   the top, then go straight down — like a branch converging
 */
function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`

  const curveSize = Math.min(ROW_HEIGHT * 0.6, Math.abs(x2 - x1))

  if (x2 > x1) {
    // Going right → branch peeling off downward
    // Straight down, then curve right at the bottom
    return `M ${x1} ${y1} L ${x1} ${y2 - curveSize} Q ${x1} ${y2} ${x1 + curveSize} ${y2} L ${x2} ${y2}`
  } else {
    // Going left → branch merging back
    // Curve left immediately at the top, then straight down
    return `M ${x1} ${y1} L ${x2 + curveSize} ${y1} Q ${x2} ${y1} ${x2} ${y1 + curveSize} L ${x2} ${y2}`
  }
}

export function useGitTree(commits: GitCommit[]): {
  treeComponent: React.ReactNode
  treeWidth: number
} {
  const layouts = useMemo(() => computeGraphLayout(commits), [commits])

  const treeWidth = useMemo(() => (layouts.reduce((max, l) => Math.max(max, l.column), 0) + 1) * COL_WIDTH, [layouts])

  const svgHeight = commits.length * ROW_HEIGHT

  const treeComponent = (
    <div className="pointer-events-none absolute top-0 left-0 z-10 h-fit py-3" style={{ width: treeWidth }}>
      <svg width={treeWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
        {/* Edges — drawn below dots */}
        <g>
          {layouts.map(layout =>
            layout.edges.map((edge, i) => {
              const x1 = cx(edge.fromColumn)
              const x2 = cx(edge.toColumn)
              const y1 = cy(layout.row)
              const y2 = cy(layout.row + 1)
              const color = getColor(edge.colorIndex)
              const d = edgePath(x1, y1, x2, y2)

              return (
                <path
                  key={`${layout.commit.hash}-e${i}`}
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={LINE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            }),
          )}
        </g>

        {/* Dots — on top of edges */}
        <g>
          {layouts.map(layout => {
            const isMerge = layout.commit.parents.length > 1
            const dotCx = cx(layout.column)
            const dotCy = cy(layout.row)
            const color = getColor(layout.column)

            return (
              <g key={layout.commit.hash}>
                {isMerge && (
                  <circle
                    cx={dotCx}
                    cy={dotCy}
                    r={MERGE_DOT_RADIUS + 1.5}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.5}
                  />
                )}
                <circle cx={dotCx} cy={dotCy} r={isMerge ? MERGE_DOT_RADIUS : DOT_RADIUS} fill={color} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )

  return { treeComponent, treeWidth }
}
