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
import { useTagDeleteDialog } from '@/hook/dialog/useTagDeleteDialog'
import { useTagPushDialog } from '@/hook/dialog/useTagPushDialog'
import { useFadePresence } from '@/hook/useFadePresence'
import { useCheckoutLocalBranch, useCurrentBranch, useGitBranches, useGitRemotes } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { DragAction, resolveSourceActions, resolveTargetActions } from '@/util/dragAndDrop'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
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

const STACK_GAP_PX = 8
const BOX_HEIGHT_ESTIMATE_PX = 52
const BOX_WIDTH_PX = 224
const VIEWPORT_MARGIN_PX = 8
/** Matches the opacity transition on the stacks, so they stay mounted until it finishes. */
const FADE_MS = 150

/**
 * Places a stack below the pill it belongs to, flipping above it and sliding left as needed so
 * it is never pushed off screen in a narrow panel. The gap to the pill is padding on the
 * wrapper rather than empty space, so pill and boxes stay a single hit region — crossing the
 * gap must not collapse the stack.
 */
const stackPositionFor = (rect: DOMRect | null, count: number) => {
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
  const [stackRect, setStackRect] = useState<DOMRect | null>(null)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)

  const mergeDialog = useBranchMergeIntoCurrentDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const rebaseDialog = useRebaseCurrentBranchIntoBranch({ branch: dropBranch ?? EMPTY_BRANCH })
  const pushDialog = useBranchPushDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const deleteDialog = useBranchDeleteDialog({ branch: dropBranch ?? EMPTY_BRANCH })
  const cherryPickDialog = useCherryPickDialog({ commit: dropCommit ?? EMPTY_COMMIT })
  const tagPushDialog = useTagPushDialog()
  const tagDeleteDialog = useTagDeleteDialog()

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

  const defaultTargetAction = useMemo(
    () => targetActions.find(action => action.isDefault && !action.disabledReason) ?? null,
    [targetActions],
  )

  // Layout effect so the default lands in the same frame as the hover that produced it —
  // a plain effect can miss a hover-and-release inside one frame.
  useLayoutEffect(() => {
    setDefaultAction(defaultTargetAction?.id ?? null)
  }, [defaultTargetAction, setDefaultAction])

  // Both stacks anchor to a pill the same way: measure it, and re-measure while the graph
  // scrolls under it.
  useLayoutEffect(() => {
    const selector = revealed && hoveredTargetKey ? `[data-drop-target="${CSS.escape(hoveredTargetKey)}"]` : undefined

    if (!selector) {
      setStackRect(null)
      return
    }

    const measure = () => setStackRect(document.querySelector<HTMLElement>(selector)?.getBoundingClientRect() ?? null)
    measure()

    const container = document.querySelector<HTMLElement>('[data-drag-scroll-container]')
    container?.addEventListener('scroll', measure)
    return () => container?.removeEventListener('scroll', measure)
  }, [revealed, hoveredTargetKey])

  useLayoutEffect(() => {
    if (!hoveredSource) {
      setSourceRect(null)
      return
    }

    const measure = () =>
      setSourceRect(document.querySelector<HTMLElement>(`[${SOURCE_ATTRIBUTE}]`)?.getBoundingClientRect() ?? null)
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
      const checkoutSubject =
        drop.actionId === 'merge' || drop.actionId === 'cherryPick'
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
        case 'merge':
          if (drop.payload.kind !== 'branch') return
          setDropBranch(drop.payload.branch)
          mergeDialog.openDialog()
          return

        case 'rebase':
          if (!target) return
          setDropBranch(target)
          rebaseDialog.openDialog()
          return

        case 'cherryPick':
          if (drop.payload.kind !== 'commit') return
          setDropCommit(drop.payload.commit)
          cherryPickDialog.openDialog()
          return

        case 'push':
          if (drop.payload.kind === 'tag') {
            tagPushDialog.openDialog(drop.payload.commit, drop.payload.name)
            return
          }
          if (drop.payload.kind !== 'branch') return
          setDropBranch(drop.payload.branch)
          pushDialog.openDialog()
          return

        case 'delete':
          if (drop.payload.kind === 'tag') {
            tagDeleteDialog.openDialog(drop.payload.name)
            return
          }
          if (drop.payload.kind !== 'branch') return
          setDropBranch(drop.payload.branch)
          deleteDialog.openDialog()
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
    () => stackPositionFor(stackRect, targetActions.length),
    [stackRect, targetActions],
  )

  const sourceStackPosition = useMemo(
    () => stackPositionFor(sourceRect, sourceActions.length),
    [sourceRect, sourceActions],
  )

  const targetStackVisible = revealed && !!targetStackPosition && !!hoveredTargetKey && targetActions.length > 0
  const sourceStackVisible = hoveredSource && !!sourceStackPosition && sourceActions.length > 0

  // The position and actions are cleared the moment a stack stops being visible, so the last
  // ones are held on to for the duration of the fade.
  const targetSnapshot = useRef<{ position: object; actions: DragAction[]; key: string } | null>(null)
  if (targetStackVisible) {
    targetSnapshot.current = { position: targetStackPosition, actions: targetActions, key: hoveredTargetKey }
  }

  const sourceSnapshot = useRef<{ position: object; actions: DragAction[] } | null>(null)
  if (sourceStackVisible) sourceSnapshot.current = { position: sourceStackPosition, actions: sourceActions }

  const targetFade = useFadePresence(targetStackVisible, FADE_MS)
  const sourceFade = useFadePresence(sourceStackVisible, FADE_MS)

  const pendingLabel = useMemo(() => {
    if (!payload) return null

    const hovered: DragAction | undefined =
      [...targetActions, ...sourceActions].find(action => action.id === hoveredActionId) ??
      (hoveredActionId === null ? (defaultTargetAction ?? undefined) : undefined)

    if (!hovered) return null
    if (hovered.disabledReason) return hovered.disabledReason

    return `${hovered.verb} ${hovered.effect}`
  }, [payload, targetActions, sourceActions, hoveredActionId, defaultTargetAction])

  const dialogs = (
    <>
      {mergeDialog.DialogComponent}
      {rebaseDialog.DialogComponent}
      {pushDialog.DialogComponent}
      {deleteDialog.DialogComponent}
      {cherryPickDialog.DialogComponent}
      {tagPushDialog.DialogComponent}
      {tagDeleteDialog.DialogComponent}
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
              'absolute z-10 flex flex-col gap-1.5 transition-opacity duration-150',
              // Untargetable while fading out, so a release cannot land on a stale box.
              sourceFade.shown ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={sourceSnapshot.current.position}
          >
            {sourceSnapshot.current.actions.map(action => (
              <DragActionBox key={action.id} action={action} hovered={hoveredActionId === action.id} />
            ))}
          </div>
        )}

        {targetFade.mounted && targetSnapshot.current && (
          <div
            // Carries the target key so the padded bridge back to the pill counts as the same
            // target, keeping the stack open while the pointer travels to a box.
            data-drop-target={targetFade.shown ? targetSnapshot.current.key : undefined}
            className={cn(
              'absolute z-10 flex flex-col gap-1.5 transition-opacity duration-150',
              // Untargetable while fading out, so a release cannot land on a stale box.
              targetFade.shown ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
            )}
            style={targetSnapshot.current.position}
          >
            {targetSnapshot.current.actions.map(action => (
              <DragActionBox
                key={action.id}
                action={action}
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
            <DragGhost payload={payload} pendingLabel={pendingLabel} />
          </div>
        </div>
      </div>
    </>
  )
}
