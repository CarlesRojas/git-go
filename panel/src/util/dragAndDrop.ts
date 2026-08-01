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
 * A single box in a drag stack. `effect` names the refs involved. When `disabledReason` is set
 * the box refuses drops and shows the reason in place of the effect.
 */
export interface DragAction {
  id: DragActionId
  verb: string
  effect: string
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
    return [
      {
        id: 'cherryPick',
        verb: 'Cherry-pick',
        effect: `${shortHash(payload.commit.hash)} → ${target.cleanName}`,
        icon: faCodeCommit,
        destructive: false,
        isDefault: true,
        disabledReason: checkoutBlocker(target),
      },
    ]
  }

  const source = payload.branch
  if (source.cleanName === target.cleanName && source.remote === target.remote) return []

  return [
    {
      id: 'merge',
      verb: 'Merge',
      effect: `${source.cleanName} → ${target.cleanName}`,
      icon: faCodeMerge,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'merge',
      disabledReason: checkoutBlocker(target),
    },
    {
      id: 'rebase',
      verb: 'Rebase',
      effect: `${source.cleanName} onto ${target.cleanName}`,
      icon: faCodeBranch,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'rebase',
      disabledReason: checkoutBlocker(source),
    },
  ]
}

/**
 * Actions that operate on the dragged item itself, shown beneath it rather than on a target.
 * Cancel is always present.
 */
export const resolveSourceActions = ({
  payload,
  remoteNames,
  currentBranch,
}: {
  payload: DragPayload
  remoteNames: string[]
  currentBranch?: string
}): DragAction[] => {
  const actions: DragAction[] = []

  if (payload.kind !== 'commit') {
    const label = payloadLabel(payload)
    // Compared by name rather than trusting `branch.current`, matching how the pills decide it.
    const isCurrentBranch = payload.kind === 'branch' && payload.branch.cleanName === currentBranch

    if (remoteNames.length > 0) {
      actions.push({
        id: 'push',
        verb: 'Push',
        effect: `${label} → ${remoteNames.length === 1 ? remoteNames[0] : 'remote'}`,
        icon: faUpload,
        destructive: false,
        isDefault: false,
      })
    }

    actions.push({
      id: 'delete',
      verb: 'Delete',
      effect: label,
      icon: faTrash,
      destructive: true,
      isDefault: false,
      // Shown but refused, so the box does not appear and disappear per branch.
      disabledReason: isCurrentBranch ? 'The checked-out branch cannot be deleted' : undefined,
    })
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
