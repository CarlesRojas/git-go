import React from 'react'
import Gravatar from 'react-gravatar'
import type { GitCommit } from '../../src/gitService'

interface CommitItemProps {
  commit: GitCommit
}

export const CommitItem: React.FC<CommitItemProps> = ({ commit }) => {
  const authorInitials = commit.author
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <section className="flex items-center justify-between gap-4 p-3">
      <div className="flex min-w-0 grow items-center gap-3">
        <h3 className="truncate text-base font-medium">{commit.message}</h3>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <time className="text-sm opacity-60" dateTime={commit.date.split('T')[0]}>
          {new Date(commit.date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </time>

        <time className="text-sm opacity-60" dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}>
          {new Date(commit.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </time>

        <div className="flex items-center gap-2">
          <Gravatar
            email={commit.email}
            size={24}
            default="identicon"
            className="h-6 w-6 rounded-full"
            alt={commit.author}
          />

          <span className="text-sm opacity-80">{commit.author}</span>
        </div>
      </div>
    </section>
  )
}
