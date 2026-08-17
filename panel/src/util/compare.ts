import { CompareSide } from '@/context/CompareContext'
import { qualifiedBranchName } from '@/util/branchName'
import { shortHash } from '@/util/dragAndDrop'
import { GitBranch, GitCommit } from '@git/gitService'

/**
 * A commit as one end of a comparison. Addressed by hash, since the row it came from may well
 * carry no ref at all.
 */
export const hashSide = (hash: string): CompareSide => ({ ref: hash, label: shortHash(hash), hash })

export const commitSide = (commit: GitCommit): CompareSide => hashSide(commit.hash)

/**
 * A branch as one end of a comparison, addressed by name so the header can say `main` rather
 * than the hash its tip happens to be at.
 */
export const branchSide = (branch: GitBranch): CompareSide => ({
  ref: qualifiedBranchName(branch),
  label: qualifiedBranchName(branch),
  hash: branch.hash,
})

/** A tag as one end of a comparison, resolved to the commit it points at for the row marker. */
export const tagSide = (name: string, commit: GitCommit): CompareSide => ({
  ref: name,
  label: name,
  hash: commit.hash,
})

const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

/**
 * Whether a click asked for a comparison rather than an expansion. Ctrl+click is the right-click
 * gesture on macOS, so there the modifier is Cmd alone — accepting both would open the context
 * menu and compare at once.
 */
export const isCompareModifier = (event: { metaKey: boolean; ctrlKey: boolean }): boolean =>
  IS_MAC ? event.metaKey : event.ctrlKey
