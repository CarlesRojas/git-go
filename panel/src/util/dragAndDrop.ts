import { ConfigState } from '@/hook/useGitQueries'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faCodeBranch,
  faCodeCommit,
  faCodeMerge,
  faDownload,
  faPlay,
  faRotateLeft,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { GitBranch, GitCommit } from '@git/gitService'

export type DragActionId =
  | 'merge'
  | 'rebase'
  | 'cherryPick'
  | 'mergeCommit'
  | 'revert'
  | 'push'
  | 'delete'
  | 'fetchIntoLocal'
  | 'applyStash'
  | 'popStash'
  | 'dropStash'

export type DragPayload =
  | { kind: 'branch'; branch: GitBranch; colorIndex: number }
  | { kind: 'tag'; name: string; commit: GitCommit }
  | { kind: 'stash'; ref: string; commit: GitCommit }
  | { kind: 'commit'; commit: GitCommit; colorIndex: number }

/** Kinds with no valid drop target, whose own actions are therefore the only ones on offer. */
export const TARGETLESS_KINDS: DragPayload['kind'][] = ['tag', 'stash']

/** Actions that operate on the dragged item itself and so need no target. */
export const SOURCE_ACTION_IDS: DragActionId[] = [
  'push',
  'delete',
  'fetchIntoLocal',
  'applyStash',
  'popStash',
  'dropStash',
]

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
  if (payload.kind === 'stash') return payload.ref
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
  if (payload.kind === 'tag' || payload.kind === 'stash') return []

  if (payload.kind === 'commit') {
    const hash = shortHash(payload.commit.hash)
    const blocked = checkoutBlocker(target)

    return [
      {
        id: 'cherryPick',
        verb: 'Cherry-pick',
        effect: `${hash} → ${target.cleanName}`,
        icon: faCodeCommit,
        destructive: false,
        isDefault: true,
        disabledReason: blocked,
      },
      {
        id: 'mergeCommit',
        verb: 'Merge',
        effect: `${hash} → ${target.cleanName}`,
        icon: faCodeMerge,
        destructive: false,
        isDefault: false,
        disabledReason: blocked,
      },
      {
        id: 'revert',
        verb: 'Revert',
        effect: `${hash} on ${target.cleanName}`,
        icon: faRotateLeft,
        destructive: true,
        isDefault: false,
        disabledReason: blocked,
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
      // Rebasing moves the source, so a remote source is refused here rather than on the target.
      disabledReason: checkoutBlocker(source),
    },
  ]
}

/**
 * Actions that operate on the dragged item itself, shown beneath it rather than on a target.
 * Empty for a commit, which has no action that does not need a target.
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
  if (payload.kind === 'commit') return []

  if (payload.kind === 'stash') {
    return [
      {
        id: 'applyStash',
        verb: 'Apply',
        effect: payload.ref,
        icon: faPlay,
        destructive: false,
        isDefault: false,
      },
      {
        id: 'popStash',
        verb: 'Pop',
        effect: `${payload.ref} — applies and drops`,
        icon: faArrowRightFromBracket,
        destructive: false,
        isDefault: false,
      },
      {
        id: 'dropStash',
        verb: 'Drop',
        effect: payload.ref,
        icon: faTrash,
        destructive: true,
        isDefault: false,
      },
    ]
  }

  const label = payloadLabel(payload)
  const actions: DragAction[] = []

  // A remote branch is fetched rather than pushed, and deleting it deletes it on the remote.
  if (payload.kind === 'branch' && payload.branch.remote) {
    actions.push({
      id: 'fetchIntoLocal',
      verb: 'Fetch',
      effect: `${label} → local`,
      icon: faDownload,
      destructive: false,
      isDefault: false,
    })

    actions.push({
      id: 'delete',
      verb: 'Delete',
      effect: `${label} on ${payload.branch.remoteName ?? 'remote'}`,
      icon: faTrash,
      destructive: true,
      isDefault: false,
    })

    return actions
  }

  // Decided the same way the pills do it: %(HEAD) from git is the authoritative per-worktree
  // marker, with the name comparison covering branch data that predates it.
  const isCurrentBranch =
    payload.kind === 'branch' && (payload.branch.current || payload.branch.cleanName === currentBranch)

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

  return actions
}
