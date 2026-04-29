import { formatStash } from '@/component/StashTagPill'
import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useDropStash } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

interface UseStashDropDialogProps {
  stash: string
}

export const useStashDropDialog = ({ stash }: UseStashDropDialogProps) => {
  const { showToast } = useToast()
  const [showDropDialog, setShowDropDialog] = useState(false)
  const dropStashMutation = useDropStash()

  const handleDrop = () => {
    dropStashMutation.mutate(
      { stashSelector: stash },
      {
        onSuccess: () => {
          showToast({
            text: `Stash '${formatStash(stash)}' dropped successfully`,
            icon: faTrash,
            type: 'success',
          })
        },
        onError: error => {
          showToast({ text: error.message, type: 'error', icon: faTrash })
        },
        onSettled: () => {
          setShowDropDialog(false)
        },
      },
    )
  }

  const openDialog = () => {
    setShowDropDialog(true)
  }

  const DialogComponent = (
    <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
      <DialogContent data-disable-commit-highlight>
        <DialogHeader>
          <DialogTitle>
            Drop <strong>{formatStash(stash)}</strong>
          </DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setShowDropDialog(false)}>
            Cancel
          </Button>

          <Button type="button" variant="destructive" onClick={handleDrop} disabled={dropStashMutation.isPending}>
            {dropStashMutation.isPending ? (
              <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="size-3" />
                Drop Stash
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return {
    openDialog,
    DialogComponent,
  }
}
