import { Button } from '@/component/ui/Button'
import { useSettings } from '@/context/SettingsContext'
import { undoActionLabel, useUndoDialog } from '@/hook/dialog/useUndoDialog'
import { useUndoableAction } from '@/hook/useGitQueries'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitUndoableAction } from '@git/gitService'
import { FC, useCallback } from 'react'
import { useEventListener } from 'usehooks-ts'

const undoShortcutLabel = navigator.userAgent.includes('Mac') ? '⌘Z' : 'Ctrl+Z'

interface UndoButtonContentProps {
  action: GitUndoableAction
}

const UndoButtonContent: FC<UndoButtonContentProps> = ({ action }) => {
  const { openDialog, DialogComponent } = useUndoDialog({ action })
  const { settings } = useSettings()

  const label = undoActionLabel[action.kind]

  useEventListener(
    'keydown',
    useCallback(
      (event: KeyboardEvent) => {
        if (!settings.undoKeyboardShortcut) return
        if (event.key.toLowerCase() !== 'z') return
        if (!event.metaKey && !event.ctrlKey) return
        if (event.altKey || event.shiftKey) return

        const target = event.target as HTMLElement | null
        if (!target) return
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.closest(
            '[role="dialog"], [role="menu"], [role="menuitem"], [role="listbox"], [role="combobox"], [role="grid"]',
          )
        )
          return

        event.preventDefault()
        openDialog()
      },
      [openDialog, settings.undoKeyboardShortcut],
    ),
  )

  return (
    <>
      <Button
        variant="secondary"
        onClick={openDialog}
        title={
          settings.undoKeyboardShortcut
            ? `Undo '${action.description}' on ${action.branch} (${undoShortcutLabel})`
            : `Undo '${action.description}' on ${action.branch}`
        }
      >
        <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
        Undo {label}
      </Button>

      {DialogComponent}
    </>
  )
}

export const UndoButton: FC = () => {
  const { settings } = useSettings()
  const { data: action } = useUndoableAction(settings.undoEnabled)

  if (!action) return null
  if (!settings.undoEnabled) return null
  if (!settings.undoShow[action.kind]) return null

  return <UndoButtonContent key={action.currentHash} action={action} />
}
