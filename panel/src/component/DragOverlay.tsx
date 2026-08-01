import { DragActionBox } from '@/component/DragActionBox'
import { DragGhost } from '@/component/DragGhost'
import { PendingDrop, SOURCE_ATTRIBUTE, useDragActions, useDragState } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useBranchDeleteDialog } from '@/hook/dialog/useBranchDeleteDialog'
import { useBranchMergeIntoCurrentDialog } from '@/hook/dialog/useBranchMergeDialog'
import { useBranchPushDialog } from '@/hook/dialog/useBranchPushDialog'
import { useRebaseCurrentBranchIntoBranch } from '@/hook/dialog/useBranchRebaseDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useMergeCommitIntoCurrentBranchDialog } from '@/hook/dialog/useMergeCommitIntoCurrentBranchDialog'
import { useRemoteBranchDeleteDialog } from '@/hook/dialog/useRemoteBranchDeleteDialog'
import { useRemoteBranchFetchIntoLocalDialog } from '@/hook/dialog/useRemoteBranchFetchIntoLocalDialog'
import { useRevertDialog } from '@/hook/dialog/useRevertDialog'
import { useStashDropDialog } from '@/hook/dialog/useStashDropDialog'
import { useTagDeleteDialog } from '@/hook/dialog/useTagDeleteDialog'
import { useTagPushDialog } from '@/hook/dialog/useTagPushDialog'
import { useFadePresence } from '@/hook/useFadePresence'
import {
  useApplyStash,
  useCheckoutLocalBranch,
  useCherryPickCommit,
  useCurrentBranch,
  useFetchIntoLocalBranch,
  useGitBranches,
  useGitRemotes,
  useMergeBranch,
  useMergeCommitIntoCurrentBranch,
  usePopStash,
  usePushBranch,
  useRebaseBranch,
} from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { DragAction, resolveSourceActions, resolveTargetActions, shortHash } from '@/util/dragAndDrop'
import {
  faCodeBranch,
  faCodeCommit,
  faCodeMerge,
  faDownload,
  faInbox,
  faUpload,
} from '@fortawesome/free-solid-svg-icons'
import { GitBranch, GitCommit } from '@git/gitService'
import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const EMPTY_BRANCH: GitBranch = { name: '', cleanName: '', current: false, remote: false, hash: '' }

const EMPTY_COMMIT: GitCommit = {
  hash: '',
  parents: [],
  author: '',
  email: '',
  date: '',
  message: '',
  tags: [],
}

interface LayoutRect {
  left: number
  top: number
  bottom: number
}

const STACK_GAP_PX = 8
/** One box, used only to decide whether a stack fits below its pill. */
const BOX_HEIGHT_ESTIMATE_PX = 42
const BOX_WIDTH_PX = 224
const VIEWPORT_MARGIN_PX = 8
/** Matches the opacity transition on the stacks, so they stay mounted until it finishes. */
const FADE_MS = 150

/**
 * A pill's laid-out box, ignoring any scale it is currently showing. getBoundingClientRect
 * measures the scaled box, which would move the stack as the pill grows and settles again;
 * the centre is the one point a scale leaves alone, so the box is rebuilt around it from the
 * untransformed layout size.
 */
const layoutRectOf = (element: HTMLElement): LayoutRect => {
  const rect = element.getBoundingClientRect()
  const centreX = rect.left + rect.width / 2
  const centreY = rect.top + rect.height / 2

  return {
    left: centreX - element.offsetWidth / 2,
    top: centreY - element.offsetHeight / 2,
    bottom: centreY + element.offsetHeight / 2,
  }
}

/**
 * Places a stack below the pill it belongs to, flipping above it and sliding left as needed so
 * it is never pushed off screen in a narrow panel. The gap to the pill is padding on the
 * wrapper rather than empty space, so pill and boxes stay a single hit region — crossing the
 * gap must not collapse the stack.
 */
