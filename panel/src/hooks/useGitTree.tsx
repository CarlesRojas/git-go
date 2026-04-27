import React, { useMemo } from 'react'
import type { GitCommit } from '../../../src/gitService'
import { CommitLayout, computeGraphLayout } from '../utils/GraphLayoutGenerator'
import { cn } from '../utils/cn'

const BRANCH_COLORS = [
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#f43f5e', // rose-500
  '#14b8a6', // teal-500
  '#eab308', // yellow-500
]

const STASH_COLOR = '#737373' // neutral-500
const UNCOMMITTED_COLOR = 'var(--vscode-editor-foreground)'

const MAX_TREE_COLUMNS = 16

const LEFT_PADDING = 8
const ROW_HEIGHT = 24
export const COL_WIDTH = 16 // If this changes, change the mask calc below too susbtract this size
const DOT_RADIUS = 5
const LINE_WIDTH = 2
const CURVE_D = ROW_HEIGHT * 0.8

export const getColor = (index: number, isStash?: boolean, isUncommitted?: boolean) => {
  if (isStash) return STASH_COLOR
  if (isUncommitted) return UNCOMMITTED_COLOR
  return BRANCH_COLORS[index % BRANCH_COLORS.length]
}

const px = (col: number) => col * COL_WIDTH + COL_WIDTH / 2

function straightPath(x: number, y1: number, y2: number): string {
  return `M${x},${y1}L${x},${y2}`
}

