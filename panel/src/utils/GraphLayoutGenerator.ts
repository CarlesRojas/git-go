import type { GitCommit } from '../../../src/gitService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point {
  readonly x: number // column index
  readonly y: number // row index
}

interface Segment {
  readonly p1: Point
  readonly p2: Point
  /** TRUE => transition happens near p2 (branch peeling off downward)
   *  FALSE => transition happens near p1 (branch merging back upward) */
  readonly lockedFirst: boolean
}

interface UnavailablePoint {
  readonly connectsTo: GraphVertex | null
  readonly branch: GraphBranch
}

// ─── GraphBranch ─────────────────────────────────────────────────────────────

export class GraphBranch {
  public readonly colorIndex: number
  public segments: Segment[] = []
  public end: number = 0

  constructor(colorIndex: number) {
    this.colorIndex = colorIndex
  }

  addSegment(p1: Point, p2: Point, lockedFirst: boolean) {
    this.segments.push({ p1, p2, lockedFirst })
  }
}

// ─── GraphVertex ──────────────────────────────────────────────────────────────

class GraphVertex {
  public readonly row: number
  public readonly isStash: boolean
  private x: number = 0
  private nextX: number = 0
  private branch: GraphBranch | null = null
  private parents: GraphVertex[] = []
  private nextParentIdx: number = 0
  private connections: (UnavailablePoint | undefined)[] = []

  constructor(row: number, isStash: boolean) {
    this.row = row
    this.isStash = isStash
  }

  // Parents
  addParent(v: GraphVertex) {
    this.parents.push(v)
  }
  getNextParent(): GraphVertex | null {
    return this.nextParentIdx < this.parents.length ? this.parents[this.nextParentIdx]! : null
  }
  registerParentProcessed() {
    this.nextParentIdx++
  }
  isMerge() {
    return this.parents.length > 1
  }

  // Branch placement
  addToBranch(branch: GraphBranch, x: number) {
    if (this.branch === null) {
      this.branch = branch
      this.x = x
    }
  }
  isNotOnBranch() {
    return this.branch === null
  }
  isOnBranch(branch: GraphBranch) {
    return this.branch === branch
  }
  getBranch() {
    return this.branch
  }
  getColorIndex() {
    return this.branch?.colorIndex ?? 0
  }

  // Points
  getPoint(): Point {
    return { x: this.x, y: this.row }
  }
  getNextPoint(): Point {
    return { x: this.nextX, y: this.row }
  }

  getPointConnectingTo(target: GraphVertex | null, branch: GraphBranch): Point | null {
    for (let i = 0; i < this.connections.length; i++) {
      const c = this.connections[i]
      if (c && c.connectsTo === target && c.branch === branch) {
        return { x: i, y: this.row }
      }
    }
    return null
  }

  registerUnavailablePoint(x: number, connectsTo: GraphVertex | null, branch: GraphBranch) {
    if (x === this.nextX) {
      this.nextX = x + 1
      this.connections[x] = { connectsTo, branch }
    }
  }
}

// ─── Public output types ──────────────────────────────────────────────────────

export interface CommitLayout {
  commit: GitCommit
  row: number
  /** column index (x position) */
  column: number
  colorIndex: number
  isMerge: boolean
  isStash: boolean
}

export interface BranchPath {
  colorIndex: number
  segments: Segment[]
}

export interface GraphLayout {
  commits: CommitLayout[]
  branches: BranchPath[]
}

// ─── NULL sentinel ────────────────────────────────────────────────────────────

const NULL_VERTEX = new GraphVertex(-1, false)

// ─── Main layout function ─────────────────────────────────────────────────────

/**
 * Port of vscode-git-graph's Graph class layout algorithm.
 * Commits must be newest-first.
 */
