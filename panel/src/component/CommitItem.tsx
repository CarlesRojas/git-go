import BranchPill from '@/component/BranchPill'
import StashTagPill from '@/component/StashTagPill'
import { TreeView } from '@/component/Tree'
import { Avatar } from '@/component/ui/Avatar'
import { useDragActions } from '@/context/DragContext'
import { useSettings } from '@/context/SettingsContext'
import { useToast } from '@/context/ToastContext'
import { useCommitContextMenu } from '@/hook/contextMenu/useCommitContextMenu'
import { useUncommittedChangesContextMenu } from '@/hook/contextMenu/useUncommittedChangesContextMenu'
import { useCurrentBranch, useGitBranches, useGitCommitFiles, useTagRemotes } from '@/hook/useGitQueries'
import { getColor } from '@/hook/useGitTree'
import { buildFileTree } from '@/util/buildFileTree'
import { cn } from '@/util/cn'
import { CommitLayout } from '@/util/computeGraphLayout'
import { groupBranches } from '@/util/groupBranches'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import type { GitBranch, GitCommit, GitFileChange } from '@git/gitService'
import { FC, memo, PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

interface CommitItemProps {
  commit: GitCommit
  isExpanded: boolean
  /** Keyed by hash so the callback can stay identity-stable and the row memoized */
  onToggle: (hash: string) => void
  selectedBranches: GitBranch[]
  treeWidth: number
  onCommitHover: (hash: string | null, row: number | null) => void
  row: number
  layout: CommitLayout
  uncommitedFiles?: GitFileChange[]
  dimmed?: boolean
}

const CommitItemComponent: FC<CommitItemProps> = ({
  commit,
  isExpanded,
  onToggle: onToggleHash,
  selectedBranches,
  treeWidth,
  onCommitHover,
  row,
  layout,
  uncommitedFiles,
  dimmed,
}) => {
  const onToggle = useCallback(() => onToggleHash(commit.hash), [onToggleHash, commit.hash])
  const { settings } = useSettings()

  const sectionRef = useRef<HTMLElement>(null)
  const [, copy] = useCopyToClipboard()
  const { showToast } = useToast()
  const { data: currentBranch } = useCurrentBranch()
  const { data: branches = [] } = useGitBranches()

  const fileTree = useGitCommitFiles({
    commitHash: commit.hash,
    isRootCommit: commit.parents.length === 0,
    isStash: commit.isStash ?? false,
    enabled: isExpanded && !commit.isUncommitted,
  })

  const groupedBranches = useMemo(
    () =>
      groupBranches(
        selectedBranches.filter(branch => branch.hash === commit.hash),
        false,
      ),
    [selectedBranches, commit.hash],
  )

  const { data: tagRemotes = [] } = useTagRemotes(settings.showTags)

  // Tags that exist on a remote at this commit but have no local counterpart here
  const remoteOnlyTags = useMemo(() => {
    const names = new Set<string>()
    for (const { tags } of tagRemotes) {
      for (const tag of tags) {
        if (tag.hash === commit.hash && !commit.tags.includes(tag.name)) names.add(tag.name)
      }
    }
    return [...names]
  }, [tagRemotes, commit.hash, commit.tags])

  const copyText = (text: string, label: string) => {
    copy(text)
    showToast({ text: `${label} copied to clipboard`, icon: faCheckCircle, type: 'info' })
  }

  useEffect(() => {
    if (isExpanded && sectionRef.current) {
      const timeoutId = setTimeout(() => {
        const element = sectionRef.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight

        // 'nearest' scrolls just enough: navigating up shows the commit at the top of the
        // viewport, navigating down aligns the expanded panel's bottom with the viewport bottom
        if (!isInView) element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isExpanded])

  const isFromThisYear = new Date(commit.date).getFullYear() === new Date().getFullYear()

  const fullMessage = commit.body ? `${commit.message}\n\n${commit.body}` : commit.message
  const hasDifferentCommitter =
    !!commit.committer && (commit.committer !== commit.author || commit.committerEmail !== commit.email)

  const { commitContextMenuWrapper, dialogs: commitDialogs } = useCommitContextMenu({ commit })
  const { uncommittedChangesContextMenuWrapper, dialogs: uncommittedDialogs } = useUncommittedChangesContextMenu()

  const { beginPress } = useDragActions()

  const handleCommitPointerDown = (event: ReactPointerEvent) => {
    // The uncommitted row has no hash, and a stash is not a cherry-pick source.
    if (!settings.dragAndDropEnabled || commit.isUncommitted || commit.isStash) return

    beginPress({ kind: 'commit', commit, colorIndex: layout.colorIndex }, event)
  }

  const hasPills =
    !commit.isUncommitted &&
    (Object.keys(groupedBranches).length > 0 ||
      commit.isStash ||
      ((commit.tags.length > 0 || remoteOnlyTags.length > 0) && settings.showTags))

  const pills = (
    <div
      data-drag-clip
      className={cn(
        // Layout & sizing
        'flex w-fit min-w-fit gap-2 overflow-hidden',
        // Alignment
        'items-center justify-between text-left',
      )}
    >
      {Object.entries(groupedBranches)
        .sort(([, a], [, b]) => {
          const aIsCurrent = a.local && (a.local.current || currentBranch === a.local.cleanName)
          const bIsCurrent = b.local && (b.local.current || currentBranch === b.local.cleanName)

          if (aIsCurrent && !bIsCurrent) return -1
          if (!aIsCurrent && bIsCurrent) return 1

          return 0
        })
        .map(([baseName, { local, remotes }]) => {
          const name = local?.cleanName ?? remotes?.[0]?.cleanName ?? baseName
          const localBranch = branches.find(branch => branch.cleanName === name && !branch.remote)
          return (
            <BranchPill
              key={baseName}
              branch={{ local, remotes }}
              baseName={baseName}
              layout={layout}
              hasLocalBranch={!!localBranch}
              localBranchOnDifferentCommit={!!localBranch && localBranch.hash !== commit.hash}
            />
          )
        })}

      {commit.isStash && <StashTagPill type="stash" label={commit.refs || 'stash'} commit={commit} />}

      {commit.tags.length > 0 &&
        commit.tags.map(tag => <StashTagPill key={tag} type="tag" label={tag} commit={commit} />)}

      {remoteOnlyTags.map(tag => (
        <StashTagPill key={`remote-${tag}`} type="tag" label={tag} commit={commit} remoteOnly />
      ))}
    </div>
  )

  const message = (
    <div
      data-drag-dimmable
      onPointerDown={handleCommitPointerDown}
      className={cn(
        // Layout & sizing
        'relative flex h-full grow overflow-hidden',
        // Alignment
        'items-center text-left',
        hasPills && 'pl-2',
      )}
      onClick={onToggle}
    >
      <h3
        className={cn(
          // Typography
          'line-clamp-1 truncate text-xs leading-tight font-semibold',
          // State
          layout?.isMerge && !layout?.isHead && 'opacity-50',
          layout?.isHead && 'font-bold',
        )}
        style={{
          color: layout?.isHead
            ? getColor({
                index: layout.colorIndex,
                theme: settings.theme,
                isDark: settings.isDark,
                customColors: settings.customColors,
                isStash: commit.isStash,
              })
            : undefined,
        }}
      >
        {commit.message}
      </h3>
    </div>
  )

  const timeAndAuthor = (
    <div
      data-drag-dimmable
      className={cn(
        // Layout & sizing
        'flex w-fit min-w-fit gap-2 overflow-hidden pl-2',
        // Alignment
        'items-center justify-between text-left',
      )}
      onClick={onToggle}
    >
      <time
        className={cn(
          // Layout & sizing
          'min-w-fit',
          // Typography
          'line-clamp-1 truncate text-xs leading-tight font-medium',
          // Appearance
          'opacity-50',
          commit.isUncommitted && 'opacity-0',
        )}
        dateTime={commit.date.split('T')[0]}
      >
        {new Date(commit.date).toLocaleDateString('en-CA', {
          year: isFromThisYear ? undefined : 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </time>

      <time
        className={cn(
          // Layout & sizing
          'min-w-fit',
          // Typography
          'line-clamp-1 truncate text-xs leading-tight font-medium',
          // Appearance
          'opacity-50',
          commit.isUncommitted && 'opacity-0',
        )}
        dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}
      >
        {new Date(commit.date).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}
      </time>

      <Avatar
        email={commit.email}
        author={commit.author}
        commitHash={commit.isUncommitted ? undefined : commit.hash}
        size={20}
        className={cn(!settings.showAuthorName && 'mr-2', commit.isUncommitted && 'opacity-0')}
      />

      {settings.showAuthorName && (
        <span
          className={cn(
            // Layout & sizing
            'w-20 max-w-20 min-w-20',
            // Typography
            'line-clamp-1 truncate text-xs leading-tight font-medium',
            // Appearance
            'opacity-50',
            commit.isUncommitted && 'opacity-0',
          )}
        >
          {commit.author}
        </span>
      )}
    </div>
  )

  return (
    <>
      <section
        ref={sectionRef}
        className={cn('flex scroll-mb-8 flex-col transition-opacity duration-500', dimmed && 'opacity-10')}
        data-commit-row={row}
      >
        {uncommittedChangesContextMenuWrapper(
          <div
            data-drag-row
            className={cn(
              'relative flex h-6 max-h-6 min-h-6 w-full max-w-full',
              // Interactive
              isExpanded && !layout.isHead && 'bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/15',
              'hover:bg-vsc-editor-fg/10 cursor-pointer',
            )}
            style={{ paddingLeft: `${treeWidth + 8}px` }}
            onMouseEnter={() => onCommitHover(commit.hash, row)}
            onMouseLeave={() => onCommitHover(null, null)}
          >
            {commitContextMenuWrapper(
              <div className="absolute inset-y-0 left-0" style={{ width: `${treeWidth + 8}px` }} onClick={onToggle} />,
              !commit.isUncommitted,
            )}

            <div
              data-drag-clip
              className={cn('relative flex h-full w-full overflow-hidden mask-r-from-[calc(100%-1rem)] mask-r-to-100%')}
            >
              {!!hasPills && pills}

              {commitContextMenuWrapper(message, !commit.isUncommitted)}
            </div>

            {commitContextMenuWrapper(timeAndAuthor, !commit.isUncommitted)}

            {layout.isHead && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 -z-20 opacity-10"
                  style={{
                    backgroundColor: getColor({
                      index: layout.colorIndex,
                      theme: settings.theme,
                      isDark: settings.isDark,
                      customColors: settings.customColors,
                    }),
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 -z-10 border-y opacity-15"
                  style={{
                    borderColor: getColor({
                      index: layout.colorIndex,
                      theme: settings.theme,
                      isDark: settings.isDark,
                      customColors: settings.customColors,
                    }),
                  }}
                />
              </>
            )}

            {isExpanded && !layout.isHead && (
              <div className="border-vsc-editor-fg/10 pointer-events-none absolute inset-0 -z-10 border-y" />
            )}
          </div>,
          commit.isUncommitted,
        )}

        {isExpanded && (
          <div
            className={cn(
              // Layout
              'relative w-full max-w-full overflow-x-hidden overflow-y-auto',
              // Colors
              'bg-vsc-editor-fg/3 border-vsc-editor-fg/10 border-b',
            )}
            style={{
              height: `${settings.expandedCommitHeight}px`,
              minHeight: `${settings.expandedCommitHeight}px`,
              maxHeight: `${settings.expandedCommitHeight}px`,
              paddingLeft: `${treeWidth + 8}px`,
            }}
          >
            <div className={cn('relative flex h-fit w-full flex-col gap-1 py-3 pr-2', commit.isUncommitted && 'py-0')}>
              {!commit.isUncommitted && (
                <div className="relative flex h-fit w-full items-center gap-3">
                  <Avatar
                    email={commit.email}
                    author={commit.author}
                    commitHash={commit.hash}
                    size={64}
                    className="place-self-start"
                  />

                  <div className="relative flex h-fit w-full flex-col">
                    <p className="text-xs font-medium">
                      <span className="opacity-50">Hash: </span>
                      <code
                        className={cn('cursor-pointer px-1 transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.hash, 'Hash')}
                      >
                        {commit.hash}
                      </code>
                    </p>

                    <p className="text-xs font-medium">
                      <span className="opacity-50">Author: </span>
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.author, 'Author')}
                      >
                        {commit.author}
                      </span>{' '}
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(commit.email, 'Email')}
                      >
                        ({commit.email})
                      </span>
                    </p>

                    {hasDifferentCommitter && (
                      <p className="text-xs font-medium">
                        <span className="opacity-50">Committer: </span>
                        <span
                          className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                          onClick={() => copyText(commit.committer ?? '', 'Committer')}
                        >
                          {commit.committer}
                        </span>{' '}
                        <span
                          className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                          onClick={() => copyText(commit.committerEmail ?? '', 'Email')}
                        >
                          ({commit.committerEmail})
                        </span>
                      </p>
                    )}

                    <p className="text-xs font-medium">
                      <span className="opacity-50">Date: </span>
                      <time dateTime={commit.date.split('T')[0]}>
                        {new Date(commit.date).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>{' '}
                      <time dateTime={commit.date.split('T')[1]?.split('+')[0] || commit.date}>
                        {new Date(commit.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </time>
                    </p>

                    <p className="text-xs font-medium">
                      <span className="opacity-50">Message: </span>
                      <span
                        className={cn('cursor-pointer transition-opacity hover:opacity-75')}
                        onClick={() => copyText(fullMessage, 'Message')}
                      >
                        {commit.message}
                      </span>
                    </p>

                    {commit.body && (
                      <div
                        className={cn(
                          // Layout & sizing
                          'my-1 max-h-24 w-fit max-w-full min-w-64 overflow-y-auto px-2 py-1.5',
                          // Appearance — the theme's editor background darkened, so the box reads
                          // as recessed on light and dark themes alike, with a border only just
                          // distinguishable from it
                          'rounded-main border-vsc-editor-fg/10 border',
                          'bg-[color-mix(in_srgb,var(--vscode-editor-background)_85%,black)]',
                          // Typography
                          'text-xs font-medium whitespace-pre-wrap',
                          // Interactive
                          'cursor-pointer transition-opacity hover:opacity-75',
                        )}
                        onClick={() => copyText(fullMessage, 'Message')}
                      >
                        {commit.body}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {fileTree.data && <TreeView data={fileTree.data} expandAll />}

              {uncommitedFiles && <TreeView data={buildFileTree(uncommitedFiles, 'working-changes')} expandAll />}
            </div>
          </div>
        )}
      </section>

      {commitDialogs}
      {uncommittedDialogs.stashDialog.DialogComponent}
      {uncommittedDialogs.resetDialog.DialogComponent}
    </>
  )
}

/** Memoized: with virtualization every scroll renders the parent, and rows are expensive to mount */
export const CommitItem = memo(CommitItemComponent)
