import { ConfigState } from '@/hook/useGitQueries'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCodeBranch, faCodeCommit, faCodeMerge, faTrash, faUpload, faXmark } from '@fortawesome/free-solid-svg-icons'
import { GitBranch, GitCommit } from '@git/gitService'

export type DragActionId = 'merge' | 'rebase' | 'cherryPick' | 'push' | 'delete' | 'cancel'

export type DragPayload =
  | { kind: 'branch'; branch: GitBranch; colorIndex: number }
  | { kind: 'tag'; name: string; commit: GitCommit }
  | { kind: 'commit'; commit: GitCommit; colorIndex: number }

/**
 * A single box in a drag stack. `effect` names the refs involved, `note` says which ref moves.
 * When `disabledReason` is set the box refuses drops and shows the reason in place of the note.
 */
export interface DragAction {
  id: DragActionId
  verb: string
  effect: string
  note?: string
  icon: IconDefinition
  destructive: boolean
  isDefault: boolean
  disabledReason?: string
}

const SHORT_HASH_LENGTH = 7

export const shortHash = (hash: string) => hash.slice(0, SHORT_HASH_LENGTH)

export const payloadLabel = (payload: DragPayload) => {
  if (payload.kind === 'branch') return payload.branch.cleanName
  if (payload.kind === 'tag') return payload.name
  return shortHash(payload.commit.hash)
}

/**
 * Why the given branch cannot be checked out, or undefined when it can.
 * Every drag action runs as `checkout subject` followed by a HEAD-relative git command,
 * so this is the only gate an action has to pass.
 */
const checkoutBlocker = (branch: GitBranch): string | undefined => {
  if (branch.remote) return 'Remote branches cannot be checked out'
  if (branch.worktreePath) return `Checked out in worktree ${branch.worktreePath}`
  return undefined
}

/**
 * Actions offered by the pill being hovered. The checkout subject differs per action:
 * merging moves the target, so the target is checked out; rebasing moves the source,
 * so the source is checked out.
 */
export const resolveTargetActions = ({
  payload,
  target,
  config,
}: {
  payload: DragPayload
  target: GitBranch
  config: ConfigState
}): DragAction[] => {
  if (payload.kind === 'tag') return []

  if (payload.kind === 'commit') {
    // `none` only removes the on-release default — the box is still offered on hold.
    return [
      {
        id: 'cherryPick',
        verb: 'Cherry-pick',
        effect: `${shortHash(payload.commit.hash)} → ${target.cleanName}`,
        note: `${target.cleanName} moves`,
        icon: faCodeCommit,
        destructive: false,
        isDefault: config.dragAndDropCommitDefaultAction === 'cherryPick',
        disabledReason: checkoutBlocker(target),
      },
    ]
  }

  const source = payload.branch
  if (source.cleanName === target.cleanName && source.remote === target.remote) return []

  const allowed = config.dragAndDropBranchActions
  // A default that has been removed from `actions` cannot be offered, so nothing is the default.
  const defaultAction = allowed.includes(config.dragAndDropBranchDefaultAction as 'merge' | 'rebase')
    ? config.dragAndDropBranchDefaultAction
    : 'none'

  const actions: DragAction[] = []

  if (allowed.includes('merge')) {
    actions.push({
      id: 'merge',
      verb: 'Merge',
      effect: `${source.cleanName} → ${target.cleanName}`,
      note: `${target.cleanName} moves`,
      icon: faCodeMerge,
      destructive: false,
      isDefault: defaultAction === 'merge',
      disabledReason: checkoutBlocker(target),
    })
  }

  if (allowed.includes('rebase')) {
    actions.push({
      id: 'rebase',
      verb: 'Rebase',
      effect: `${source.cleanName} onto ${target.cleanName}`,
      note: `${source.cleanName} moves`,
      icon: faCodeBranch,
      destructive: false,
      isDefault: defaultAction === 'rebase',
      disabledReason: checkoutBlocker(source),
    })
  }

  return actions
}

/**
 * Actions that operate on the dragged item itself. These need no target, so they live in the
 * fixed rail rather than on a pill. Cancel is always present.
 */
export const resolveSourceActions = ({
  payload,
  config,
  remoteNames,
}: {
  payload: DragPayload
  config: ConfigState
  remoteNames: string[]
}): DragAction[] => {
  const actions: DragAction[] = []

  if (payload.kind !== 'commit') {
    const label = payloadLabel(payload)
    const isCurrentBranch = payload.kind === 'branch' && payload.branch.current

    if (config.dragAndDropSourceActions.includes('push') && remoteNames.length > 0) {
      actions.push({
        id: 'push',
        verb: 'Push',
        effect: `${label} → ${remoteNames.length === 1 ? remoteNames[0] : 'remote'}`,
        icon: faUpload,
        destructive: false,
        isDefault: false,
      })
    }

    if (config.dragAndDropSourceActions.includes('delete') && !isCurrentBranch) {
      actions.push({
        id: 'delete',
        verb: 'Delete',
        effect: label,
        icon: faTrash,
        destructive: true,
        isDefault: false,
      })
    }
  }

  actions.push({
    id: 'cancel',
    verb: 'Cancel',
    effect: 'nothing changes',
    icon: faXmark,
    destructive: false,
    isDefault: false,
  })

  return actions
}

export const isDragEnabled = (config: ConfigState) => config.dragAndDropEnabled
