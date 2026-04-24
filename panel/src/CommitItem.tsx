import React from 'react'
import type { GitCommit } from '../../src/gitService'
import { Avatar } from './Avatar'

interface CommitItemProps {
  commit: GitCommit
}

export const CommitItem: React.FC<CommitItemProps> = ({ commit }) => {
  return (
    <section className="flex items-center justify-between gap-3 px-3 py-1">
      <div className="line-clamp-1 flex min-w-0 grow items-center gap-3 text-ellipsis">
        <h3 className="truncate text-base font-medium">{commit.message}</h3>
      </div>

      <time className="min-w-fit text-xs text-nowrap opacity-60" dateTime={commit.date.split('T')[0]}>
        {new Date(commit.date).toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </time>

      <time
        className="min-w-fit text-xs text-nowrap opacity-60"
        dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}
      >
        {new Date(commit.date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </time>

      <Avatar email={commit.email} author={commit.author} size={24} />
    </section>
  )
}
