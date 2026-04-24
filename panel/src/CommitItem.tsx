import React from 'react'
import type { GitCommit } from '../../src/gitService'
import { Avatar } from './Avatar'

interface CommitItemProps {
  commit: GitCommit
}

export const CommitItem: React.FC<CommitItemProps> = ({ commit }) => {
  return (
    <section className="flex h-6 max-h-6 min-h-6 items-center justify-between gap-2 px-2 py-0.5">
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
    </section>
  )
}
