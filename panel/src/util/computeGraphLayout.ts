import type { GitCommit } from '@git/gitService'

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
  /** FALSE => part of the uncommitted-changes line (drawn in the uncommitted style) */
  readonly isCommitted: boolean
}

interface UnavailablePoint {
  readonly connectsTo: GraphVertex | null
  readonly branch: GraphBranch
}

// ─── GraphBranch ─────────────────────────────────────────────────────────────

export class GraphBranch {
  public readonly colorIndex: number
  public readonly isStash: boolean
  public segments: Segment[] = []
  public end: number = 0
  public hashes: Set<number> = new Set()

  constructor(colorIndex: number, isStash: boolean) {
    this.colorIndex = colorIndex
    this.isStash = isStash
  }

  addSegment(p1: Point, p2: Point, isCommitted: boolean, lockedFirst: boolean) {
    this.segments.push({ p1, p2, lockedFirst, isCommitted })
  }
}

// ─── GraphVertex ──────────────────────────────────────────────────────────────

class GraphVertex {
  public readonly row: number
  public readonly isStash: boolean
  public readonly isHead: boolean
  public readonly isUncommitted: boolean
  private x: number = 0
  private nextX: number = 0
  private branch: GraphBranch | null = null
  /** Parent hashes, resolved lazily so parents in not-yet-loaded pages resolve once they arrive */
  private parentHashes: string[] = []
  private nextParentIdx: number = 0
  private connections: (UnavailablePoint | undefined)[] = []

  constructor(row: number, isStash: boolean, isHead: boolean, isUncommitted: boolean) {
    this.row = row
    this.isStash = isStash
    this.isHead = isHead
    this.isUncommitted = isUncommitted
  }

  // Parents
  addParentHash(hash: string) {
    this.parentHashes.push(hash)
  }
  getNextParentHash(): string | null {
    return this.nextParentIdx < this.parentHashes.length ? this.parentHashes[this.nextParentIdx]! : null
  }
  registerParentProcessed() {
    this.nextParentIdx++
  }
  isMerge() {
    return this.parentHashes.length > 1
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
  isHead: boolean
  isUncommitted: boolean
}

export interface BranchPath {
  colorIndex: number
  isStash: boolean
  segments: Segment[]
  commitRows: number[]
}

export interface GraphLayout {
  commits: CommitLayout[]
  branches: BranchPath[]
}

export interface GraphLayoutOptions {
  /** Join the uncommitted-changes row to the checked out commit with a line kept
   *  straight on the leftmost column. When off, it is shown as a separate dot. */
  joinUncommittedChanges?: boolean
}

// ─── NULL sentinel ────────────────────────────────────────────────────────────

const NULL_VERTEX = new GraphVertex(-1, false, false, false)

// ─── Path state ───────────────────────────────────────────────────────────────

/**
 * A path whose parent lives in a page that is not loaded yet. It stops at the bottom of the
 * loaded graph and resumes from there when the next page arrives.
 */
interface PendingPath {
  branch: GraphBranch
  lastPoint: Point
  /** The vertex whose parent the path is heading towards */
  vertex: GraphVertex
  /** Hash of that parent (null when the origin has no parent and the line just extends) */
  parentHash: string | null
  /** Whether the path's origin commit is a stash (a stash line stops at its parent) */
  originIsStash: boolean
}

// ─── Incremental layout builder ───────────────────────────────────────────────

/**
 * Port of vscode-git-graph's Graph class layout algorithm, restructured so that pages can be
 * appended incrementally: the open-branch state at the bottom of the loaded graph is carried
 * over, so appending a page only lays out the new rows instead of recomputing from scratch.
 * Commits must be newest-first (git log --date-order guarantees parents come after children).
 */
export class GraphLayoutBuilder {
  public readonly joinUncommittedChanges: boolean

  private commits: GitCommit[] = []
  private vertices: GraphVertex[] = []
  private lookup: Map<string, number> = new Map()
  private branches: GraphBranch[] = []
  private availableColors: number[] = []
  private pending: PendingPath[] = []
  private commitLayouts: CommitLayout[] = []
  /** Hash of the checked out commit an uncommitted row is waiting for (not loaded yet) */
  private deferredUncommittedParent: string | null = null

  constructor(options: GraphLayoutOptions = {}) {
    this.joinUncommittedChanges = options.joinUncommittedChanges ?? true
  }

  get count() {
    return this.commits.length
  }

