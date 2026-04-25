import { faCheckCircle, faInbox, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import type { GitBranch, GitCommit } from '../../../src/gitService'
import { Avatar } from '../Avatar'
import { useToast } from '../contexts/ToastContext'
import { useResizable } from '../hooks/useResizable'
import { getBranchIcons } from '../utils/branchIcons'
import { cn } from '../utils/cn'
import { groupBranches } from '../utils/groupBranches'

interface CommitItemProps {
  commit: GitCommit
  isExpanded: boolean
  onToggle: () => void
  selectedBranches: GitBranch[]
}

export const CommitItem: React.FC<CommitItemProps> = ({ commit, isExpanded, onToggle, selectedBranches }) => {
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
          'flex min-h-6 w-full cursor-pointer items-center justify-between gap-2 px-4 text-left transition-colors hover:bg-(--vscode-editor-foreground)/10',
          isExpanded && 'bg-(--vscode-editor-foreground)/10',
        )}
        onClick={onToggle}
      >
        {Object.entries(groupedBranches)
          .filter(([_, { local, remote }]) => local?.hash === commit.hash || remote?.hash === commit.hash)
          .map(([baseName, { local, remote }]) => (
            <div
              key={baseName}
              className="flex min-w-fit items-center gap-2 bg-(--vscode-editor-foreground)/20 px-2 py-0.5 text-xs font-medium text-(--vscode-editor-foreground)"
            >
              {getBranchIcons(local, remote, local?.current ?? remote?.current ?? false)}
              <span>{local?.cleanName ?? remote?.cleanName ?? baseName}</span>
            </div>
          ))}

        {commit.isStash && (
          <div className="flex min-w-fit items-center gap-2 bg-(--vscode-editor-foreground)/20 px-2 py-0.5 text-xs font-medium text-(--vscode-editor-foreground)">
            <FontAwesomeIcon key="stash" icon={faInbox} className="size-3 text-purple-500" />
            <span>{commit.refs}</span>
          </div>
        )}

        {commit.tags.length > 0 &&
          commit.tags.map(tag => (
            <div
              key={tag}
              className="flex min-w-fit items-center gap-2 bg-(--vscode-editor-foreground)/20 px-2 py-0.5 text-xs font-medium text-(--vscode-editor-foreground)"
            >
              <FontAwesomeIcon key={tag} icon={faTag} className="size-3 text-amber-500" />
              <span>{tag}</span>
            </div>
          ))}

        <h3 className="line-clamp-1 grow truncate text-xs font-semibold tracking-tighter">{commit.message}</h3>

        <time
          className="line-clamp-1 min-w-fit truncate text-xs font-medium tracking-tighter opacity-50"
          dateTime={commit.date.split('T')[0]}
        >
          {new Date(commit.date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>

        <time
          className="line-clamp-1 min-w-fit truncate text-xs font-medium tracking-tighter opacity-50"
          dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}
        >
          {new Date(commit.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </time>

        <Avatar email={commit.email} author={commit.author} size={20} />
      </button>

      {isExpanded && (
        <div
          ref={containerRef}
          className="relative mb-3 overflow-auto bg-(--vscode-editor-foreground)/3 px-4 py-3"
          style={{ height: `${panelHeight}px` }}
        >
          <div className="flex flex-col gap-1 text-xs font-medium">
            {commit.graph && (
              <div className="flex gap-2">
                <span className="opacity-50">Branch Graph:</span>
                <code
                  className="cursor-pointer px-1 transition-opacity hover:opacity-75"
                  onClick={() => copyText(commit.graph, 'Graph')}
                >
                  {commit.graph}
                </code>
              </div>
            )}

            {/*
            <div className="flex gap-2">
              <span className="opacity-50">Date:</span>

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
            </div> */}

            <div className="flex gap-2">
              <span className="opacity-50">Hash:</span>
              <code
                className="cursor-pointer px-1 transition-opacity hover:opacity-75"
                onClick={() => copyText(commit.hash, 'Hash')}
              >
                {commit.hash}
              </code>
            </div>

            <div className="flex gap-2">
              <span className="opacity-50">Author:</span>
              <span
                className="cursor-pointer transition-opacity hover:opacity-75"
                onClick={() => copyText(commit.author, 'Author')}
              >
                {commit.author}
              </span>
              <span
                className="cursor-pointer transition-opacity hover:opacity-75"
                onClick={() => copyText(commit.email, 'Email')}
              >
                ({commit.email})
              </span>
            </div>

            {/* {commit.refs && (
              <div className="flex gap-2">
                <span className="opacity-50">Refs:</span>
                <span
                  className="cursor-pointer transition-opacity hover:opacity-75"
                  onClick={() => copyText(commit.refs!, 'Refs')}
                >
                  {commit.refs}
                </span>
              </div>
            )} */}

            <div className="flex gap-2">
              <span className="opacity-50">Message:</span>
              <span
                className="cursor-pointer whitespace-pre-wrap transition-opacity hover:opacity-75"
                onClick={() => copyText(commit.message, 'Message')}
              >
                {commit.message}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'absolute right-0 bottom-0 left-0 h-1 border-b border-(--vscode-editor-foreground)/15 bg-transparent transition-colors hover:bg-(--vscode-editor-foreground)/20',
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
