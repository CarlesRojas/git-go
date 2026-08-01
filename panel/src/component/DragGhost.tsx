import { useSettings } from '@/context/SettingsContext'
import { getColor } from '@/hook/useGitTree'
import { getBranchIcons } from '@/util/branchIcons'
import { cn } from '@/util/cn'
import { DragAction, DragPayload, shortHash } from '@/util/dragAndDrop'
import { faTag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

interface Props {
  payload: DragPayload
  /** What a release would do right now, or null when the pointer is over nothing actionable. */
  pendingAction: DragAction | null
}

/**
 * The item under the cursor while dragging. The real pill never moves — in this graph a pill's
 * position encodes which commit its ref points at, so moving it would claim the ref already moved.
 */
export const DragGhost: FC<Props> = ({ payload, pendingAction }) => {
  const { settings } = useSettings()

  const color = (index: number) =>
    getColor({ index, theme: settings.theme, isDark: settings.isDark, customColors: settings.customColors })

  return (
    // The shadow takes the panel's own background colour, so the ghost reads as lifted off the
    // graph in both light and dark themes rather than casting a black halo over a light panel.
    // Zero offset on both axes keeps it even on every side instead of pooling downwards.
    <div className="rounded-main-outer border-vsc-editor-fg/15 bg-vsc-editor-bg/80 text-vsc-editor-fg w-fit overflow-hidden border shadow-[0_0_10px_5px_var(--color-vsc-editor-bg)] backdrop-blur-md">
      {/*
        The identity row fills whatever width the label below forces, so its background never
        stops short. Truncation is capped on the text itself rather than the row, which would
        otherwise stop the background at the same point.
      */}
      {payload.kind === 'branch' && (
        <div className="flex h-5 items-center">
          {/* A remote branch shows the cloud and no colour block, matching its pill in the graph. */}
          {payload.branch.remote ? (
            <div className="bg-vsc-editor-fg/10 flex h-full shrink-0 items-center pr-0.5 pl-1.5">
              {getBranchIcons({ isLocal: false, hasRemote: true, black: false, white: true })}
            </div>
          ) : (
            <div
              className="flex h-full shrink-0 items-center px-1"
              style={{ backgroundColor: color(payload.colorIndex) }}
            >
              {getBranchIcons({
                isLocal: true,
                hasRemote: false,
                inWorktree: !!payload.branch.worktreePath,
                black: true,
                white: false,
              })}
            </div>
          )}

          <span className="bg-vsc-editor-fg/10 flex h-full grow items-center px-1.5 text-xs leading-tight font-medium">
            <span className="max-w-64 truncate">{payload.branch.cleanName}</span>
          </span>
        </div>
      )}

      {payload.kind === 'tag' && (
        <div className="bg-vsc-editor-fg/10 flex h-5 items-center gap-1.5 px-1.5">
          <FontAwesomeIcon icon={faTag} className="size-3 shrink-0 text-amber-500" />

          <span className="max-w-64 truncate text-xs leading-tight font-medium">{payload.name}</span>
        </div>
      )}

      {payload.kind === 'commit' && (
        <div className="bg-vsc-editor-fg/10 flex h-5 items-center gap-1.5 px-1.5">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color(payload.colorIndex) }} />

          <span className="shrink-0 text-xs leading-tight font-bold">{shortHash(payload.commit.hash)}</span>

          <span className="max-w-64 truncate text-xs leading-tight font-medium opacity-70">
            {payload.commit.message}
          </span>
        </div>
      )}

      {pendingAction && (
        <div className={cn('border-vsc-editor-fg/15 flex flex-col border-t px-1.5 py-1')}>
          <span className="text-[11px] leading-tight font-medium whitespace-nowrap opacity-80">
            {pendingAction.disabledReason ??
              pendingAction.description.map((part, index) =>
                typeof part === 'string' ? <span key={index}>{part}</span> : <strong key={index}>{part.ref}</strong>,
              )}
          </span>
        </div>
      )}
    </div>
  )
}
