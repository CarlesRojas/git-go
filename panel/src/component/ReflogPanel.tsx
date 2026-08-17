import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/component/ui/ContextMenu'
import { Button } from '@/component/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/Select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/component/ui/Sheet'
import { useCompare } from '@/context/CompareContext'
import { useToast } from '@/context/ToastContext'
import { useBranchDialog } from '@/hook/dialog/useBranchDialog'
import { useCherryPickDialog } from '@/hook/dialog/useCherryPickDialog'
import { useResetBranchDialog } from '@/hook/dialog/useResetBranchDialog'
import { useCurrentBranch, useGitBranches, useOperationInProgress, useReflog } from '@/hook/useGitQueries'
import { useOnMount } from '@/hook/useOnMount'
import { cn } from '@/util/cn'
import { formatRelativeDate } from '@/util/formatRelativeDate'
import {
  faCheckCircle,
  faCircleNotch,
  faCircleQuestion,
  faClockRotateLeft,
  faClone,
  faCodeBranch,
  faCodeCommit,
  faCodeMerge,
  faCopy,
  faDownload,
  faLifeRing,
  faPen,
  faRightLeft,
  faRotateLeft,
  faRotateRight,
  faTimesCircle,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitReflogActionKind, GitReflogEntry } from '@git/gitService'
import { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

/** How each kind of reflog entry is named and drawn, so a glance down the list reads as actions */
const KIND_META: Record<GitReflogActionKind, { label: string; icon: IconDefinition }> = {
  commit: { label: 'Commit', icon: faCodeCommit },
  amend: { label: 'Amend', icon: faPen },
  merge: { label: 'Merge', icon: faCodeMerge },
  rebase: { label: 'Rebase', icon: faCodeBranch },
  'cherry-pick': { label: 'Cherry-pick', icon: faCodeCommit },
  revert: { label: 'Revert', icon: faRotateLeft },
  reset: { label: 'Reset', icon: faRotateRight },
  pull: { label: 'Pull', icon: faDownload },
  checkout: { label: 'Checkout', icon: faRightLeft },
  branch: { label: 'Branch', icon: faCodeBranch },
  clone: { label: 'Clone', icon: faClone },
  other: { label: 'Other', icon: faCircleQuestion },
}

type ReflogAction = 'branch' | 'reset' | 'cherry-pick'

interface PendingAction {
  action: ReflogAction
  hash: string
  /** Bumped per request, so asking for the same action on the same entry again reopens its dialog */
  id: number
}

/**
 * The dialogs a reflog entry's actions open — the same ones a commit row opens, since a reflog entry
 * is a commit like any other. Mounted only for the entry whose action was picked, and opening that
 * action's dialog straight away: replaced (by its key) whenever another action is picked.
 */
const ReflogEntryAction: FC<{ action: ReflogAction; hash: string }> = ({ action, hash }) => {
  const commit = useMemo(() => ({ hash }), [hash])

  const branchDialog = useBranchDialog({ commit, defaultName: `recovered-${hash.substring(0, 7)}` })
  const resetDialog = useResetBranchDialog({ commit })
  const cherryPickDialog = useCherryPickDialog({ commit })

  const openBranch = branchDialog.openDialog
  const openReset = resetDialog.openDialog
  const openCherryPick = cherryPickDialog.openDialog

  useOnMount(
    useCallback(() => {
      if (action === 'branch') openBranch()
      else if (action === 'reset') openReset()
      else openCherryPick()
    }, [action, openBranch, openReset, openCherryPick]),
  )

  return (
    <>
      {branchDialog.DialogComponent}
      {resetDialog.DialogComponent}
      {cherryPickDialog.DialogComponent}
    </>
  )
}

interface ReflogEntryRowProps {
  entry: GitReflogEntry
  /** Why the actions that touch the repository are refused, or null when they are available */
  blockedReason: string | null
  onAction: (action: ReflogAction, hash: string) => void
  onCopyHash: (hash: string) => void
}

const ReflogEntryRow: FC<ReflogEntryRowProps> = ({ entry, blockedReason, onAction, onCopyHash }) => {
  const meta = KIND_META[entry.kind]

  // What the entry says it did, falling back to the subject of the commit it points at for the
  // entries git writes with no message of their own
  const headline = entry.message || entry.subject || entry.description || meta.label

  const menuItem = (label: string, icon: IconDefinition, onSelect: () => void, destructive = false): ReactNode => (
    <ContextMenuItem
      onClick={onSelect}
      disabled={!!blockedReason}
      variant={destructive ? 'destructive' : 'default'}
      title={blockedReason ?? undefined}
    >
      <FontAwesomeIcon icon={icon} className="size-3" />
      {label}
    </ContextMenuItem>
  )

  return (
    // Not modal: the panel holding these rows is not either, so the menu must not take the page's
    // pointer events away from it while it is open
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            // Layout & Structure
            'flex min-w-0 flex-col gap-0.5',
            // Spacing
            'rounded-main px-2 py-1.5',
            // Interactive
            'hover:bg-vsc-editor-fg/5 cursor-default',
          )}
          title={entry.description || entry.subject}
        >
          <div className="flex min-w-0 items-center gap-2">
            <FontAwesomeIcon icon={meta.icon} className="size-3 shrink-0 opacity-50" />

            <span className="truncate text-xs font-semibold">{headline}</span>
          </div>

          <div className="flex min-w-0 items-center gap-2 pl-5 text-[0.7rem]">
            <span className="text-vsc-list-highlight-fg shrink-0 font-semibold">{entry.selector}</span>

            <span className="shrink-0 opacity-50">{meta.label}</span>

            <code className="shrink-0 opacity-50">{entry.hash.substring(0, 7)}</code>

            <time
              className="truncate opacity-50"
              dateTime={entry.date}
              title={entry.date ? new Date(entry.date).toLocaleString() : undefined}
            >
              {formatRelativeDate(entry.date)}
            </time>

            {entry.recoverable && (
              <span
                className={cn(
                  // Layout & Structure
                  'rounded-main ml-auto flex shrink-0 items-center gap-1 px-1',
                  // Colors & Background
                  'border-vsc-error-fg/30 bg-vsc-error-fg/10 text-vsc-error-fg border',
                )}
                title="No branch or tag reaches this commit any more — only the reflog still points at it"
              >
                <FontAwesomeIcon icon={faLifeRing} className="size-2.5" />
                Recoverable
              </span>
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent data-disable-commit-highlight>
        <ContextMenuLabel>{entry.selector}</ContextMenuLabel>

        {menuItem('Create Branch Here', faCodeBranch, () => onAction('branch', entry.hash))}

        {menuItem('Cherry Pick', faCodeCommit, () => onAction('cherry-pick', entry.hash))}

        {menuItem('Reset Current Branch Here', faRotateRight, () => onAction('reset', entry.hash), true)}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => onCopyHash(entry.hash)}>
          <FontAwesomeIcon icon={faCopy} className="size-3" />
          Copy Hash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/**
 * Everywhere a ref has been, read out of its reflog: the way back to a commit no branch or tag
 * points at any more. Opened from the toolbar beside the undo button, which offers the same rescue
 * for the last action alone.
 */
export const ReflogPanel: FC = () => {
  const [open, setOpen] = useState(false)
  const [selectedRef, setSelectedRef] = useState('HEAD')
  const [pending, setPending] = useState<PendingAction | null>(null)
  const actionCount = useRef(0)

  const { showToast } = useToast()
  const [, copy] = useCopyToClipboard()
  const { close: closeComparison } = useCompare()
  const { data: branches = [] } = useGitBranches()
  const { data: currentBranch } = useCurrentBranch()
  const { data: operationInProgress } = useOperationInProgress()

  // Only the reflog being looked at is read, and only while the panel is open
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useReflog(
    selectedRef,
    open,
  )

  const localBranches = useMemo(() => {
    const names = branches.filter(branch => !branch.remote).map(branch => branch.cleanName)
    // The checked out branch first, since it is the one an entry's actions act on
    return [...new Set(names)].sort((a, b) => {
      if (a === currentBranch) return -1
      if (b === currentBranch) return 1
      return a.localeCompare(b)
    })
  }, [branches, currentBranch])

  const entries = useMemo(() => data?.pages.flatMap(page => page.entries) ?? [], [data])

  // Every action either moves a ref or replays a commit, and none of that can happen over a halted
  // merge, rebase or cherry-pick
  const blockedReason = operationInProgress
    ? `A ${operationInProgress} is in progress — finish or abort it first`
    : null

  const requestAction = useCallback((action: ReflogAction, hash: string) => {
    actionCount.current += 1
    setPending({ action, hash, id: actionCount.current })
  }, [])

  const copyHash = useCallback(
    (hash: string) => {
      copy(hash)
      showToast({ text: 'Hash copied to clipboard', icon: faCheckCircle, type: 'info' })
    },
    [copy, showToast],
  )

  // Both panels sit in the same place beside the graph, so opening this one dismisses a comparison
  // rather than landing on top of it
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) closeComparison()
      setOpen(next)
    },
    [closeComparison],
  )

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon" title="Browse the reflog">
            <FontAwesomeIcon icon={faClockRotateLeft} className="size-3" />
            <span className="sr-only">Reflog</span>
          </Button>
        </SheetTrigger>

        {/* The body is the scroller, so the header and the ref selector stay put as the list grows */}
        <SheetContent
          side="right"
          showOverlay={false}
          className="overflow-y-hidden"
          onInteractOutside={event => event.preventDefault()}
        >
          <SheetHeader className="shrink-0 pr-9">
            <SheetTitle className="text-vsc-list-highlight-fg flex items-center gap-2 font-bold">
              <FontAwesomeIcon icon={faClockRotateLeft} className="size-3" />
              Reflog
            </SheetTitle>

            <SheetDescription className="text-xs">
              Every position a ref has held, newest first. Right-click an entry to act on it.
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
            <Select value={selectedRef} onValueChange={value => value && setSelectedRef(value)}>
              <SelectTrigger className="shrink-0">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="HEAD">HEAD</SelectItem>

                {localBranches.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {blockedReason && (
              <p className="text-vsc-error-fg flex items-start gap-1.5 text-xs">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 size-3 shrink-0" />
                {blockedReason}
              </p>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 opacity-80">
                <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                <span className="text-xs">Reading the reflog...</span>
              </div>
            )}

            {isError && (
              <div className="flex items-start gap-2 py-4">
                <FontAwesomeIcon icon={faTimesCircle} className="text-vsc-error-fg mt-0.5 size-3 shrink-0" />
                <span className="text-vsc-error-fg text-xs">
                  {error?.message ?? `Could not read the reflog of ${selectedRef}`}
                </span>
              </div>
            )}

            {!isLoading && !isError && entries.length === 0 && (
              <p className="py-2 text-xs opacity-50">
                {selectedRef === 'HEAD' ? 'HEAD has' : `'${selectedRef}' has`} no reflog entries.
              </p>
            )}

            {entries.length > 0 && (
              <div className="flex flex-col">
                {entries.map(entry => (
                  <ReflogEntryRow
                    key={entry.selector}
                    entry={entry}
                    blockedReason={blockedReason}
                    onAction={requestAction}
                    onCopyHash={copyHash}
                  />
                ))}
              </div>
            )}

            {hasNextPage && (
              <Button
                variant="secondary"
                className="w-fit shrink-0"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
                ) : (
                  'Load More'
                )}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {pending && (
        <ReflogEntryAction
          key={`${pending.action}-${pending.hash}-${pending.id}`}
          action={pending.action}
          hash={pending.hash}
        />
      )}
    </>
  )
}
