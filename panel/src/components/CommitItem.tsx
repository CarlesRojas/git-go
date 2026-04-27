import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FC, useEffect, useMemo, useRef } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import type { GitBranch, GitCommit, GitFileChange } from '../../../src/gitService'
import { Avatar } from '../Avatar'
import { useToast } from '../contexts/ToastContext'
import { useCommitContextMenu } from '../hooks/useCommitContextMenu'
import { useGitCommitFiles } from '../hooks/useGitQueries'
import { ExpandedRow, getColor } from '../hooks/useGitTree'
import { useResizable } from '../hooks/useResizable'
import { buildFileTree } from '../utils/buildFileTree'
import { cn } from '../utils/cn'
import { CommitLayout } from '../utils/GraphLayoutGenerator'
import { groupBranches } from '../utils/groupBranches'
import BranchPill from './BranchPill'
import StashTagPill from './StashTagPill'
import { TreeView } from './Tree'

interface CommitItemProps {
  commit: GitCommit
  isExpanded: boolean
  onToggle: () => void
  selectedBranches: GitBranch[]
  treeWidth: number
  onCommitHover: (hash: string | null, row: number | null) => void
  row: number
  layout: CommitLayout
  setExpandedRow?: (expandedRow?: ExpandedRow) => void
  uncommitedFiles?: GitFileChange[]
}

