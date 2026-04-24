import React from 'react'
import type { GitCommit } from '../../src/gitService'
import { Avatar } from './Avatar'
import { cn } from './utils/cn'

interface CommitItemProps {
  commit: GitCommit
  isExpanded: boolean
  onToggle: () => void
}

export const CommitItem: React.FC<CommitItemProps> = ({ commit, isExpanded, onToggle }) => {
  return (
    <section className="flex flex-col">
      <button
        className={cn(
          'flex min-h-6 w-full cursor-pointer items-center justify-between gap-2 rounded px-6 text-left transition-colors hover:bg-(--vscode-editor-foreground)/10',
          isExpanded && 'bg-(--vscode-editor-foreground)/10',
        )}
        onClick={onToggle}
      >
        <h3 className="line-clamp-1 grow truncate text-sm font-semibold tracking-tighter">{commit.message}</h3>

        <time
          className="line-clamp-1 min-w-fit truncate text-sm font-medium tracking-tighter opacity-50"
          dateTime={commit.date.split('T')[0]}
        >
          {new Date(commit.date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>

        <time
          className="line-clamp-1 min-w-fit truncate text-sm font-medium tracking-tighter opacity-50"
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
        <div className="mb-3 border-b border-(--vscode-editor-foreground)/10 bg-(--vscode-editor-foreground)/3 px-6 py-3">
          <div className="flex flex-col gap-1 text-xs font-medium">
            {commit.graph && (
              <div className="flex gap-2">
                <span className="opacity-50">Branch Graph:</span>
                <code>{commit.graph}</code>
              </div>
            )}

            <div className="flex gap-2">
              <span className="opacity-50">Hash:</span>
              <code> {commit.hash} </code>
            </div>

            <div className="flex gap-2">
              <span className="opacity-50">Author:</span>
              <span>{commit.author}</span>
            </div>

            <div className="flex gap-2">
              <span className="opacity-50">Email:</span>
              <span>{commit.email}</span>
            </div>

            <div className="flex gap-2">
              <span className="opacity-50">Date:</span>
              <span>{new Date(commit.date).toLocaleString()}</span>
            </div>

            {commit.refs && (
              <div className="flex gap-2">
                <span className="opacity-50">Refs:</span>
                <span>{commit.refs}</span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="opacity-50">Message:</span>
              <p className="whitespace-pre-wrap">{commit.message}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
