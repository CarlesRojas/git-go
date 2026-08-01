import { Button } from '@/component/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useAbortOperation, useOperationInProgress } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faBan, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

const operationLabel = {
  merge: 'Merge',
  rebase: 'Rebase',
  'cherry-pick': 'Cherry-pick',
} as const

export const AbortOperationButton: FC = () => {
  const { showToast } = useToast()
  const { data: operation } = useOperationInProgress()
  const abortOperation = useAbortOperation()

  if (!operation) return null

  const label = operationLabel[operation]

  const handleClick = () => {
    abortOperation.mutate(
      { operation },
      {
        onSuccess: () => showToast({ text: `Successfully aborted the ${operation}`, type: 'success', icon: faBan }),
        onError: error =>
          showToast({ text: `Failed to abort the ${operation}: ${error.message}`, type: 'error', icon: faBan }),
      },
    )
  }

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      disabled={abortOperation.isPending}
      title={`Abort the ${operation} in progress`}
    >
      <FontAwesomeIcon
        icon={abortOperation.isPending ? faCircleNotch : faBan}
        className={cn('size-3', abortOperation.isPending && 'animate-spin')}
      />
      Abort {label}
    </Button>
  )
}
