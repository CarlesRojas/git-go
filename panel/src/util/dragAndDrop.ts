import { ConfigState } from '@/hook/useGitQueries'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faCodeBranch,
  faCodeCommit,
  faCodeMerge,
  faDownload,
  faPen,
  faPlay,
  faRotateLeft,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { formatStash } from '@/component/StashTagPill'
import { qualifiedBranchName } from '@/util/branchName'
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
  | 'branchFromStash'
  | 'reword'

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
  'branchFromStash',
  'reword',
]

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
 * so this is the only gate an action has to pass. Checking out a remote branch lands on its
 * local counterpart — created from the remote when it does not exist yet — so a remote subject
 * is blocked only when that counterpart is.
 */
const checkoutBlocker = (branch: GitBranch, branches: GitBranch[]): string | undefined => {
  const subject = branch.remote
    ? (branches.find(other => !other.remote && other.cleanName === branch.cleanName) ?? null)
    : branch
  if (subject?.worktreePath) return `Checked out in worktree ${subject.worktreePath}`
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
  branches,
  config,
}: {
  payload: DragPayload
  target: GitBranch
  branches: GitBranch[]
  config: ConfigState
}): DragAction[] => {
  if (payload.kind === 'tag' || payload.kind === 'stash') return []

  if (payload.kind === 'commit') {
    const hash = shortHash(payload.commit.hash)
    const blocked = checkoutBlocker(target, branches)
    const targetLabel = qualifiedBranchName(target)

    return [
      {
        id: 'cherryPick',
        verb: 'Cherry-pick',
        description: ['Cherry pick commit ', { ref: hash }, ' into ', { ref: targetLabel }],
        icon: faCodeCommit,
        destructive: false,
        isDefault: true,
        disabledReason: blocked,
      },
      {
        id: 'mergeCommit',
        verb: 'Merge',
        description: ['Merge commit ', { ref: hash }, ' into ', { ref: targetLabel }],
        icon: faCodeMerge,
        destructive: false,
        isDefault: false,
        disabledReason: blocked,
      },
      {
        id: 'revert',
        verb: 'Revert',
        description: ['Revert commit ', { ref: hash }, ' on ', { ref: targetLabel }],
        icon: faRotateLeft,
        destructive: true,
        isDefault: false,
        disabledReason: blocked,
      },
    ]
  }

  const source = payload.branch
  if (source.name === target.name) return []

  // The same branch as local and remote counterpart. Since checking out either side of the
  // pair lands on the same local branch, only the direction that moves something is offered —
  // the other would check out the counterpart and act on itself.
  const counterparts = source.cleanName === target.cleanName

  const actions: DragAction[] = []

  if (!(counterparts && !source.remote && target.remote)) {
    actions.push({
      id: 'merge',
      verb: 'Merge',
      description: [
        'Merge branch ',
        { ref: qualifiedBranchName(source) },
        ' into ',
        { ref: qualifiedBranchName(target) },
      ],
      icon: faCodeMerge,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'merge',
      disabledReason: checkoutBlocker(target, branches),
    })
  }

  if (!(counterparts && source.remote && !target.remote)) {
    actions.push({
      id: 'rebase',
      verb: 'Rebase',
      description: [
        'Rebase branch ',
        { ref: qualifiedBranchName(source) },
        ' on branch ',
        { ref: qualifiedBranchName(target) },
      ],
      icon: faCodeBranch,
      destructive: false,
      isDefault: config.dragAndDropBranchDefaultAction === 'rebase',
      disabledReason: checkoutBlocker(source, branches),
    })
  }

  return actions
}

/**
 * Actions that operate on the dragged item itself, shown beneath it rather than on a target.
 * A commit offers only rewording its message, and only while it is eligible for it.
 */
export const resolveSourceActions = ({
  payload,
  remoteNames,
  currentBranch,
  rewordable = false,
  operationInProgress = null,
  workingTreeDirty = false,
}: {
  payload: DragPayload
  remoteNames: string[]
  currentBranch?: string
  /** Whether the dragged commit's message can be rewritten, per useRewordEligibility. */
  rewordable?: boolean
  operationInProgress?: string | null
  workingTreeDirty?: boolean
}): DragAction[] => {
  if (payload.kind === 'commit') {
    if (!rewordable) return []

    return [
      {
        id: 'reword',
        verb: 'Edit Message',
        description: ['Edit the message of commit ', { ref: shortHash(payload.commit.hash) }],
        icon: faPen,
        destructive: false,
        isDefault: false,
        disabledReason: operationInProgress ? `A ${operationInProgress} is in progress` : undefined,
      },
    ]
  }

  if (payload.kind === 'stash') {
    const branchFromStashBlocked = operationInProgress
      ? `A ${operationInProgress} is in progress`
      : workingTreeDirty
        ? 'The working tree has uncommitted changes'
        : undefined

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
        id: 'branchFromStash',
        verb: 'Create Branch',
        description: ['Create a branch from ', { ref: formatStash(payload.ref) }],
        icon: faCodeBranch,
        destructive: false,
        isDefault: false,
        disabledReason: branchFromStashBlocked,
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
