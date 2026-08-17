import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/util/cn'
import { CommitLayout, GraphLayout, GraphLayoutBuilder } from '@/util/computeGraphLayout'
import type { GitCommit } from '@git/gitService'
import { Fragment, ReactNode, useMemo, useRef } from 'react'

const COLOR_THEMES_DARK = {
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
  dusk: ['#f1ddbf', '#cabead', '#a29e9a', '#525e75', '#657980', '#78938a', '#85a78e', '#92ba92'],
  coral: ['#6895d2', '#8eaab8', '#c2e38e', '#fde767', '#f8d063', '#f3b95f', '#d9654e', '#d04848'],
}

const COLOR_THEMES_LIGHT = {
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
  dusk: ['#f1ddbf', '#cabead', '#a29e9a', '#525e75', '#657980', '#78938a', '#85a78e', '#92ba92'],
  coral: ['#6895d2', '#8eaab8', '#c2e38e', '#fde767', '#f8d063', '#f3b95f', '#d9654e', '#d04848'],
}

const STASH_COLOR = 'var(--color-vsc-editor-fg)'
const UNCOMMITTED_COLOR = 'var(--color-vsc-editor-fg)'

const MAX_TREE_COLUMNS = 16

const LEFT_PADDING = 8
export const ROW_HEIGHT = 24
/** Vertical padding above the first and below the last row (the old container's py-3) */
export const LIST_PADDING = 12
export const COL_WIDTH = 16 // If this changes, change the mask calc below too susbtract this size
const DOT_RADIUS = 5
const LINE_WIDTH = 2
const CURVE_D = ROW_HEIGHT * 0.8

export const getColor = ({
  index,
  theme,
  isDark,
  customColors,
  isStash = false,
  isUncommitted = false,
}: {
  index: number
  theme: string
  isDark: boolean
  customColors: string[]
  isStash?: boolean
  isUncommitted?: boolean
}) => {
  if (isStash) return STASH_COLOR
  if (isUncommitted) return UNCOMMITTED_COLOR

  const THEMES = isDark ? COLOR_THEMES_DARK : COLOR_THEMES_LIGHT

  if (theme === 'custom') {
    const colors = customColors.length > 0 ? customColors : THEMES.vibrant
    return colors[index % colors.length]
  }

  const themeColors = THEMES[theme as keyof typeof THEMES] || THEMES.vibrant
  return themeColors[index % themeColors.length]
}

const px = (col: number) => col * COL_WIDTH + COL_WIDTH / 2

function straightPath(x: number, y1: number, y2: number): string {
  return `M${x},${y1}L${x},${y2}`
}

