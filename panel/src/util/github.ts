import { getVSCodeApi } from '@/hook/useGitQueries'
import type { GitHubRepo } from '@git/util/githubRepo'

/**
 * Links into the repository on github.com. Every one of them is built here rather than in the
 * component that opens it, so the extension host — which only opens github.com links — never has
 * to guess what a URL was meant to be.
 */

/** Encode a value made of path segments, keeping the separators: branch names can contain slashes */
const encodePath = (value: string) => value.split('/').map(encodeURIComponent).join('/')

const repoUrl = ({ owner, repo }: GitHubRepo) =>
  `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`

export const gitHubCommitUrl = (repo: GitHubRepo, hash: string) => `${repoUrl(repo)}/commit/${encodeURIComponent(hash)}`

/** The repository as of a ref, which is what a branch — or a tag with no release — opens */
export const gitHubTreeUrl = (repo: GitHubRepo, ref: string) => `${repoUrl(repo)}/tree/${encodePath(ref)}`

/** A tag's release page, which only exists when a release was cut for it */
export const gitHubReleaseUrl = (repo: GitHubRepo, tag: string) => `${repoUrl(repo)}/releases/tag/${encodePath(tag)}`

export const gitHubBlobUrl = (repo: GitHubRepo, ref: string, path: string) =>
  `${repoUrl(repo)}/blob/${encodeURIComponent(ref)}/${encodePath(path)}`

/** GitHub redirects to the pull request when the number turns out to be one */
export const gitHubIssueUrl = (repo: GitHubRepo, issue: string) =>
  `${repoUrl(repo)}/issues/${encodeURIComponent(issue)}`

/**
 * GitHub's pull request form, comparing the branch against the base it would merge into. Without a
 * base — the remote never recorded which branch its HEAD is — GitHub fills in the repository's
 * default branch itself.
 */
export const gitHubPullRequestUrl = (repo: GitHubRepo, head: string, base: string | null) =>
  `${repoUrl(repo)}/compare/${base ? `${encodePath(base)}...` : ''}${encodePath(head)}?expand=1`

/**
 * Open a github.com link in the browser.
 * @param url The link to open.
 * @param fallbackUrl A link to open instead when the first one turns out not to exist.
 */
export const openOnGitHub = (url: string, fallbackUrl?: string) => {
  getVSCodeApi().postMessage({ type: 'openExternal', url, fallbackUrl })
}

/** An issue reference in a commit message, as GitHub itself linkifies them */
const ISSUE_REFERENCE = /(^|[^\w#/])#(\d+)\b/g

interface MessagePart {
  text: string
  /** The issue number this part references, when it is a reference rather than plain text */
  issue?: string
}

/**
 * Split a commit message into its plain parts and its `#123` references, in order, so the message
 * renders as text with the references as links.
 */
export const splitIssueReferences = (message: string): MessagePart[] => {
  const parts: MessagePart[] = []
  let index = 0

  for (const match of message.matchAll(ISSUE_REFERENCE)) {
    const [reference, before = '', issue = ''] = match
    const start = match.index + before.length

    if (start > index) parts.push({ text: message.slice(index, start) })
    parts.push({ text: `#${issue}`, issue })
    index = match.index + reference.length
  }

  if (index < message.length) parts.push({ text: message.slice(index) })
  return parts
}
