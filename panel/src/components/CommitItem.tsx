import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FC, useEffect, useRef } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import type { GitBranch, GitCommit } from '../../../src/gitService'
import { Avatar } from '../Avatar'
import { useToast } from '../contexts/ToastContext'
import { getColor } from '../hooks/useGitTree'
import { useResizable } from '../hooks/useResizable'
import { cn } from '../utils/cn'
import { CommitLayout } from '../utils/GraphLayoutGenerator'
import { groupBranches } from '../utils/groupBranches'
import BranchPill from './BranchPill'

interface CommitItemProps {
  commit: GitCommit
  isExpanded: boolean
  onToggle: () => void
  selectedBranches: GitBranch[]
  treeWidth: number
  onCommitHover: (hash: string | null, row: number | null) => void
  row: number
  layout: CommitLayout
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
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const [, copy] = useCopyToClipboard()
  const { showToast } = useToast()
  const {
    height: panelHeight,
    isDragging,
    handleMouseDown,
    containerRef,
  } = useResizable({ initialHeight: Math.max(window.innerHeight * 0.5, 164) })

  const groupedBranches = groupBranches(selectedBranches, false)

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

  return (
    <section ref={sectionRef} className="flex scroll-mb-8 flex-col">
      <button
        className={cn(
          // Layout & sizing
          'group/commit flex h-6 max-h-6 min-h-6 w-full',
          // Spacing
          'pr-2',
          // Interactive
          'cursor-pointer hover:bg-(--vscode-editor-foreground)/10',
          // State
          isExpanded && 'bg-(--vscode-editor-foreground)/10',
        )}
        style={{ paddingLeft: `${treeWidth + 8}px` }}
        onClick={onToggle}
        onMouseEnter={() => onCommitHover(commit.hash, row)}
        onMouseLeave={() => onCommitHover(null, null)}
      >
        <div
          className={cn(
            // Layout & sizing
            'flex size-full',
            // Spacing
            'gap-2 pr-2',
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
            {Object.entries(groupedBranches)
              .filter(
                ([_, { local, remotes }]) => local?.hash === commit.hash || remotes.some(r => r.hash === commit.hash),
              )
              .map(([baseName, { local, remotes }]) => (
                <BranchPill key={baseName} branch={{ local, remotes }} baseName={baseName} layout={layout} />
              ))}

            {/* {commit.isStash && (
              <div
                className={cn(
                  // Layout & sizing
                  'flex min-w-fit items-center',
                  // Spacing
                  'gap-2 px-2 py-0.5',
                  // Typography
                  'text-xs font-medium',
                  // Colors
                  'bg-(--vscode-editor-foreground)/20 text-(--vscode-editor-foreground)',
                )}
              >
                <FontAwesomeIcon key="stash" icon={faInbox} className="size-3 text-purple-500" />
                <span>{commit.refs}</span>
              </div>
            )}

            {commit.tags.length > 0 &&
              commit.tags.map(tag => (
                <div
                  key={tag}
                  className={cn(
                    // Layout & sizing
                    'flex min-w-fit items-center',
                    // Spacing
                    'gap-2 px-2 py-0.5',
                    // Typography
                    'text-xs font-medium',
                    // Colors
                    'bg-(--vscode-editor-foreground)/20 text-(--vscode-editor-foreground)',
                  )}
                >
                  <FontAwesomeIcon key={tag} icon={faTag} className="size-3 text-amber-500" />
                  <span>{tag}</span>
                </div>
              ))} */}

            <h3
              className={cn(
                // Layout
                'grow pl-1',
                // Typography
                'line-clamp-1 truncate text-xs font-semibold',
                // State
                layout?.isMerge && 'opacity-50',
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
              'line-clamp-1 truncate text-xs font-medium',
              // Appearance
              'opacity-50',
            )}
            dateTime={commit.date.split('T')[0]}
          >
            {new Date(commit.date).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>

          <time
            className={cn(
              // Layout & sizing
              'min-w-fit',
              // Typography
              'line-clamp-1 truncate text-xs font-medium',
              // Appearance
              'opacity-50',
            )}
            dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}
          >
            {new Date(commit.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </time>

          <Avatar email={commit.email} author={commit.author} size={20} />
        </div>
      </button>

      {isExpanded && (
        <div
          ref={containerRef}
          className={cn(
            // Layout
            'relative overflow-auto',
            // Spacing
            'mb-3 py-3 pr-2',
            // Colors
            'bg-(--vscode-editor-foreground)/3',
            // Interactive
            'transition-opacity duration-500',
          )}
          data-commit-row={row}
          style={{ height: `${panelHeight}px`, paddingLeft: `${treeWidth + 8}px` }}
        >
          <div
            className={cn(
              // Layout
              'relative flex flex-col',
              // Spacing
              'gap-1',
              // Typography
              'text-xs font-medium',
            )}
          >
            {/*<div className="flex gap-2">
              <span className="opacity-50">Date:</span>
              <span
                className={cn(
                  // Interactive
                  'cursor-pointer transition-opacity hover:opacity-75',
                )}
                onClick={() => copyText(new Date(commit.date).getTime().toString(), 'Milliseconds')}
              >
                {new Date(commit.date).getTime()}ms
              </span>


              <span>
                {new Date(commit.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>

              <span>
                {new Date(commit.date).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>*/}

            <div className="flex gap-2">
              <span className="opacity-50">Hash:</span>
              <code
                className={cn(
                  // Spacing
                  'px-1',
                  // Interactive
                  'cursor-pointer transition-opacity hover:opacity-75',
                )}
                onClick={() => copyText(commit.hash, 'Hash')}
              >
                {commit.hash}
              </code>
            </div>

            <div className="flex gap-2">
              <span className="opacity-50">Author:</span>
              <span
                className={cn(
                  // Interactive
                  'cursor-pointer transition-opacity hover:opacity-75',
                )}
                onClick={() => copyText(commit.author, 'Author')}
              >
                {commit.author}
              </span>
              <span
                className={cn(
                  // Interactive
                  'cursor-pointer transition-opacity hover:opacity-75',
                )}
                onClick={() => copyText(commit.email, 'Email')}
              >
                ({commit.email})
              </span>
            </div>

            {commit.refs && (
              <div className="flex gap-2">
                <span className="opacity-50">Refs:</span>
                <span
                  className="cursor-pointer transition-opacity hover:opacity-75"
                  onClick={() => copyText(commit.refs!, 'Refs')}
                >
                  {commit.refs}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <span className="opacity-50">Message:</span>
              <span
                className={cn(
                  // Typography
                  'whitespace-pre-wrap',
                  // Interactive
                  'cursor-pointer transition-opacity hover:opacity-75',
                )}
                onClick={() => copyText(commit.message, 'Message')}
              >
                {commit.message}
              </span>
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
