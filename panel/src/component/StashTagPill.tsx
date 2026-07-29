import { useSettings } from '@/context/SettingsContext'
import { useStashContextMenu } from '@/hook/contextMenu/useStashContextMenu'
import { useTagContextMenu } from '@/hook/contextMenu/useTagContextMenu'
import { useTagRemotes } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faInbox, faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitCommit } from '@git/gitService'
import { FC, ReactNode } from 'react'

interface StashTagPillProps {
  type: 'stash' | 'tag'
  label: string
  commit: GitCommit
}

export function formatStash(ref: string): string {
  const match = ref.match(/^stash@\{(\d+)\}$/)
  return match ? `Stash ${match[1]}` : ref
}

const StashTagPill: FC<StashTagPillProps> = ({ type, label, commit }) => {
  const { settings } = useSettings()

  // Move hooks before any early returns to comply with React rules
  const { stashContextMenuWrapper, dialogs: stashDialogs } = useStashContextMenu({
    stash: type === 'stash' ? label : undefined,
  })

  const { tagContextMenuWrapper, dialogs: tagDialogs } = useTagContextMenu({
    tagName: type === 'tag' ? label : undefined,
    commit,
  })

  const { data: tagRemotes } = useTagRemotes(type === 'tag' && settings.showTags)

  // Early returns after hooks
  if (type === 'stash' && !settings.showStashes) return null
  if (type === 'tag' && !settings.showTags) return null

  const remotesWithTag =
    type === 'tag' && tagRemotes
      ? tagRemotes.filter(({ tags }) => tags.includes(label)).map(({ remote }) => remote)
      : []

  const icon = type === 'stash' ? faInbox : faTag
  const iconColor = type === 'stash' ? 'text-vsc-editor-fg/80' : 'text-amber-500'

  const ContextMenuToUse: FC<{ children: ReactNode }> = ({ children }) => {
    if (type === 'tag') return tagContextMenuWrapper(children)
    return stashContextMenuWrapper(children)
  }

  return (
    <>
      <ContextMenuToUse>
        <div
          className={cn(
            // Layout & sizing
            'rounded-main h-5 max-h-5 min-h-5 min-w-fit',
            // Colors
            'bg-vsc-editor-bg',
          )}
        >
          <div
            className={cn(
              // Layout & sizing
              'flex h-5 max-h-5 min-h-5 min-w-fit items-center overflow-hidden',
              // Spacing
              'rounded-main',
              // Colors
              'border-vsc-editor-fg/20 bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20 text-vsc-editor-fg border',
            )}
          >
            <div className="flex h-full min-w-fit items-center gap-1.5 px-1">
              <FontAwesomeIcon icon={icon} className={cn('size-3 max-w-3', iconColor)} />

              <span className="line-clamp-1 text-xs leading-tight font-medium text-nowrap">
                {type === 'stash' ? formatStash(label) : label}
              </span>
            </div>

            {remotesWithTag.map(remote => (
              <div
                key={remote}
                className="border-vsc-editor-fg/20 flex h-full w-fit min-w-fit items-center border-l px-1.5"
              >
                <span className="line-clamp-1 text-xs leading-tight font-normal text-nowrap opacity-50">{remote}</span>
              </div>
            ))}
          </div>
        </div>
      </ContextMenuToUse>

      {stashDialogs.stashDropDialog.DialogComponent}
      {tagDialogs.detailsDialog.DialogComponent}
      {tagDialogs.pushDialog.DialogComponent}
      {tagDialogs.deleteDialog.DialogComponent}
    </>
  )
}

export default StashTagPill
