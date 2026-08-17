import { useSettings } from '@/context/SettingsContext'
import { useRewordableCommits } from '@/hook/useGitQueries'
import { useMemo } from 'react'

export interface RewordEligibility {
  /** Distance from HEAD along the chain: 0 is HEAD itself, anything above rewrites that many descendants */
  index: number
  /** Whether the upstream already has the commit, so rewording it will need a force push */
  published: boolean
}

/**
 * Whether a commit's message can be rewritten, and what doing so costs. Null when it cannot:
 * the commit is not on the current branch's first-parent chain, the path from it to HEAD
 * crosses a merge, or it is already pushed and `rewordAllowPushed` is off.
 */
export const useRewordEligibility = (hash: string | undefined): RewordEligibility | null => {
  const { data: rewordable = [] } = useRewordableCommits()
  const { settings } = useSettings()

  return useMemo(() => {
    if (!hash) return null

    const index = rewordable.findIndex(commit => commit.hash === hash)
    if (index === -1) return null

    const { published } = rewordable[index]!
    if (published && !settings.rewordAllowPushed) return null

    return { index, published }
  }, [hash, rewordable, settings.rewordAllowPushed])
}