export function computeGraphLayout(commits: GitCommit[]): GraphLayout {
  if (commits.length === 0) return { commits: [], branches: [] }

  // Build vertex list
  const vertices: GraphVertex[] = commits.map((c, i) => new GraphVertex(i, !!c.isStash))

  // Build lookup and parent links
  const lookup: Record<string, number> = {}
  commits.forEach((c, i) => {
    lookup[c.hash] = i
  })

  for (let i = 0; i < commits.length; i++) {
    for (const parentHash of commits[i]!.parents) {
      if (typeof lookup[parentHash] === 'number') {
        vertices[i]!.addParent(vertices[lookup[parentHash]]!)
      } else {
        vertices[i]!.addParent(NULL_VERTEX)
      }
    }
  }

  // Run layout
  const branches: GraphBranch[] = []
  const availableColors: number[] = []

  const getAvailableColor = (startAt: number): number => {
    for (let i = 0; i < availableColors.length; i++) {
      if (startAt > availableColors[i]!) return i
    }
    availableColors.push(0)
    return availableColors.length - 1
  }

  const determinePath = (startAt: number) => {
    let i = startAt
    let vertex = vertices[i]!
    let parentVertex = vertex.getNextParent()
    let lastPoint = vertex.isNotOnBranch() ? vertex.getNextPoint() : vertex.getPoint()

    if (
      parentVertex !== null &&
      parentVertex !== NULL_VERTEX &&
      vertex.isMerge() &&
      !vertex.isNotOnBranch() &&
      !parentVertex.isNotOnBranch()
    ) {
      // Merge between two vertices already on branches — draw connecting line
      let foundPointToParent = false
      const parentBranch = parentVertex.getBranch()!

      for (i = startAt + 1; i < vertices.length; i++) {
        const curVertex = vertices[i]!
        let curPoint = curVertex.getPointConnectingTo(parentVertex, parentBranch)
        if (curPoint !== null) {
          foundPointToParent = true
        } else {
          curPoint = curVertex.getNextPoint()
        }

        const lockedFirst = !foundPointToParent && curVertex !== parentVertex ? lastPoint.x < curPoint.x : true

        parentBranch.addSegment(lastPoint, curPoint, lockedFirst)
        curVertex.registerUnavailablePoint(curPoint.x, parentVertex, parentBranch)
        lastPoint = curPoint

        if (foundPointToParent) {
          vertex.registerParentProcessed()
          break
        }
      }
    } else {
      // Normal branch
      const branch = new GraphBranch(getAvailableColor(startAt))
      vertex.addToBranch(branch, lastPoint.x)
      vertex.registerUnavailablePoint(lastPoint.x, vertex, branch)

      for (i = startAt + 1; i < vertices.length; i++) {
        const curVertex = vertices[i]!
        const curPoint =
          parentVertex === curVertex && !parentVertex.isNotOnBranch() ? curVertex.getPoint() : curVertex.getNextPoint()

        branch.addSegment(lastPoint, curPoint, lastPoint.x < curPoint.x)
        curVertex.registerUnavailablePoint(curPoint.x, parentVertex, branch)
        lastPoint = curPoint

        if (parentVertex === curVertex) {
          vertex.registerParentProcessed()
          const parentAlreadyOnBranch = !parentVertex.isNotOnBranch()
          parentVertex.addToBranch(branch, curPoint.x)
          vertex = parentVertex
          parentVertex = vertex.getNextParent()

          if (parentVertex === null || parentAlreadyOnBranch) break
        }
      }

      if (i === vertices.length && parentVertex !== null && parentVertex === NULL_VERTEX) {
        vertex.registerParentProcessed()
      }

      branch.end = i
      branches.push(branch)
      availableColors[branch.colorIndex] = i
    }
  }

  let i = 0
  while (i < vertices.length) {
    if (vertices[i]!.getNextParent() !== null || vertices[i]!.isNotOnBranch()) {
      determinePath(i)
    } else {
      i++
    }
  }

  // Build output
  const commitLayouts: CommitLayout[] = vertices.map((v, idx) => ({
    commit: commits[idx]!,
    row: idx,
    column: v.getPoint().x,
    colorIndex: v.getColorIndex(),
    isMerge: v.isMerge(),
    isStash: v.isStash,
  }))

  const branchPaths: BranchPath[] = branches.map(b => ({
    colorIndex: b.colorIndex,
    segments: b.segments,
  }))

  return { commits: commitLayouts, branches: branchPaths }
}
