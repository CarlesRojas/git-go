import React from 'react'
import type { GitCommit } from '../../../src/gitService'

export interface GitTreeData {
  /** Component to render the git tree visualization */
  treeComponent: React.ReactElement
  /** Left padding needed for each commit item to accommodate tree space */
  paddingLeft: number
  /** Width of the tree area in pixels */
  treeWidth: number
}

export interface GitTreeRow {
  /** The visual representation for this commit's row */
  content: string
  /** Index of this commit in the array */
  commitIndex: number
  /** The commit hash for this row */
  hash: string
}

/**
 * Hook that processes git commits and generates tree visualization
 * @param commits Array of git commits with graph data
 * @returns Tree component and layout information
 */
export const useGitTree = (commits: GitCommit[]): GitTreeData => {
  const treeRows: GitTreeRow[] = React.useMemo(() => {
    return commits.map((commit, index) => ({
      content: commit.graph || '*', // Fallback to simple * if no graph
      commitIndex: index,
      hash: commit.hash,
    }))
  }, [commits])

  // Calculate the maximum width needed for the tree
  const maxWidth = React.useMemo(() => {
    return Math.max(
      ...treeRows.map(row => row.content.length),
      1, // Minimum width of 1 character
    )
  }, [treeRows])

  // Convert character width to pixels (approximate monospace font width)
  const charWidth = 8 // pixels per character
  const treeWidth = maxWidth * charWidth + 16 // Add some padding
  const paddingLeft = treeWidth // Same as tree width

  const treeComponent = React.useMemo(
    () => <GitTreeComponent treeRows={treeRows} treeWidth={treeWidth} charWidth={charWidth} />,
    [treeRows, treeWidth, charWidth],
  )

  return {
    treeComponent,
    paddingLeft,
    treeWidth,
  }
}

interface GitTreeComponentProps {
  treeRows: GitTreeRow[]
  treeWidth: number
  charWidth: number
}

/**
 * Component that renders the git tree visualization
 */
const GitTreeComponent: React.FC<GitTreeComponentProps> = ({ treeRows, treeWidth, charWidth }) => {
  return (
    <div
      className="absolute top-0 left-0 z-10 h-fit py-3 text-xs leading-tight opacity-60"
      style={{ width: treeWidth }}
    >
      {treeRows.map((row, index) => (
        <div
          key={`${row.hash}-${index}`}
          className="flex h-6 max-h-6 min-h-6 items-center whitespace-pre text-(--vscode-editor-foreground)"
        >
          <span className="tracking-wide">{row.content}</span>
        </div>
      ))}
    </div>
  )
}
