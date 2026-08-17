import { gitHubIssueUrl, openOnGitHub, splitIssueReferences } from '@/util/github'
import type { GitHubRepo } from '@git/util/githubRepo'
import { FC, MouseEvent, useMemo } from 'react'

interface GitHubIssueTextProps {
  text: string
  /** The repository the references point into, or null to render the text as it is */
  repo: GitHubRepo | null
}

/**
 * A commit message with its `#123` references turned into links to that issue — or to the pull
 * request of the same number, which GitHub redirects to.
 */
export const GitHubIssueText: FC<GitHubIssueTextProps> = ({ text, repo }) => {
  const parts = useMemo(() => (repo ? splitIssueReferences(text) : null), [text, repo])

  if (!repo || !parts) return <>{text}</>

  return (
    <>
      {parts.map((part, index) =>
        part.issue ? (
          <span
            key={index}
            className="text-vsc-list-highlight-fg cursor-pointer hover:underline"
            title={`Open ${part.text} on GitHub`}
            onClick={(event: MouseEvent) => {
              // The message itself is clickable, and copying it is not what following a link means
              event.stopPropagation()
              openOnGitHub(gitHubIssueUrl(repo, part.issue!))
            }}
          >
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}