  /**
   * Whether `commits` extends what has been laid out so far: the already-laid-out rows must
   * match on every field the layout depends on. Fields that only affect row content (message,
   * refs, tags...) are free to differ.
   */
  canExtend(commits: GitCommit[]): boolean {
    if (commits.length < this.commits.length) return false

    // The checked out commit an uncommitted row is waiting for arriving means the join must be
    // laid out from the top (it claims the leftmost column at every row it crosses), which only
    // a rebuild can do — extending would thread the line down the right side instead
    if (this.deferredUncommittedParent !== null) {
      for (let i = this.commits.length; i < commits.length; i++) {
        if (commits[i]!.hash === this.deferredUncommittedParent) return false
      }
    }

    for (let i = 0; i < this.commits.length; i++) {
      const prev = this.commits[i]!
      const next = commits[i]!
      if (prev === next) continue

      if (
        prev.hash !== next.hash ||
        !!prev.isStash !== !!next.isStash ||
        !!prev.isHead !== !!next.isHead ||
        !!prev.isUncommitted !== !!next.isUncommitted ||
        prev.parents.length !== next.parents.length
      )
        return false

      for (let j = 0; j < prev.parents.length; j++) {
        if (prev.parents[j] !== next.parents[j]) return false
      }
    }

    return true
  }

  /**
   * Extend the layout to cover `commits`, which must satisfy `canExtend`. Only the new tail is
   * laid out; already-laid-out rows keep their columns, colors and segments untouched.
   */
  extendTo(commits: GitCommit[]) {
    // Refetches recreate the commit objects; keep the layout pointing at the current ones
    for (let i = 0; i < this.commits.length; i++) {
      if (this.commits[i] !== commits[i]) {
        this.commits[i] = commits[i]!
        this.commitLayouts[i]!.commit = commits[i]!
      }
    }

    this.append(commits.slice(this.commits.length))
  }

  private append(newCommits: GitCommit[]) {
    if (newCommits.length === 0) return

    const startRow = this.vertices.length

    for (const commit of newCommits) {
      const vertex = new GraphVertex(this.vertices.length, !!commit.isStash, !!commit.isHead, !!commit.isUncommitted)
      for (const parentHash of commit.parents) vertex.addParentHash(parentHash)
      this.lookup.set(commit.hash, this.vertices.length)
      this.vertices.push(vertex)
      this.commits.push(commit)
    }

    // Paths cut off at the previous page boundary continue first, in their original order, so
    // they claim points on the new rows exactly as a full recompute would
    const cutOff = this.pending
    this.pending = []
    for (const path of cutOff) {
      this.extendPath({ ...path, parentProcessed: true }, startRow)
    }

    // Rows before startRow are fully processed (every parent handled, every vertex on a branch)
    let i = startRow
    while (i < this.vertices.length) {
      const vertex = this.vertices[i]!

      // When joined, the uncommitted-changes vertex is processed like any other commit (its
      // parent is HEAD), and being row 0 it is processed first — so its line down to HEAD claims
      // the leftmost column at every row it crosses, forcing all other branches to shift right
      // around it. It is left unconnected when the setting is off, and also when HEAD isn't
      // among the loaded commits yet — its hash is remembered so canExtend can force a rebuild
      // once the page holding it arrives.
      if (
        vertex.isUncommitted &&
        (!this.joinUncommittedChanges || this.resolveParent(vertex.getNextParentHash()) === NULL_VERTEX)
      ) {
        if (this.joinUncommittedChanges) this.deferredUncommittedParent = vertex.getNextParentHash()
        i++
        continue
      }

      if (vertex.getNextParentHash() !== null || vertex.isNotOnBranch()) {
        this.determinePath(i)
      } else {
        i++
      }
    }

    for (let row = startRow; row < this.vertices.length; row++) {
      const vertex = this.vertices[row]!
      this.commitLayouts.push({
        commit: this.commits[row]!,
        row,
        column: vertex.getPoint().x,
        colorIndex: vertex.getColorIndex(),
        isMerge: vertex.isMerge(),
        isStash: vertex.isStash,
        isHead: vertex.isHead,
        isUncommitted: vertex.isUncommitted,
      })
    }
  }

  getLayout(): GraphLayout {
    return {
      commits: this.commitLayouts,
      branches: this.branches.map(branch => ({
        colorIndex: branch.colorIndex,
        isStash: branch.isStash,
        segments: branch.segments,
        commitRows: [...branch.hashes],
      })),
    }
  }

