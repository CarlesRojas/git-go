import { cn } from '@/util/cn'
import { openOnGitHub } from '@/util/github'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC, MouseEvent } from 'react'

interface GitHubLinkProps {
  url: string
  /** Opened instead when the first link turns out not to exist, such as a tag with no release */
  fallbackUrl?: string
  /** What the link opens, as the tooltip and the label read by a screen reader */
  title: string
  /** Shown next to the mark where the context alone would not say what the link is */
  label?: string
  className?: string
}

/**
 * The GitHub mark as a link. It carries no text of its own where what it opens is obvious from
 * what it sits next to — a commit hash, a file — and takes a short label where it is not.
 */
export const GitHubLink: FC<GitHubLinkProps> = ({ url, fallbackUrl, title, label, className }) => (
  <button
    type="button"
    title={title}
    onClick={(event: MouseEvent) => {
      // What these sit in answers clicks of its own — expanding a commit, copying a message —
      // and following a link is not meant to do those too
      event.stopPropagation()
      openOnGitHub(url, fallbackUrl)
    }}
    className={cn(
      'inline-flex cursor-pointer items-center gap-1 align-middle opacity-50 transition-opacity hover:opacity-100',
      className,
    )}
  >
    <FontAwesomeIcon icon={faGithub} className="size-3" />

    {label && <span className="text-xs leading-tight font-medium">{label}</span>}

    <span className="sr-only">{title}</span>
  </button>
)