function curvedPath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1},${y1}C${x1},${(y1 + CURVE_D).toFixed(1)} ${x2},${(y2 - CURVE_D).toFixed(1)} ${x2},${y2}`
}

/** The visible row window (inclusive), typically the virtualizer's rendered range */
export interface RowRange {
  startRow: number
  endRow: number
}

interface Result {
  treeComponent: ReactNode
  treeWidth: number
  rows: CommitLayout[]
}

/**
 * Reuses one layout builder across renders: when the commit list merely grows (a page was
 * appended), only the new rows are laid out; anything else (branch selection, HEAD move,
 * stashes toggled, the join-uncommitted setting...) rebuilds from scratch.
 */
function useIncrementalGraphLayout(commits: GitCommit[], joinUncommittedChanges: boolean): GraphLayout {
  const builderRef = useRef<GraphLayoutBuilder | null>(null)

  return useMemo(() => {
    let builder = builderRef.current

    if (builder === null || builder.joinUncommittedChanges !== joinUncommittedChanges || !builder.canExtend(commits)) {
      builder = new GraphLayoutBuilder({ joinUncommittedChanges })
      builderRef.current = builder
    }

    builder.extendTo(commits)
    return builder.getLayout()
  }, [commits, joinUncommittedChanges])
}

export function useGitTree(commits: GitCommit[], expandedRow: number | undefined, range: RowRange): Result {
  const { settings } = useSettings()
  const layout = useIncrementalGraphLayout(commits, settings.joinUncommittedChanges)

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

  // Per-branch row extents and the precomputed data-rows string, so scrolling only touches
  // branches that intersect the window and never re-joins a long branch's row list
  const branchMeta = useMemo(
    () =>
      layout.branches.map(branch => {
        let minRow = Infinity
        let maxRow = -Infinity
        for (const seg of branch.segments) {
          if (seg.p1.y < minRow) minRow = seg.p1.y
          if (seg.p2.y > maxRow) maxRow = seg.p2.y
        }
        return { minRow, maxRow, rowsAttr: branch.commitRows.join(',') }
      }),
    [layout],
  )

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

  const startRow = Math.max(0, range.startRow)
  const endRow = Math.min(layout.commits.length - 1, range.endRow)

  const treeComponent = useMemo(() => {
    if (endRow < startRow) return null

    const expandedHeight = settings.expandedCommitHeight

    // Top of a row in the svg's coordinate space (getY space: row centers at getY(row))
    const rowTopY = (row: number) =>
      row * ROW_HEIGHT + (expandedRow !== undefined && row > expandedRow ? expandedHeight : 0)

    const windowTop = rowTopY(startRow)
    const windowBottom = rowTopY(endRow) + ROW_HEIGHT + (expandedRow === endRow ? expandedHeight : 0)
    const svgHeight = windowBottom - windowTop

    // Segments spilling one row past the window keep lines seamless at its edges; the mask
    // covers that margin so they are not clipped by the mask's own bounds
    const maskMargin = ROW_HEIGHT * 2 + expandedHeight
    const visibleCommits = layout.commits.slice(startRow, endRow + 1)

    return (
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          isOverflowing && 'mask-r-from-[calc(100%-1rem)] mask-r-to-100%',
        )}
        style={{ width: clampedTreeWidth, left: LEFT_PADDING, top: LIST_PADDING + windowTop }}
      >
        <svg width={treeWidth} height={svgHeight} style={{ display: 'block', overflow: 'visible' }}>
          <g transform={`translate(0, ${-windowTop})`}>
            <defs>
              <mask
                id="commit-mask"
                maskUnits="userSpaceOnUse"
                x="0"
                y={windowTop - maskMargin}
                width={treeWidth}
                height={svgHeight + maskMargin * 2}
              >
                <rect
                  x="0"
                  y={windowTop - maskMargin}
                  width={treeWidth}
                  height={svgHeight + maskMargin * 2}
                  fill="white"
                />

                {visibleCommits.map(c => {
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
                const meta = branchMeta[bi]!
                if (meta.maxRow < startRow || meta.minRow > endRow) return null

                const color = getColor({
                  index: branch.colorIndex,
                  theme: settings.theme,
                  isDark: settings.isDark,
                  customColors: settings.customColors,
                  isStash: branch.isStash,
                })

                // The segments joining the uncommitted-changes row to HEAD are part of the same
                // branch but drawn in the uncommitted style, so split them into their own path
                let d = ''
                let dUncommitted = ''
                for (const seg of branch.segments) {
                  if (seg.p2.y < startRow || seg.p1.y > endRow) continue
                  if (seg.p1.x > maxVisibleCol && seg.p2.x > maxVisibleCol) continue
                  if (seg.isCommitted) d += buildSegmentPath(seg)
                  else dUncommitted += buildSegmentPath(seg)
                }
                if (!d && !dUncommitted) return null

                const sharedProps = {
                  fill: 'none',
                  strokeWidth: LINE_WIDTH,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  opacity: 0.7,
                  'data-rows': meta.rowsAttr,
                  className: 'transition-opacity duration-500',
                } as const

                return (
                  <Fragment key={`branch-${bi}`}>
                    {d && <path d={d} stroke={color} {...sharedProps} />}
                    {dUncommitted && <path d={dUncommitted} stroke={UNCOMMITTED_COLOR} {...sharedProps} />}
                  </Fragment>
                )
              })}
            </g>

            {/* Commit dots — drawn on top */}
            <g>
              {visibleCommits.map(c => {
                if (c.column > maxVisibleCol) return null

                const dotX = px(c.column)
                const dotY = getY(c.row)
                const color = getColor({
                  index: c.colorIndex,
                  theme: settings.theme,
                  isDark: settings.isDark,
                  customColors: settings.customColors,
                  isStash: c.isStash,
                  isUncommitted: c.isUncommitted,
                })

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
          </g>
        </svg>
      </div>
    )
  }, [
    isOverflowing,
    clampedTreeWidth,
    treeWidth,
    layout,
    branchMeta,
    startRow,
    endRow,
    expandedRow,
    maxVisibleCol,
    getY,
    settings.theme,
    settings.isDark,
    settings.customColors,
    settings.expandedCommitHeight,
    buildSegmentPath,
  ])

  return { treeComponent, treeWidth: clampedTreeWidth, rows: layout.commits }
}