export const CommitItem: FC<CommitItemProps> = ({
  commit,
  isExpanded,
  onToggle,
  selectedBranches,
  treeWidth,
  onCommitHover,
  row,
  layout,
  setExpandedRow,
  uncommitedFiles,
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const [, copy] = useCopyToClipboard()
  const { showToast } = useToast()

  const fileTree = useGitCommitFiles({
    commitHash: commit.hash,
    isRootCommit: commit.parents.length === 0,
    enabled: isExpanded && !commit.isUncommitted,
  })

  const {
    height: panelHeight,
    isDragging,
    handleMouseDown,
    containerRef,
  } = useResizable({ initialHeight: Math.max(window.innerHeight * 0.3, 164) })

  useEffect(() => {
    if (isExpanded && panelHeight > 0) setExpandedRow?.({ row, extraHeight: panelHeight })
  }, [isExpanded, panelHeight, setExpandedRow, row])

  const groupedBranches = useMemo(() => groupBranches(selectedBranches, false), [selectedBranches])

  const copyText = (text: string, label: string) => {
    copy(text)
    showToast({ text: `${label} copied to clipboard`, icon: faCheckCircle, type: 'info' })
  }

  useEffect(() => {
    if (isExpanded && sectionRef.current) {
      setTimeout(() => {
        const element = sectionRef.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight

        if (!isInView) element.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 100)
    }
  }, [isExpanded])

  const isFromThisYear = new Date(commit.date).getFullYear() === new Date().getFullYear()

  const { ContextMenuWrapper } = useCommitContextMenu({ commit })

  const commitButton = (
    <button
      className={cn(
        // Layout & sizing
        'group/commit relative flex h-6 max-h-6 min-h-6 w-full',
        // Spacing
        'pr-2',
        // Interactive
        'cursor-pointer hover:bg-(--vscode-editor-foreground)/10',
        // State
        isExpanded && !layout.isHead && 'bg-(--vscode-editor-foreground)/10 hover:bg-(--vscode-editor-foreground)/15',
      )}
      style={{ paddingLeft: `${treeWidth + 8}px` }}
      onClick={onToggle}
      onMouseEnter={() => onCommitHover(commit.hash, row)}
      onMouseLeave={() => onCommitHover(null, null)}
    >
      {layout.isHead && (
        <>
          <div
            className="pointer-events-none absolute inset-0 -z-20 opacity-10"
            style={{ backgroundColor: getColor(layout.colorIndex) }}
          />

          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px max-h-px min-h-px opacity-15"
            style={{ backgroundColor: getColor(layout.colorIndex) }}
          />

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px max-h-px min-h-px opacity-15"
            style={{ backgroundColor: getColor(layout.colorIndex) }}
          />
        </>
      )}

      {isExpanded && !layout.isHead && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px max-h-px min-h-px bg-(--vscode-editor-foreground)/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px max-h-px min-h-px bg-(--vscode-editor-foreground)/10" />
        </>
      )}

      <div
        className={cn(
          // Layout & sizing
          'flex size-full',
          // Spacing
          'gap-2',
          // Typography
          'text-left',
          // Alignment
          'items-center justify-between',
          // Interactive
          'transition-opacity duration-500',
        )}
        data-commit-row={row}
      >
        <div
          className={cn(
            // Layout & sizing
            'relative flex h-full grow overflow-hidden',
            // Spacing
            'gap-1',
            // Typography
            'text-left',
            // Alignment
            'items-center justify-between',
            // Mask effect
            'mask-r-from-[calc(100%-1rem)] mask-r-to-100%',
          )}
        >
          {!commit.isUncommitted &&
            Object.entries(groupedBranches)
              .filter(
                ([_, { local, remotes }]) => local?.hash === commit.hash || remotes.some(r => r.hash === commit.hash),
              )
              .map(([baseName, { local, remotes }]) => (
                <BranchPill key={baseName} branch={{ local, remotes }} baseName={baseName} layout={layout} />
              ))}

          {!commit.isUncommitted && commit.isStash && <StashTagPill type="stash" label={commit.refs || 'stash'} />}

          {!commit.isUncommitted &&
            commit.tags.length > 0 &&
            commit.tags.map(tag => <StashTagPill key={tag} type="tag" label={tag} />)}

          <h3
            className={cn(
              // Layout
              'grow pl-1',
              // Typography
              'line-clamp-1 truncate text-xs leading-tight font-semibold',
              // State
              layout?.isMerge && !layout?.isHead && 'opacity-50',
            )}
            style={{ color: layout?.isHead ? getColor(layout.colorIndex, commit.isStash) : undefined }}
          >
            {commit.message}
          </h3>
        </div>

        <time
          className={cn(
            // Layout & sizing
            'min-w-fit',
            // Typography
            'line-clamp-1 truncate text-xs leading-tight font-medium',
            // Appearance
            'opacity-50',
            commit.isUncommitted && 'opacity-0',
          )}
          dateTime={commit.date.split('T')[0]}
        >
          {new Date(commit.date).toLocaleDateString('en-CA', {
            year: isFromThisYear ? undefined : 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>

        <time
          className={cn(
            // Layout & sizing
            'min-w-fit',
            // Typography
            'line-clamp-1 truncate text-xs leading-tight font-medium',
            // Appearance
            'opacity-50',
            commit.isUncommitted && 'opacity-0',
          )}
          dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}
        >
          {new Date(commit.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </time>

        <Avatar
          email={commit.email}
          author={commit.author}
          size={20}
          className={cn(commit.isUncommitted && 'opacity-0')}
        />

        <span
          className={cn(
            // Layout & sizing
            'w-20 max-w-20 min-w-20',
            // Typography
            'line-clamp-1 truncate text-xs leading-tight font-medium',
            // Appearance
            'opacity-50',
            commit.isUncommitted && 'opacity-0',
          )}
        >
          {commit.author}
        </span>
      </div>
    </button>
  )

  return (
    <section ref={sectionRef} className="flex scroll-mb-8 flex-col">
      <ContextMenuWrapper>{commitButton}</ContextMenuWrapper>

      {isExpanded && (
        <div
          ref={containerRef}
          className={cn(
            // Layout
            'relative overflow-hidden',
            // Colors
            'bg-(--vscode-editor-foreground)/3',
            // Interactive
            'transition-opacity duration-500',
          )}
          data-commit-row={row}
          style={{ height: `${panelHeight}px`, maxHeight: `${panelHeight}px`, paddingLeft: `${treeWidth + 8}px` }}
        >
          <div className="relative size-full max-h-full min-h-full max-w-full overflow-x-hidden overflow-y-auto">
            <div className={cn('relative flex h-fit w-full flex-col gap-1 py-3 pr-2', commit.isUncommitted && 'py-0')}>
              {!commit.isUncommitted && (
                <div className="relative flex h-fit w-full items-center gap-3">
                  <Avatar email={commit.email} author={commit.author} size={64} className="place-self-start" />

                  <div className="relative flex h-fit w-full flex-col">
                    <p className="text-xs font-medium">
                      <span className="opacity-50">Hash: </span>
                      <code
                        className={cn('cursor-pointer px-1 transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.hash, 'Hash')}
                      >
                        {commit.hash}
                      </code>
                    </p>

                    <p className="text-xs font-medium">
                      <span className="opacity-50">Author: </span>
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.author, 'Author')}
                      >
                        {commit.author}
                      </span>{' '}
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.email, 'Email')}
                      >
                        ({commit.email})
                      </span>
                    </p>

                    <p className="text-xs font-medium">
                      <span className="opacity-50">Message: </span>
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.message, 'Message')}
                      >
                        {commit.message}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {fileTree.data && <TreeView data={fileTree.data} expandAll />}

              {uncommitedFiles && <TreeView data={buildFileTree(uncommitedFiles, 'working-changes')} expandAll />}
            </div>
          </div>

          <div
            className={cn(
              // Position & sizing
              'absolute right-0 bottom-0 left-0 h-1',
              // Colors & borders
              'border-b border-(--vscode-editor-foreground)/15 bg-transparent',
              // Interactive
              'transition-colors hover:bg-(--vscode-editor-foreground)/20',
              // State
              isDragging && 'bg-(--vscode-editor-foreground)/30',
            )}
            style={{ cursor: isDragging ? 'ns-resize' : 'ns-resize' }}
            onMouseDown={handleMouseDown}
          />
        </div>
      )}
    </section>
  )
}