const stackPositionFor = (rect: LayoutRect | null, count: number) => {
  if (!rect || count === 0) return null

  const height = count * BOX_HEIGHT_ESTIMATE_PX
  const fitsBelow = rect.bottom + STACK_GAP_PX + height <= window.innerHeight - VIEWPORT_MARGIN_PX
  const left = Math.max(VIEWPORT_MARGIN_PX, Math.min(rect.left, window.innerWidth - BOX_WIDTH_PX - VIEWPORT_MARGIN_PX))

  if (fitsBelow) return { top: rect.bottom, left, paddingTop: STACK_GAP_PX }

  return { top: Math.max(VIEWPORT_MARGIN_PX, rect.top - height - STACK_GAP_PX), left, paddingBottom: STACK_GAP_PX }
}

/**
 * Renders everything that only exists during a drag — the ghost, the dragged item's own
 * actions, and the stack revealed on the hovered target — and executes the drop.
 */
export const DragOverlay: FC = () => {
  const { payload, hoveredTargetKey, hoveredActionId, revealed, hoveredSource, pointerOverTarget, pendingDrop } =
    useDragState()
  const { clearPendingDrop, setDefaultAction, ghostRef } = useDragActions()

  const { settings } = useSettings()
  const { showToast } = useToast()
  const { data: branches = [] } = useGitBranches()
  const { data: remotes = [] } = useGitRemotes()
  const { data: currentBranch } = useCurrentBranch()
  const checkoutMutation = useCheckoutLocalBranch()

  const [dropBranch, setDropBranch] = useState<GitBranch | null>(null)
  const [dropCommit, setDropCommit] = useState<GitCommit | null>(null)
  const [dropStashRef, setDropStashRef] = useState('')
  const [stackRect, setStackRect] = useState<LayoutRect | null>(null)
  const [sourceRect, setSourceRect] = useState<LayoutRect | null>(null)

  const mergeDialog = useBranchMergeIntoCurrentDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const rebaseDialog = useRebaseCurrentBranchIntoBranch({ branch: dropBranch ?? EMPTY_BRANCH })
  const pushDialog = useBranchPushDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const deleteDialog = useBranchDeleteDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const cherryPickDialog = useCherryPickDialog({ commit: dropCommit ?? EMPTY_COMMIT })
  const tagPushDialog = useTagPushDialog()
  const tagDeleteDialog = useTagDeleteDialog()
  const mergeCommitDialog = useMergeCommitIntoCurrentBranchDialog({ commit: dropCommit ?? EMPTY_COMMIT })
  const revertDialog = useRevertDialog({ commit: dropCommit ?? EMPTY_COMMIT })
  const stashDropDialog = useStashDropDialog({ stash: dropStashRef })
  const remoteFetchDialog = useRemoteBranchFetchIntoLocalDialog()
  const remoteDeleteDialog = useRemoteBranchDeleteDialog()
  const applyStashMutation = useApplyStash()
  const popStashMutation = usePopStash()

  // Auto mode runs these in place of their dialog, with the values the dialog would have
  // opened with, so confirming a dialog and skipping it produce the same command.
  const mergeBranchMutation = useMergeBranch()
  const rebaseBranchMutation = useRebaseBranch()
  const cherryPickMutation = useCherryPickCommit()
  const mergeCommitMutation = useMergeCommitIntoCurrentBranch()
  const pushBranchMutation = usePushBranch()
  const fetchIntoLocalMutation = useFetchIntoLocalBranch()

  const targetBranch = useMemo(
    () => branches.find(branch => !branch.remote && branch.cleanName === hoveredTargetKey) ?? null,
    [branches, hoveredTargetKey],
  )

  const targetActions = useMemo(() => {
    if (!payload || !targetBranch) return []
    return resolveTargetActions({ payload, target: targetBranch, config: settings })
  }, [payload, targetBranch, settings])

  const sourceActions = useMemo(() => {
    if (!payload) return []
    return resolveSourceActions({
      payload,
      remoteNames: remotes.map(remote => remote.name),
      currentBranch: currentBranch ?? undefined,
    })
  }, [payload, remotes, currentBranch])

  // Refused actions are dropped from the stack rather than shown greyed. The unfiltered lists
  // survive so the dragged item's label can still say why a blocked default is unavailable.
  const visibleTargetActions = useMemo(() => targetActions.filter(action => !action.disabledReason), [targetActions])
  const visibleSourceActions = useMemo(() => sourceActions.filter(action => !action.disabledReason), [sourceActions])

  const defaultTargetAction = useMemo(
    () => targetActions.find(action => action.isDefault && !action.disabledReason) ?? null,
    [targetActions],
  )

  /** The action a release would run if it were not blocked — used only to explain why it is. */
  const blockedDefaultAction = useMemo(
    () => targetActions.find(action => action.isDefault && action.disabledReason) ?? null,
    [targetActions],
  )

  // With nothing to perform on release there is no reason to make the user hold: the boxes are
  // the only way to act, so they open on contact. This covers a target that cannot be checked
  // out — one held by a worktree, say — as well as a default action turned off in settings.
  const revealOnContact = visibleTargetActions.length > 0 && !defaultTargetAction

  // Layout effect so the default lands in the same frame as the hover that produced it —
  // a plain effect can miss a hover-and-release inside one frame.
  useLayoutEffect(() => {
    setDefaultAction(defaultTargetAction?.id ?? null)
  }, [defaultTargetAction, setDefaultAction])

  // Both stacks anchor to a pill the same way: measure it, and re-measure while the graph
  // scrolls under it.
  useLayoutEffect(() => {
    const selector =
      (revealed || revealOnContact) && hoveredTargetKey
        ? `[data-drop-target="${CSS.escape(hoveredTargetKey)}"]`
        : undefined

    if (!selector) {
      setStackRect(null)
      return
    }

    const measure = () => {
      const element = document.querySelector<HTMLElement>(selector)
      setStackRect(element ? layoutRectOf(element) : null)
    }
    measure()

    const container = document.querySelector<HTMLElement>('[data-drag-scroll-container]')
    container?.addEventListener('scroll', measure)
    return () => container?.removeEventListener('scroll', measure)
  }, [revealed, revealOnContact, hoveredTargetKey])

  useLayoutEffect(() => {
    if (!hoveredSource) {
      setSourceRect(null)
      return
    }

    const measure = () => {
      const element = document.querySelector<HTMLElement>(`[${SOURCE_ATTRIBUTE}]`)
      setSourceRect(element ? layoutRectOf(element) : null)
    }
    measure()

    const container = document.querySelector<HTMLElement>('[data-drag-scroll-container]')
    container?.addEventListener('scroll', measure)
    return () => container?.removeEventListener('scroll', measure)
  }, [hoveredSource])

  const execute = useCallback(
    async (drop: PendingDrop) => {
      const target = drop.targetKey
        ? (branches.find(branch => !branch.remote && branch.cleanName === drop.targetKey) ?? null)
        : null

      // Merging moves the target so the target is checked out; rebasing moves the source so
      // the source is. Both then run the existing HEAD-relative command.
      const checkoutSubject = (['merge', 'cherryPick', 'mergeCommit', 'revert'] as const).some(
        id => id === drop.actionId,
      )
        ? target
        : drop.actionId === 'rebase' && drop.payload.kind === 'branch'
          ? drop.payload.branch
          : null

      if (checkoutSubject && checkoutSubject.cleanName !== currentBranch) {
        try {
          await checkoutMutation.mutateAsync({ branchName: checkoutSubject.cleanName })
        } catch (error) {
          showToast({
            text: error instanceof Error ? error.message : `Could not check out '${checkoutSubject.cleanName}'`,
            type: 'error',
            icon: faCodeBranch,
          })
          return
        }

        // HEAD moving is a side effect of the drop rather than something the user asked for,
        // so say so — otherwise a later failure looks like it happened on the wrong branch.
        showToast({ text: `Checked out '${checkoutSubject.cleanName}'`, icon: faCodeBranch, type: 'info' })
      }

      switch (drop.actionId) {
        case 'merge': {
          if (drop.payload.kind !== 'branch') return
          const merged = drop.payload.branch

          if (settings.dragAndDropAutoMerge) {
            mergeBranchMutation.mutate(
              {
                branchName: merged.cleanName,
                fastForwardIfPossible: settings.mergeFastForwardIfPossible,
                squash: settings.mergeSquash,
                noCommit: settings.mergeNoCommit,
              },
              {
                onSuccess: () =>
                  showToast({
                    text: `Branch '${merged.cleanName}' merged into '${target?.cleanName}' successfully`,
                    icon: faCodeMerge,
                    type: 'success',
                  }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faCodeMerge }),
              },
            )
            return
          }

          setDropBranch(merged)
          mergeDialog.openDialog()
          return
        }

        case 'rebase':
          if (!target) return

          if (settings.dragAndDropAutoRebase) {
            rebaseBranchMutation.mutate(
              { branchName: target.cleanName, ignoreDate: settings.branchRebaseIgnoreDate },
              {
                onSuccess: () =>
                  showToast({
                    text: `Current branch rebased onto '${target.cleanName}' successfully`,
                    icon: faCodeBranch,
                    type: 'success',
                  }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faCodeBranch }),
              },
            )
            return
          }

          setDropBranch(target)
          rebaseDialog.openDialog()
          return

        case 'cherryPick': {
          if (drop.payload.kind !== 'commit') return
          const picked = drop.payload.commit

          if (settings.dragAndDropAutoCherryPick) {
            cherryPickMutation.mutate(
              {
                commitHash: picked.hash,
                recordOrigin: settings.cherryPickRecordOrigin,
                noCommit: settings.cherryPickNoCommit,
              },
              {
                onSuccess: () =>
                  showToast({ text: 'Commit cherry-picked successfully', icon: faCodeCommit, type: 'success' }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faCodeCommit }),
              },
            )
            return
          }

          setDropCommit(picked)
          cherryPickDialog.openDialog()
          return
        }

        case 'push': {
          if (drop.payload.kind === 'tag') {
            tagPushDialog.openDialog(drop.payload.commit, drop.payload.name)
            return
          }
          if (drop.payload.kind !== 'branch') return
          const pushed = drop.payload.branch

          if (settings.dragAndDropAutoPush) {
            pushBranchMutation.mutate(
              {
                branchName: pushed.cleanName,
                remote: 'origin',
                setUpstream: settings.branchPushSetUpstream,
                pushMode: 'normal',
              },
              {
                onSuccess: () =>
                  showToast({
                    text: `Branch '${pushed.cleanName}' pushed to 'origin' successfully`,
                    icon: faUpload,
                    type: 'success',
                  }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faUpload }),
              },
            )
            return
          }

          setDropBranch(pushed)
          pushDialog.openDialog()
          return
        }

        case 'mergeCommit': {
          if (drop.payload.kind !== 'commit') return
          const mergedCommit = drop.payload.commit

          if (settings.dragAndDropAutoMergeCommit) {
            mergeCommitMutation.mutate(
              {
                commitHash: mergedCommit.hash,
                fastForwardIfPossible: settings.mergeFastForwardIfPossible,
                squash: settings.mergeSquash,
                noCommit: settings.mergeNoCommit,
              },
              {
                onSuccess: () =>
                  showToast({
                    text: `Commit ${shortHash(mergedCommit.hash)} merged into '${target?.cleanName}' successfully`,
                    icon: faCodeMerge,
                    type: 'success',
                  }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faCodeMerge }),
              },
            )
            return
          }

          setDropCommit(mergedCommit)
          mergeCommitDialog.openDialog()
          return
        }

        case 'revert':
          if (drop.payload.kind !== 'commit') return
          setDropCommit(drop.payload.commit)
          revertDialog.openDialog()
          return

        case 'delete':
          if (drop.payload.kind === 'tag') {
            tagDeleteDialog.openDialog(drop.payload.name)
            return
          }
          if (drop.payload.kind !== 'branch') return
          // Deleting a remote branch deletes it on the remote, which is its own dialog.
          if (drop.payload.branch.remote) {
            remoteDeleteDialog.openDialog(drop.payload.branch)
            return
          }
          setDropBranch(drop.payload.branch)
          deleteDialog.openDialog()
          return

        case 'fetchIntoLocal': {
          if (drop.payload.kind !== 'branch') return
          const fetched = drop.payload.branch

          // Without a remote name there is no command to build, so the dialog handles it.
          if (settings.dragAndDropAutoFetchIntoLocal && fetched.remoteName) {
            const checkout = settings.remoteFetchCheckout
            fetchIntoLocalMutation.mutate(
              {
                remote: fetched.remoteName,
                remoteBranch: fetched.cleanName,
                localBranch: fetched.cleanName,
                forceFetch: settings.remoteFetchForceFetch,
                checkout,
              },
              {
                onSuccess: () =>
                  showToast({
                    text: checkout
                      ? `Fetched remote branch '${fetched.cleanName}' into local and checked it out successfully`
                      : `Fetched remote branch '${fetched.cleanName}' into local successfully`,
                    icon: faDownload,
                    type: 'success',
                  }),
                onError: error => showToast({ text: error.message, type: 'error', icon: faDownload }),
              },
            )
            return
          }

          void remoteFetchDialog.openDialog(fetched)
          return
        }

        case 'applyStash': {
          if (drop.payload.kind !== 'stash') return
          const stashSelector = drop.payload.ref
          applyStashMutation.mutate(
            { stashSelector, reinstateIndex: false },
            {
              onSuccess: () => showToast({ text: `Applied '${stashSelector}'`, icon: faInbox, type: 'success' }),
              onError: error => showToast({ text: error.message, type: 'error', icon: faInbox }),
            },
          )
          return
        }

        case 'popStash': {
          if (drop.payload.kind !== 'stash') return
          const stashSelector = drop.payload.ref
          popStashMutation.mutate(
            { stashSelector, reinstateIndex: false },
            {
              onSuccess: () => showToast({ text: `Popped '${stashSelector}'`, icon: faInbox, type: 'success' }),
              onError: error => showToast({ text: error.message, type: 'error', icon: faInbox }),
            },
          )
          return
        }

        case 'dropStash':
          if (drop.payload.kind !== 'stash') return
          setDropStashRef(drop.payload.ref)
          stashDropDialog.openDialog()
          return
      }
    },
    [
      branches,
      currentBranch,
      checkoutMutation,
      showToast,
      mergeDialog,
      rebaseDialog,
      cherryPickDialog,
      pushDialog,
      deleteDialog,
      tagPushDialog,
      tagDeleteDialog,
      mergeCommitDialog,
      revertDialog,
      stashDropDialog,
      remoteFetchDialog,
      remoteDeleteDialog,
      applyStashMutation,
      popStashMutation,
      settings,
      mergeBranchMutation,
      rebaseBranchMutation,
      cherryPickMutation,
      mergeCommitMutation,
      pushBranchMutation,
      fetchIntoLocalMutation,
    ],
  )

  useEffect(() => {
    if (!pendingDrop) return
    clearPendingDrop()
    void execute(pendingDrop)
    // `execute` is intentionally omitted: it changes identity every render and the drop must
    // run exactly once per pendingDrop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDrop, clearPendingDrop])

  const targetStackPosition = useMemo(
    () => stackPositionFor(stackRect, visibleTargetActions.length),
    [stackRect, visibleTargetActions],
  )

  const sourceStackPosition = useMemo(
    () => stackPositionFor(sourceRect, visibleSourceActions.length),
    [sourceRect, visibleSourceActions],
  )

  const targetStackVisible =
    (revealed || revealOnContact) && !!targetStackPosition && !!hoveredTargetKey && visibleTargetActions.length > 0
  const sourceStackVisible = hoveredSource && !!sourceStackPosition && visibleSourceActions.length > 0

  // The position and actions are cleared the moment a stack stops being visible, so the last
  // ones are held on to for the duration of the fade.
  const targetSnapshot = useRef<{ position: object; actions: DragAction[]; key: string } | null>(null)
  if (targetStackVisible) {
    targetSnapshot.current = { position: targetStackPosition, actions: visibleTargetActions, key: hoveredTargetKey }
  }

  const sourceSnapshot = useRef<{ position: object; actions: DragAction[] } | null>(null)
  if (sourceStackVisible) sourceSnapshot.current = { position: sourceStackPosition, actions: visibleSourceActions }

  const targetFade = useFadePresence(targetStackVisible, FADE_MS)
  const sourceFade = useFadePresence(sourceStackVisible, FADE_MS)

  const pendingAction = useMemo<DragAction | null>(() => {
    if (!payload) return null

    const onTargetDefault = pointerOverTarget ? (defaultTargetAction ?? blockedDefaultAction) : null

    return (
      [...targetActions, ...sourceActions].find(action => action.id === hoveredActionId) ??
      (hoveredActionId === null ? onTargetDefault : null)
    )
  }, [
    payload,
    targetActions,
    sourceActions,
    hoveredActionId,
    defaultTargetAction,
    blockedDefaultAction,
    pointerOverTarget,
  ])

  const dialogs = (
    <>
      {mergeDialog.DialogComponent}
      {rebaseDialog.DialogComponent}
      {pushDialog.DialogComponent}
      {deleteDialog.DialogComponent}
      {cherryPickDialog.DialogComponent}
      {tagPushDialog.DialogComponent}
      {tagDeleteDialog.DialogComponent}
      {mergeCommitDialog.DialogComponent}
      {revertDialog.DialogComponent}
      {stashDropDialog.DialogComponent}
      {remoteFetchDialog.DialogComponent}
      {remoteDeleteDialog.DialogComponent}
    </>
  )

  if (!payload) return dialogs

  return (
    <>
      {dialogs}

      <div className="pointer-events-none fixed inset-0 z-50">
        {/* Actions on the dragged item itself, shown under it whenever the pointer is on it. */}
        {sourceFade.mounted && sourceSnapshot.current && (
          <div
            data-drag-source-zone={sourceFade.shown ? '' : undefined}
            className={cn(
              'absolute z-10 flex flex-col transition-opacity duration-150',
              // Untargetable while fading out, so a release cannot land on a stale box.
              sourceFade.shown ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={sourceSnapshot.current.position}
          >
            {sourceSnapshot.current.actions.map((action, index) => (
              <DragActionBox
                key={action.id}
                action={action}
                hovered={hoveredActionId === action.id}
                isFirst={index === 0}
                isLast={index === sourceSnapshot.current!.actions.length - 1}
              />
            ))}
          </div>
        )}

        {targetFade.mounted && targetSnapshot.current && (
          <div
            // Carries the target key so the padded bridge back to the pill keeps the stack
            // open while the pointer travels to a box, without counting as the target itself.
            data-drop-bridge={targetFade.shown ? targetSnapshot.current.key : undefined}
            className={cn(
              'absolute z-10 flex flex-col transition-opacity duration-150',
              // Untargetable while fading out, so a release cannot land on a stale box.
              targetFade.shown ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={targetSnapshot.current.position}
          >
            {targetSnapshot.current.actions.map((action, index) => (
              <DragActionBox
                key={action.id}
                action={action}
                isFirst={index === 0}
                isLast={index === targetSnapshot.current!.actions.length - 1}
                // With the pointer on the pill rather than a box, the action a release would
                // perform is highlighted, so the box and the pill agree on what happens next.
                // Once the pointer leaves, a release does nothing, so nothing stays highlighted.
                hovered={
                  hoveredActionId === action.id ||
                  (!hoveredActionId && pointerOverTarget && action.id === defaultTargetAction?.id)
                }
              />
            ))}
          </div>
        )}

        {/* Last and highest so it is never covered by a stack. */}
        <div ref={ghostRef} className="absolute top-0 left-0 z-20 will-change-transform">
          <div className="-translate-y-1/2">
            <DragGhost payload={payload} pendingAction={pendingAction} />
          </div>
        </div>
      </div>
    </>
  )
}
