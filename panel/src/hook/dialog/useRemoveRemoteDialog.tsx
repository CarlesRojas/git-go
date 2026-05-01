import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useRemoveGitRemote } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

export const useRemoveRemoteDialog = () => {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [remoteToRemove, setRemoteToRemove] = useState<string | null>(null)
  const removeRemoteMutation = useRemoveGitRemote()

  const openDialog = (remoteName: string) => {
    setRemoteToRemove(remoteName)
    setIsOpen(true)
  }

  const handleConfirmRemoval = () => {
    if (!remoteToRemove) return

    removeRemoteMutation.mutate(remoteToRemove, {
      onSuccess: () => {
        showToast({
          text: `Remote "${remoteToRemove}" removed successfully`,
          icon: faTrash,
          type: 'success',
        })
        setIsOpen(false)
        setRemoteToRemove(null)
      },
      onError: (error: any) => {
        showToast({
          text: error.message || 'Failed to remove remote',
          icon: faTrash,
          type: 'error',
        })
      },
    })
  }

  const isLoading = removeRemoteMutation.isPending

  const DialogComponent = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Remove Remote <strong>{remoteToRemove}</strong>
          </DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={handleConfirmRemoval} disabled={isLoading}>
            {isLoading ? (
              <FontAwesomeIcon icon={faCircleNotch} className="size-3 animate-spin" />
            ) : (
              <>
                <FontAwesomeIcon icon={faTrash} className="size-3" />
                Remove Remote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
