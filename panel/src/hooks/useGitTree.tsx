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
const DOT_RADIUS = 4
const LINE_WIDTH = 1.5

// d = grid.y * 0.8 — exact value from vscode-git-graph's curved style
const CURVE_D = ROW_HEIGHT * 0.8

const getColor = (index: number) => BRANCH_COLORS[index % BRANCH_COLORS.length]
const px = (col: number) => col * COL_WIDTH + COL_WIDTH / 2
const py = (row: number) => row * ROW_HEIGHT + ROW_HEIGHT / 2

/**
 * Builds the SVG path for a segment.
 * Exact port of vscode-git-graph's draw() method curve logic:
 *
 *   Straight:  L x2,y2
 *   lockedFirst=true  (transition near p2, branch peeling off):
 *     C x1,(y1+d) x2,(y2-d) x2,y2
 *   lockedFirst=false (transition near p1, branch merging in):
 *     C x1,(y1+d) x2,(y2-d) x2,y2   ← same bezier, different visual because
 *                                        p1 and p2 are swapped in meaning
 *
 * The original code uses a single cubic bezier for both cases:
 *   curPath += 'C' + x1 + ',' + (y1+d) + ' ' + x2 + ',' + (y2-d) + ' ' + x2 + ',' + y2
 */
function segmentPath(x1: number, y1: number, x2: number, y2: number, lockedFirst: boolean): string {
  if (x1 === x2) {
    return `M${x1},${y1}L${x2},${y2}`
  }
  // Cubic bezier — control points hug the source/target vertically
  return `M${x1},${y1}C${x1},${(y1 + CURVE_D).toFixed(1)} ${x2},${(y2 - CURVE_D).toFixed(1)} ${x2},${y2}`
}

export function useGitTree(commits: GitCommit[]): {
  treeComponent: React.ReactNode
  treeWidth: number
} {
  const layout = useMemo(() => computeGraphLayout(commits), [commits])

  const treeWidth = useMemo(() => {
    let maxCol = 0
    for (const c of layout.commits) {
      if (c.column > maxCol) maxCol = c.column
    }
    for (const b of layout.branches) {
      for (const seg of b.segments) {
        if (seg.p1.x > maxCol) maxCol = seg.p1.x
        if (seg.p2.x > maxCol) maxCol = seg.p2.x
      }
    }
    return (maxCol + 1) * COL_WIDTH
  }, [layout])

  const svgHeight = commits.length * ROW_HEIGHT

  const treeComponent = (
    <div className="pointer-events-none absolute top-0 left-0 z-10 h-fit py-3" style={{ width: treeWidth }}>
      <svg width={treeWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
        {/* Branch lines — drawn first, under dots */}
        <g>
          {layout.branches.map((branch, bi) => {
            const color = getColor(branch.colorIndex)
            // Merge consecutive straight segments into one path (perf + visual)
            let d = ''
            for (const seg of branch.segments) {
              const x1 = px(seg.p1.x)
              const y1 = py(seg.p1.y)
              const x2 = px(seg.p2.x)
              const y2 = py(seg.p2.y)
              d += segmentPath(x1, y1, x2, y2, seg.lockedFirst)
            }
            if (!d) return null
            return (
              <path
                key={`branch-${bi}`}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={LINE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          })}
        </g>

        {/* Commit dots — drawn on top */}
        <g>
          {layout.commits.map(c => {
            const dotX = px(c.column)
            const dotY = py(c.row)
            const color = getColor(c.colorIndex)

            if (c.isStash) {
              // Stash: outer ring + inner dot (matches vscode-git-graph stashOuter/stashInner)
              return (
                <g key={c.commit.hash}>
                  <circle cx={dotX} cy={dotY} r={DOT_RADIUS + 0.5} fill="none" stroke={color} strokeWidth={1.5} />
                  <circle cx={dotX} cy={dotY} r={2} fill={color} />
                </g>
              )
            }

            // Normal commit dot
            return <circle key={c.commit.hash} cx={dotX} cy={dotY} r={DOT_RADIUS} fill={color} />
          })}
        </g>
      </svg>
    </div>
  )

  return { treeComponent, treeWidth }
}