  private resolveParent(hash: string | null): GraphVertex | null {
    if (hash === null) return null
    const index = this.lookup.get(hash)
    return index === undefined ? NULL_VERTEX : this.vertices[index]!
  }

  private getAvailableColor(startAt: number): number {
    for (let i = 0; i < this.availableColors.length; i++) {
      if (startAt > this.availableColors[i]!) return i
    }
    this.availableColors.push(0)
    return this.availableColors.length - 1
  }

  private determinePath(startAt: number) {
    const vertex = this.vertices[startAt]!
    const parentHash = vertex.getNextParentHash()
    const parentVertex = this.resolveParent(parentHash)
    const lastPoint = vertex.isNotOnBranch() ? vertex.getNextPoint() : vertex.getPoint()

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
      let point = lastPoint

      for (let i = startAt + 1; i < this.vertices.length; i++) {
        const curVertex = this.vertices[i]!
        let curPoint = curVertex.getPointConnectingTo(parentVertex, parentBranch)
        if (curPoint !== null) {
          foundPointToParent = true
        } else {
          curPoint = curVertex.getNextPoint()
        }

        const lockedFirst = !foundPointToParent && curVertex !== parentVertex ? point.x < curPoint.x : true

        parentBranch.addSegment(point, curPoint, !vertex.isUncommitted, lockedFirst)
        curVertex.registerUnavailablePoint(curPoint.x, parentVertex, parentBranch)
        point = curPoint

        if (foundPointToParent) {
          vertex.registerParentProcessed()
          break
        }
      }
    } else {
      // Normal branch
      const branch = new GraphBranch(this.getAvailableColor(startAt), vertex.isStash)
      vertex.addToBranch(branch, lastPoint.x)
      branch.hashes.add(startAt)
      vertex.registerUnavailablePoint(lastPoint.x, vertex, branch)
      this.branches.push(branch)

      this.extendPath(
        { branch, lastPoint, vertex, parentHash, originIsStash: vertex.isStash, parentProcessed: false },
        startAt + 1,
      )
    }
  }

  /**
   * Walk a branch path downward from `fromRow` until it reaches its parent, runs out of loaded
   * rows (recorded as pending, resumed on the next append), or its origin stash line ends.
   */
  private extendPath(state: PendingPath & { parentProcessed: boolean }, fromRow: number) {
    const { branch, originIsStash } = state
    let { lastPoint, vertex, parentHash, parentProcessed } = state
    let parentVertex = this.resolveParent(parentHash)

    let i = fromRow
    for (; i < this.vertices.length; i++) {
      const curVertex = this.vertices[i]!
      const curPoint =
        parentVertex === curVertex && !parentVertex.isNotOnBranch() ? curVertex.getPoint() : curVertex.getNextPoint()

      branch.addSegment(lastPoint, curPoint, !vertex.isUncommitted, lastPoint.x < curPoint.x)

      if (!(originIsStash && parentVertex === curVertex))
        curVertex.registerUnavailablePoint(curPoint.x, parentVertex, branch)

      lastPoint = curPoint

      if (parentVertex === curVertex) {
        // A resumed path's pending parent was already marked processed when it was cut off
        if (parentProcessed) parentProcessed = false
        else vertex.registerParentProcessed()

        branch.hashes.add(i)

        // Stash branch stops at its parent — don't consume the parent
        if (originIsStash) break

        const parentAlreadyOnBranch = !parentVertex.isNotOnBranch()
        parentVertex.addToBranch(branch, curPoint.x)
        vertex = parentVertex
        parentHash = vertex.getNextParentHash()
        parentVertex = this.resolveParent(parentHash)

        if (parentVertex === null || parentAlreadyOnBranch) break
      }
    }

    if (i === this.vertices.length) {
      // The path ran off the loaded end — it continues when the next page arrives
      if (parentVertex === NULL_VERTEX && !parentProcessed) vertex.registerParentProcessed()
      this.pending.push({ branch, lastPoint, vertex, parentHash, originIsStash })
    }

    branch.end = i
    this.availableColors[branch.colorIndex] = i
  }
}

// ─── Main layout function ─────────────────────────────────────────────────────

/**
 * Lay out the whole commit list in one go. Commits must be newest-first.
 */
export function computeGraphLayout(commits: GitCommit[], options: GraphLayoutOptions = {}): GraphLayout {
  const builder = new GraphLayoutBuilder(options)
  builder.extendTo(commits)
  return builder.getLayout()
}
