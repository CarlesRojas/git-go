import { DragActionBox } from '@/component/DragActionBox'
import { DragGhost } from '@/component/DragGhost'
import { PendingDrop, useDragActions, useDragState } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useBranchDeleteDialog } from '@/hook/dialog/useBranchDeleteDialog'
import { useBranchMergeIntoCurrentDialog } from '@/hook/dialog/useBranchMergeDialog'
import { useBranchPushDialog } from '@/hook/dialog/useBranchPushDialog'
import { useRebaseCurrentBranchIntoBranch } from '@/hook/dialog/useBranchRebaseDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useTagDeleteDialog } from '@/hook/dialog/useTagDeleteDialog'
import { useTagPushDialog } from '@/hook/dialog/useTagPushDialog'
import { useCheckoutLocalBranch, useCurrentBranch, useGitBranches, useGitRemotes } from '@/hook/useGitQueries'
import { DragAction, resolveSourceActions, resolveTargetActions } from '@/util/dragAndDrop'
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons'
import { GitBranch, GitCommit } from '@git/gitService'
import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

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

/**
 * Renders everything that only exists during a drag — the ghost, the fixed rail of
 * source actions, and the stack revealed on the hovered target — and executes the drop.
 */
export const DragOverlay: FC = () => {
  const { payload, hoveredTargetKey, hoveredActionId, revealed, pendingDrop } = useDragState()
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
    return resolveSourceActions({ payload, config: settings, remoteNames: remotes.map(remote => remote.name) })
  }, [payload, settings, remotes])

  const defaultTargetAction = useMemo(
    () => targetActions.find(action => action.isDefault && !action.disabledReason) ?? null,
    [targetActions],
  )

  // Layout effect so the default lands in the same frame as the hover that produced it —
  // a plain effect can miss a hover-and-release inside one frame.
  useLayoutEffect(() => {
    setDefaultAction(defaultTargetAction?.id ?? null)
  }, [defaultTargetAction, setDefaultAction])

  // Anchor the revealed stack to the pill it acts on. Recomputed when the target changes and
  // whenever the graph scrolls under it.
  useLayoutEffect(() => {
    if (!revealed || !hoveredTargetKey) {
      setStackRect(null)
      return
    }

    const measure = () => {
      const element = document.querySelector<HTMLElement>(`[data-drop-target="${CSS.escape(hoveredTargetKey)}"]`)
      setStackRect(element?.getBoundingClientRect() ?? null)
    }

    measure()

    const container = document.querySelector<HTMLElement>('[data-drag-scroll-container]')
    container?.addEventListener('scroll', measure)
    return () => container?.removeEventListener('scroll', measure)
  }, [revealed, hoveredTargetKey])

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

  const cancelAction = useMemo(() => sourceActions.find(action => action.id === 'cancel') ?? null, [sourceActions])
  const railActions = useMemo(() => sourceActions.filter(action => action.id !== 'cancel'), [sourceActions])

  /**
   * Opens below the pill, flipping above it and sliding left as needed so the stack is never
   * pushed off screen in a narrow panel. The gap to the pill is padding on the wrapper rather
   * than empty space, so the pill and its boxes stay a single hit region — crossing the gap
   * must not collapse the stack.
   */
  const stackPosition = useMemo(() => {
    if (!stackRect || targetActions.length === 0) return null

    const height = targetActions.length * BOX_HEIGHT_ESTIMATE_PX
    const fitsBelow = stackRect.bottom + STACK_GAP_PX + height <= window.innerHeight - VIEWPORT_MARGIN_PX

    const left = Math.max(
      VIEWPORT_MARGIN_PX,
      Math.min(stackRect.left, window.innerWidth - BOX_WIDTH_PX - VIEWPORT_MARGIN_PX),
    )

    if (fitsBelow) return { top: stackRect.bottom, left, paddingTop: STACK_GAP_PX }

    return {
      top: Math.max(VIEWPORT_MARGIN_PX, stackRect.top - height - STACK_GAP_PX),
      left,
      paddingBottom: STACK_GAP_PX,
    }
  }, [stackRect, targetActions])

  const pendingLabel = useMemo(() => {
    if (!payload) return null

    const hovered: DragAction | undefined =
      [...targetActions, ...sourceActions].find(action => action.id === hoveredActionId) ??
      (hoveredActionId === null ? (defaultTargetAction ?? undefined) : undefined)

    if (!hovered) return null
    if (hovered.id === 'cancel') return 'Cancel — nothing changes'
    if (hovered.disabledReason) return hovered.disabledReason

    // Naming the ref that moves is what keeps merge and rebase apart mid-gesture.
    return hovered.note ? `${hovered.verb} ${hovered.effect} · ${hovered.note}` : `${hovered.verb} ${hovered.effect}`
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
        <div ref={ghostRef} className="absolute top-0 left-0 will-change-transform">
          <DragGhost
            payload={payload}
            pendingLabel={pendingLabel}
            showHoldHint={!revealed && targetActions.length > 1 && !!hoveredTargetKey}
          />
        </div>

        {/* Cancel is the only box present in every drag, so it — not the stack — is what stays
            pinned to the viewport centre. Everything else stacks above it. */}
        {cancelAction && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="absolute right-0 bottom-full mb-3 flex flex-col items-end gap-1.5">
              {railActions.map(action => (
                <DragActionBox key={action.id} action={action} hovered={hoveredActionId === action.id} />
              ))}
            </div>

            <DragActionBox action={cancelAction} hovered={hoveredActionId === 'cancel'} />
          </div>
        )}

        {revealed && stackPosition && hoveredTargetKey && targetActions.length > 0 && (
          <div
            // Carries the target key so the padded bridge back to the pill counts as the same
            // target, keeping the stack open while the pointer travels to a box.
            data-drop-target={hoveredTargetKey}
            className="pointer-events-auto absolute flex flex-col gap-1.5"
            style={stackPosition}
          >
            {targetActions.map(action => (
              <DragActionBox key={action.id} action={action} hovered={hoveredActionId === action.id} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
