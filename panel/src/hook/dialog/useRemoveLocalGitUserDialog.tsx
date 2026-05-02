import { Button } from '@/component/ui/Button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/component/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useSetGitUserConfig } from '@/hook/useGitQueries'
import { faCircleNotch, faTrash, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

export const useRemoveLocalGitUserDialog = () => {
  const { showToast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const setConfigMutation = useSetGitUserConfig()

  const openDialog = () => {
    setIsOpen(true)
  }

  const handleConfirmRemoval = () => {
    setConfigMutation.mutate(
      { isLocal: false },
      {
        onSuccess: () => {
          showToast({
            text: 'Local user override removed. Now using global settings.',
            icon: faUser,
            type: 'success',
          })
          setIsOpen(false)
        },
        onError: (error: any) => {
          showToast({
            text: error.message || 'Failed to remove local user override',
            icon: faUser,
            type: 'error',
          })
        },
      },
    )
  }

  const isLoading = setConfigMutation.isPending

  const DialogComponent = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Local User Override</DialogTitle>
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
                Remove Local User Override
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { openDialog, DialogComponent }
}