function curvedPath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1},${y1}C${x1},${(y1 + CURVE_D).toFixed(1)} ${x2},${(y2 - CURVE_D).toFixed(1)} ${x2},${y2}`
}

export interface ExpandedRow {
  row: number
  extraHeight: number
}

export function useGitTree(
  commits: GitCommit[],
  expandedRow?: ExpandedRow,
): {
  treeComponent: React.ReactNode
  treeWidth: number
  rows: CommitLayout[]
} {
  const layout = useMemo(() => computeGraphLayout(commits), [commits])

  const maxVisibleCol = MAX_TREE_COLUMNS + 1

  const getY = useMemo(() => {
    if (!expandedRow) return (row: number) => row * ROW_HEIGHT + ROW_HEIGHT / 2

    const { row: expandedIdx, extraHeight } = expandedRow
    return (row: number) => {
      const baseY = row * ROW_HEIGHT + ROW_HEIGHT / 2
      if (row <= expandedIdx) return baseY
      return baseY + extraHeight
    }
  }, [expandedRow])

  const buildSegmentPath = useMemo(() => {
    if (!expandedRow) {
      return (seg: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => {
        const x1 = px(seg.p1.x)
        const y1 = getY(seg.p1.y)
        const x2 = px(seg.p2.x)
        const y2 = getY(seg.p2.y)

        if (x1 === x2) return straightPath(x1, y1, y2)
        return curvedPath(x1, y1, x2, y2)
      }
    }

    const { row: expandedIdx } = expandedRow

    return (seg: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => {
      const x1 = px(seg.p1.x)
      const y1 = getY(seg.p1.y)
      const x2 = px(seg.p2.x)
      const y2 = getY(seg.p2.y)

      const crossesExpanded = seg.p1.y <= expandedIdx && seg.p2.y > expandedIdx

      if (x1 === x2) {
        return straightPath(x1, y1, y2)
      }

      if (!crossesExpanded) {
        return curvedPath(x1, y1, x2, y2)
      }

      if (x2 > x1) {
        const curveEndY = y1 + ROW_HEIGHT
        let d = curvedPath(x1, y1, x2, curveEndY)
        if (curveEndY < y2) {
          d += `L${x2},${y2}`
        }
        return d
      } else {
        const curveStartY = y2 - ROW_HEIGHT
        let d = ''
        if (curveStartY > y1) {
          d += `M${x1},${y1}L${x1},${curveStartY}`
        }
        d += curvedPath(x1, curveStartY, x2, y2)
        return d
      }
    }
  }, [expandedRow, getY])

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

  const isOverflowing = treeWidth > MAX_TREE_COLUMNS * COL_WIDTH
  const clampedTreeWidth = Math.min(treeWidth, (MAX_TREE_COLUMNS + 1) * COL_WIDTH) + LEFT_PADDING

  const svgHeight = commits.length * ROW_HEIGHT + (expandedRow?.extraHeight ?? 0)

  const treeComponent = (
    <div
      className={cn(
        'pointer-events-none absolute top-0 z-10 h-fit py-3',
        isOverflowing && 'mask-r-from-[calc(100%-1rem)] mask-r-to-100%',
      )}
      style={{ width: clampedTreeWidth, left: LEFT_PADDING }}
    >
      <svg width={treeWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <mask id="commit-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={treeWidth} height={svgHeight}>
            <rect x="0" y="0" width={treeWidth} height={svgHeight} fill="white" />

            {layout.commits.map(c => {
              if (c.column > maxVisibleCol) return null

              const dotX = px(c.column)
              const dotY = getY(c.row)

              if (c.isStash) {
                const squareSize = DOT_RADIUS * 2 + LINE_WIDTH * 3
                const halfSize = squareSize / 2
                return (
                  <rect
                    key={`mask-${c.commit.hash}`}
                    x={dotX - halfSize}
                    y={dotY - halfSize}
                    width={squareSize}
                    height={squareSize}
                    rx={squareSize * 0.3}
                    ry={squareSize * 0.3}
                    fill="black"
                    // data-hash={c.commit.hash}
                    // className="origin-center transition-[scale] transform-fill"
                  />
                )
              }

              return (
                <circle
                  key={`mask-${c.commit.hash}`}
                  cx={dotX}
                  cy={dotY}
                  r={DOT_RADIUS + LINE_WIDTH * 1.5}
                  fill="black"
                  // data-hash={c.commit.hash}
                  // className="origin-center transition-[scale] transform-fill"
                />
              )
            })}
          </mask>
        </defs>

        <g mask="url(#commit-mask)">
          {layout.branches.map((branch, bi) => {
            const color = getColor(branch.colorIndex, branch.isStash, branch.isUncommitted)
            let d = ''
            for (const seg of branch.segments) {
              if (seg.p1.x > maxVisibleCol && seg.p2.x > maxVisibleCol) continue
              d += buildSegmentPath(seg)
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
                opacity={0.7}
                data-rows={branch.commitRows.join(',')}
                className="transition-opacity duration-500"
              />
            )
          })}
        </g>

        {/* Commit dots — drawn on top */}
        <g>
          {layout.commits.map(c => {
            if (c.column > maxVisibleCol) return null

            const dotX = px(c.column)
            const dotY = getY(c.row)
            const color = getColor(c.colorIndex, c.isStash, c.isUncommitted)

            if (c.isUncommitted) {
              return (
                <g
                  key={c.commit.hash}
                  data-hash={c.commit.hash}
                  data-row={c.row}
                  className="origin-center transition-opacity duration-500 transform-fill"
                >
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={DOT_RADIUS}
                    fill="var(--vscode-editor-background)"
                    stroke={color}
                    strokeWidth={LINE_WIDTH}
                  />

                  <circle cx={dotX} cy={dotY} r={DOT_RADIUS * 0.33} fill={color} />
                </g>
              )
            }

            if (c.isStash) {
              const squareSize = DOT_RADIUS * 2
              const halfSize = squareSize / 2
              return (
                <rect
                  key={c.commit.hash}
                  x={dotX - halfSize}
                  y={dotY - halfSize}
                  width={squareSize}
                  height={squareSize}
                  rx={squareSize * 0.3}
                  ry={squareSize * 0.3}
                  fill={color}
                  data-hash={c.commit.hash}
                  data-row={c.row}
                  className="origin-center transition-opacity duration-500 transform-fill"
                />
              )
            }

            if (c.isHead)
              return (
                <circle
                  key={c.commit.hash}
                  cx={dotX}
                  cy={dotY}
                  r={DOT_RADIUS}
                  fill="var(--vscode-editor-background)"
                  stroke={color}
                  strokeWidth={LINE_WIDTH}
                  data-hash={c.commit.hash}
                  data-row={c.row}
                  className="origin-center transition-opacity duration-500 transform-fill"
                />
              )

            return (
              <circle
                key={c.commit.hash}
                cx={dotX}
                cy={dotY}
                r={DOT_RADIUS}
                fill={color}
                data-hash={c.commit.hash}
                data-row={c.row}
                className="origin-center transition-opacity duration-500 transform-fill"
              />
            )
          })}
        </g>
      </svg>
    </div>
  )

  return { treeComponent, treeWidth: clampedTreeWidth, rows: layout.commits }
}
