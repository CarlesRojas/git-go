import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/util/cn'
import { CommitLayout, computeGraphLayout } from '@/util/computeGraphLayout'
import type { GitCommit } from '@git/gitService'
import { ReactNode, useMemo } from 'react'

const COLOR_THEMES = {
  vibrant: ['#3b82f6', '#ec4899', '#84cc16', '#f97316', '#a855f7', '#f43f5e', '#14b8a6', '#eab308'],
  spring: ['#c7522a', '#d68a58', '#e5c185', '#e0d49f', '#b8cdab', '#74a892', '#3a978c', '#008585'],
  ocean: ['#555d8e', '#566f94', '#56819b', '#5494a1', '#62a4a7', '#7db2ac', '#97c0b0', '#b1ceb5'],
  sunset: ['#2c4875', '#58508d', '#8a508f', '#bc5090', '#de5a79', '#ff6361', '#ff8531', '#ffa600'],
  rainbow: ['#fb7b77', '#fdc170', '#e3dd71', '#88e875', '#61ddeb', '#6d9efc', '#937df8', '#f78ef0'],
  earth: ['#f0ead2', '#dde5b4', '#c5d396', '#adc178', '#aba370', '#a98467', '#8b6e5a', '#6c584c'],
  pastel: ['#80a7fe', '#90c6c4', '#9fe58a', '#f6d897', '#ffa875', '#f77d8c', '#df8fc1', '#c6a0f6'],
  cloud: ['#535fcc', '#6b6ac5', '#8375be', '#9b81b8', '#b38cb1', '#cb97aa', '#e2a2a3', '#faad9c'],
  forest: ['#2e5c3d', '#4b7c4e', '#6f9b6f', '#a3d9a1', '#f1c2a2', '#e6a55c', '#d57a48', '#c45b3b'],
  float: ['#80558c', '#af7ab3', '#cba0ae', '#d8b9a0', '#dbcfaa', '#cdd4a8', '#9dad7f', '#557174'],
  coast: ['#95f9ab', '#8ee5b0', '#88d2b5', '#81beba', '#7babbf', '#7497c4', '#6e84c9', '#6770ce'],
  boreal: ['#f1ddbf', '#cabead', '#a29e9a', '#525e75', '#657980', '#78938a', '#85a78e', '#92ba92'],
  coral: ['#6895d2', '#8eaab8', '#c2e38e', '#fde767', '#f8d063', '#f3b95f', '#d9654e', '#d04848'],
}

const STASH_COLOR = 'var(--color-vsc-editor-fg)'
const UNCOMMITTED_COLOR = 'var(--color-vsc-editor-fg)'

const MAX_TREE_COLUMNS = 16

const LEFT_PADDING = 8
const ROW_HEIGHT = 24
export const COL_WIDTH = 16 // If this changes, change the mask calc below too susbtract this size
const DOT_RADIUS = 5
const LINE_WIDTH = 2
const CURVE_D = ROW_HEIGHT * 0.8

export const getColor = (index: number, theme: string, isStash?: boolean, isUncommitted?: boolean) => {
  if (isStash) return STASH_COLOR
  if (isUncommitted) return UNCOMMITTED_COLOR

  const themeColors = COLOR_THEMES[theme as keyof typeof COLOR_THEMES] || COLOR_THEMES.vibrant
  return themeColors[index % themeColors.length]
}

const px = (col: number) => col * COL_WIDTH + COL_WIDTH / 2

function straightPath(x: number, y1: number, y2: number): string {
  return `M${x},${y1}L${x},${y2}`
}

function curvedPath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1},${y1}C${x1},${(y1 + CURVE_D).toFixed(1)} ${x2},${(y2 - CURVE_D).toFixed(1)} ${x2},${y2}`
}

interface Result {
  treeComponent: ReactNode
  treeWidth: number
  rows: CommitLayout[]
}

export function useGitTree(commits: GitCommit[], expandedRow?: number): Result {
  const layout = useMemo(() => computeGraphLayout(commits), [commits])
  const { settings } = useSettings()

  const maxVisibleCol = MAX_TREE_COLUMNS + 1

  const getY = useMemo(() => {
    if (expandedRow === undefined) return (row: number) => row * ROW_HEIGHT + ROW_HEIGHT / 2

    return (row: number) => {
      const baseY = row * ROW_HEIGHT + ROW_HEIGHT / 2
      if (row <= expandedRow) return baseY
      return baseY + settings.expandedCommitHeight
    }
  }, [expandedRow, settings.expandedCommitHeight])

  const buildSegmentPath = useMemo(() => {
    if (expandedRow === undefined) {
      return (seg: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => {
        const x1 = px(seg.p1.x)
        const y1 = getY(seg.p1.y)
        const x2 = px(seg.p2.x)
        const y2 = getY(seg.p2.y)

        if (x1 === x2) return straightPath(x1, y1, y2)
        return curvedPath(x1, y1, x2, y2)
      }
    }

    return (seg: { p1: { x: number; y: number }; p2: { x: number; y: number } }) => {
      const x1 = px(seg.p1.x)
      const y1 = getY(seg.p1.y)
      const x2 = px(seg.p2.x)
      const y2 = getY(seg.p2.y)

      const crossesExpanded = seg.p1.y <= expandedRow && seg.p2.y > expandedRow

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

  const svgHeight = commits.length * ROW_HEIGHT + (expandedRow !== undefined ? settings.expandedCommitHeight : 0)

  const treeComponent = useMemo(
    () => (
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
                      rx={squareSize * 0.25}
                      ry={squareSize * 0.25}
                      fill="black"
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
                  />
                )
              })}
            </mask>
          </defs>

          <g mask="url(#commit-mask)">
            {layout.branches.map((branch, bi) => {
              const color = getColor(branch.colorIndex, settings.theme, branch.isStash, branch.isUncommitted)
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
              const color = getColor(c.colorIndex, settings.theme, c.isStash, c.isUncommitted)

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
                      className="fill-vsc-editor-bg"
                      stroke={color}
                      strokeWidth={LINE_WIDTH}
                    />

                    <circle cx={dotX} cy={dotY} r={DOT_RADIUS * 0.25} fill={color} />
                  </g>
                )
              }

              if (c.isStash) {
                const squareSize = DOT_RADIUS * 1.8
                const halfSize = squareSize / 2
                return (
                  <rect
                    key={c.commit.hash}
                    x={dotX - halfSize}
                    y={dotY - halfSize}
                    width={squareSize}
                    height={squareSize}
                    rx={squareSize * 0.25}
                    ry={squareSize * 0.25}
                    stroke={color}
                    strokeWidth={LINE_WIDTH}
                    data-hash={c.commit.hash}
                    data-row={c.row}
                    className="origin-center fill-transparent transition-opacity duration-500 transform-fill"
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
                    stroke={color}
                    strokeWidth={LINE_WIDTH}
                    data-hash={c.commit.hash}
                    data-row={c.row}
                    className="fill-vsc-editor-bg origin-center transition-opacity duration-500 transform-fill"
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
    ),
    [
      isOverflowing,
      clampedTreeWidth,
      treeWidth,
      svgHeight,
      layout.commits,
      layout.branches,
      maxVisibleCol,
      getY,
      settings.theme,
      buildSegmentPath,
    ],
  )

  return { treeComponent, treeWidth: clampedTreeWidth, rows: layout.commits }
}
