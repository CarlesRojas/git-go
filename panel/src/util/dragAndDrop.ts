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
import { formatStash } from '@/component/StashTagPill'
import { GitBranch, GitCommit } from '@git/gitService'

export type DragActionId =
  | 'merge'
  | 'rebase'
  | 'cherryPick'
  | 'mergeCommit'
  | 'revert'
  | 'push'
  | 'pushToRemote'
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
 * The value a pill publishes as its drop target. Remote refs are keyed by their full name so a
 * branch present both locally and on a remote resolves to the ref that was actually hovered.
 */
export const dropTargetKey = (branch: GitBranch): string =>
  branch.remote ? `${REMOTE_TARGET_PREFIX}${branch.name}` : branch.cleanName

/** The branch a drop target key was published for, or null when it no longer exists. */
export const findDropTarget = (branches: GitBranch[], key: string | null): GitBranch | null => {
  if (!key) return null

  if (key.startsWith(REMOTE_TARGET_PREFIX)) {
    const name = key.slice(REMOTE_TARGET_PREFIX.length)
    return branches.find(branch => branch.remote && branch.name === name) ?? null
  }

  return branches.find(branch => !branch.remote && branch.cleanName === key) ?? null
}

/**
 * Whether the branch on a remote is the one the local branch tracks by name, which is the only
 * pairing a drop between them can act on: pushing sends the local branch under its own name.
 */
export const isRemoteCounterpart = (source: GitBranch, target: GitBranch): boolean =>
  !source.remote && target.remote && source.cleanName === target.cleanName

/** A ref is kept separate from the surrounding words so it can be emphasised when rendered. */
export type DescriptionPart = string | { ref: string }

/**
 * A single box in a drag stack. `description` is worded as the dialog the action opens words
 * it, so the drag and the confirmation that follows read the same.
 */
export interface DragAction {
  id: DragActionId
  verb: string
  description: DescriptionPart[]
  icon: IconDefinition
  destructive: boolean
  isDefault: boolean
  disabledReason?: string
}

const REMOTE_TARGET_PREFIX = 'remote:'

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

  // Everything a remote ref could receive other than a push needs it checked out, which it never
  // can be, so a remote target offers the push or nothing at all.
  if (target.remote) {
    if (payload.kind !== 'branch') return []
    if (!isRemoteCounterpart(payload.branch, target) || !target.remoteName) return []

    return [
      {
        id: 'pushToRemote',
        verb: 'Push',
        description: ['Push branch ', { ref: payload.branch.cleanName }, ' to ', { ref: target.remoteName }],
        icon: faUpload,
        destructive: false,
        // A default action turned off in settings stays off here: the drop is still a branch
        // landing on a branch, and the boxes remain the way to act.
        isDefault: config.dragAndDropBranchDefaultAction !== 'none',
      },
    ]
  }

  if (payload.kind === 'commit') {
    const hash = shortHash(payload.commit.hash)
    const blocked = checkoutBlocker(target)

    return [
      {
        id: 'cherryPick',
        verb: 'Cherry-pick',
        description: ['Cherry pick commit ', { ref: hash }, ' into ', { ref: target.cleanName }],
        icon: faCodeCommit,
        destructive: false,
        isDefault: true,
        disabledReason: blocked,
      },
      {
        id: 'mergeCommit',
        verb: 'Merge',
        description: ['Merge commit ', { ref: hash }, ' into ', { ref: target.cleanName }],
        icon: faCodeMerge,
        destructive: false,
        isDefault: false,
        disabledReason: blocked,
      },
      {
        id: 'revert',
        verb: 'Revert',
        description: ['Revert commit ', { ref: hash }, ' on ', { ref: target.cleanName }],
        icon: faRotateLeft,
        destructive: true,
        isDefault: false,
        disabledReason: blocked,
      },
    ]
  }

  const source = payload.branch
  if (source.cleanName === target.cleanName && source.remote === target.remote) return []

  const actions: DragAction[] = [
    {
      id: 'merge',
      verb: 'Merge',
      description: ['Merge branch ', { ref: source.cleanName }, ' into ', { ref: target.cleanName }],
      icon: faCodeMerge,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'merge',
      disabledReason: checkoutBlocker(target),
    },
  ]

  // Rebasing moves the source, so it needs the source checked out. A remote ref never can be,
  // which is a property of the ref rather than a passing state, so the action is left out
  // entirely instead of offered and refused.
  if (!source.remote) {
    actions.push({
      id: 'rebase',
      verb: 'Rebase',
      description: ['Rebase branch ', { ref: source.cleanName }, ' on branch ', { ref: target.cleanName }],
      icon: faCodeBranch,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'rebase',
      disabledReason: checkoutBlocker(source),
    })
  }

  return actions
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
        description: ['Apply ', { ref: formatStash(payload.ref) }],
        icon: faPlay,
        destructive: false,
        isDefault: false,
      },
      {
        id: 'popStash',
        verb: 'Pop',
        description: ['Pop ', { ref: formatStash(payload.ref) }],
        icon: faArrowRightFromBracket,
        destructive: false,
        isDefault: false,
      },
      {
        id: 'dropStash',
        verb: 'Drop',
        description: ['Drop ', { ref: formatStash(payload.ref) }],
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
      verb: 'Fetch into Local',
      description: ['Fetch Remote Branch ', { ref: label }, ' into Local'],
      icon: faDownload,
      destructive: false,
      isDefault: false,
    })

    actions.push({
      id: 'delete',
      verb: 'Delete',
      description: [
        'Delete the remote branch ',
        { ref: label },
        ...(payload.branch.remoteName ? [' on ', { ref: payload.branch.remoteName }] : []),
      ],
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
      description:
        payload.kind === 'tag'
          ? ['Push ', { ref: label }, ' tag to remote']
          : ['Push branch ', { ref: label }, ...(remoteNames.length === 1 ? [' to ', { ref: remoteNames[0]! }] : [])],
      icon: faUpload,
      destructive: false,
      isDefault: false,
    })
  }

  actions.push({
    id: 'delete',
    verb: 'Delete',
    description: payload.kind === 'tag' ? ['Delete ', { ref: label }, ' tag'] : ['Delete the branch ', { ref: label }],
    icon: faTrash,
    destructive: true,
    isDefault: false,
    // Shown but refused, so the box does not appear and disappear per branch.
    disabledReason: isCurrentBranch ? 'The checked-out branch cannot be deleted' : undefined,
  })

  return actions
}
