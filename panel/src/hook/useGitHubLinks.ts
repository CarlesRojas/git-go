import { useSettings } from '@/context/SettingsContext'
import { useGitHubRepo } from '@/hook/useGitQueries'
import type { GitHubRepoInfo } from '@git/util/githubRepo'

export interface GitHubLinks {
  /** The repository every link points into, or null when the remotes are not on github.com */
  repo: GitHubRepoInfo | null
  /** Whether a commit can be opened on GitHub, from its hash and its context menu */
  commits: boolean
  /** Whether a branch or a tag can be opened on GitHub, from its context menu */
  refs: boolean
  /** Whether a file in the tree can be opened on GitHub as it was at that commit */
  files: boolean
  /** Whether `#123` in a commit message links to the issue */
  issues: boolean
  /** Whether a local branch can open GitHub's pull request form */
  pullRequests: boolean
}

/**
 * Which GitHub links to offer. Every one of them needs a `github.com` remote as well as its own
 * setting, so a repository hosted elsewhere shows none of them whatever the settings say.
 */
export const useGitHubLinks = (): GitHubLinks => {
  const { data: repo = null } = useGitHubRepo()
  const { settings } = useSettings()

  return {
    repo,
    commits: !!repo && settings.githubCommitLinks,
    refs: !!repo && settings.githubRefLinks,
    files: !!repo && settings.githubFileLinks,
    issues: !!repo && settings.githubIssueLinks,
    pullRequests: !!repo && settings.githubCreatePullRequest,
  }
}
