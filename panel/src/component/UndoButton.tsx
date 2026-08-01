import { Button } from '@/component/ui/Button'
import { undoActionLabel, useUndoDialog } from '@/hook/dialog/useUndoDialog'
import { useUndoableAction } from '@/hook/useGitQueries'
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GitUndoableAction } from '@git/gitService'
import { FC } from 'react'

interface UndoButtonContentProps {
  action: GitUndoableAction
}

const UndoButtonContent: FC<UndoButtonContentProps> = ({ action }) => {
  const { openDialog, DialogComponent } = useUndoDialog({ action })

  const label = undoActionLabel[action.kind]

  return (
    <>
      <Button
        variant="secondary"
        onClick={openDialog}
        title={`Undo '${action.description}' on ${action.branch}${action.when ? ` — ${action.when}` : ''}`}
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
