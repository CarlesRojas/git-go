import { Button } from '@/component/ui/Button'
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

  const label = undoActionLabel[action.kind]

  useEventListener(
    'keydown',
    useCallback(
      (event: KeyboardEvent) => {
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
      [openDialog],
    ),
  )

  return (
    <>
      <Button
        variant="secondary"
        onClick={openDialog}
        title={`Undo '${action.description}' on ${action.branch} (${undoShortcutLabel})`}
      >
        <FontAwesomeIcon icon={faRotateLeft} className="size-3" />
        Undo {label}
      </Button>

      {DialogComponent}
    </>
  )
}

export const UndoButton: FC = () => {
  const { data: action } = useUndoableAction()

  if (!action) return null

  return <UndoButtonContent key={action.currentHash} action={action} />
}
