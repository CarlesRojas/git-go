import { useSettings } from '@/context/SettingsContext'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { DragPayload, shortHash } from '@/util/dragAndDrop'
import { faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

interface Props {
  payload: DragPayload
  /** What a release would do right now, or null when the pointer is over nothing actionable. */
  pendingLabel: string | null
  /** Shown when the current target has more actions available behind a hold. */
  showHoldHint: boolean
}

/**
 * The item under the cursor while dragging. The real pill never moves — in this graph a pill's
 * position encodes which commit its ref points at, so moving it would claim the ref already moved.
 */
export const DragGhost: FC<Props> = ({ payload, pendingLabel, showHoldHint }) => {
  const { settings } = useSettings()

  const color = (index: number) =>
    getColor({ index, theme: settings.theme, isDark: settings.isDark, customColors: settings.customColors })

  return (
    <div className="rounded-main bg-vsc-editor-bg border-vsc-editor-fg/30 w-fit max-w-64 overflow-hidden border shadow-lg">
      {payload.kind === 'branch' && (
        <div className="flex h-5 items-center">
          <div className="flex h-full items-center px-1" style={{ backgroundColor: color(payload.colorIndex) }}>
            {getBranchIcons({
              isLocal: true,
              hasRemote: false,
              inWorktree: !!payload.branch.worktreePath,
              black: true,
              white: false,
            })}
          </div>

          <span className="bg-vsc-editor-fg/10 flex h-full items-center truncate px-1.5 text-xs leading-tight font-medium">
            {payload.branch.cleanName}
          </span>
        </div>
      )}

      {payload.kind === 'tag' && (
        <div className="bg-vsc-editor-fg/10 flex h-5 items-center gap-1.5 px-1.5">
          <FontAwesomeIcon icon={faTag} className="size-3 shrink-0 text-amber-500" />

          <span className="truncate text-xs leading-tight font-medium">{payload.name}</span>
        </div>
      )}

      {payload.kind === 'commit' && (
        <div className="bg-vsc-editor-fg/10 flex h-5 items-center gap-1.5 px-1.5">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color(payload.colorIndex) }} />

          <span className="shrink-0 text-xs leading-tight font-bold">{shortHash(payload.commit.hash)}</span>

          <span className="truncate text-xs leading-tight font-medium opacity-70">{payload.commit.message}</span>
        </div>
      )}

      {(pendingLabel || showHoldHint) && (
        <div className={cn('border-vsc-editor-fg/20 flex flex-col border-t px-1.5 py-1')}>
          {pendingLabel && (
            <span className="truncate text-[11px] leading-tight font-medium opacity-80">{pendingLabel}</span>
          )}

          {showHoldHint && (
            <span className="truncate text-[10px] leading-tight font-medium opacity-50">hold for more actions</span>
          )}
        </div>
      )}
    </div>
  )
}
