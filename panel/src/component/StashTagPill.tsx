import { useSettings } from '@/context/SettingsContext'
import { useStashContextMenu } from '@/hook/contextMenu/useStashContextMenu'
import { useTagContextMenu } from '@/hook/contextMenu/useTagContextMenu'
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

  if (type === 'stash' && !settings.showStashes) return null
  if (type === 'tag' && !settings.showTags) return null

  const icon = type === 'stash' ? faInbox : faTag
  const iconColor = type === 'stash' ? 'text-vsc-editor-fg/80' : 'text-amber-500'

  const { ContextMenuWrapper: StashContextMenuWrapper, dialogs: stashDialogs } = useStashContextMenu({
    stash: type === 'stash' ? label : undefined,
  })

  const { ContextMenuWrapper: TagContextMenuWrapper, dialogs: tagDialogs } = useTagContextMenu({
    tagName: type === 'tag' ? label : undefined,
    commit,
  })

  const ContextMenuToUse: FC<{ children: ReactNode }> = ({ children }) => {
    if (type === 'tag') return <TagContextMenuWrapper>{children}</TagContextMenuWrapper>
    return <StashContextMenuWrapper>{children}</StashContextMenuWrapper>
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
              'flex h-5 max-h-5 min-h-5 min-w-fit items-center',
              // Spacing
              'rounded-main gap-1.5 px-1',
              // Colors
              'border-vsc-editor-fg/20 bg-vsc-editor-fg/10 hover:bg-vsc-editor-fg/20 text-vsc-editor-fg border',
            )}
          >
            <FontAwesomeIcon icon={icon} className={cn('size-3', iconColor)} />
            <span className="line-clamp-1 text-xs leading-tight font-medium text-nowrap">
              {type === 'stash' ? formatStash(label) : label}
            </span>
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
