import { Button } from '@/component/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useFetchFromGit } from '@/hook/useGitQueries'
import { cn } from '@/util/cn'
import { faCircleNotch, faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'

export const RefetchButton: FC = () => {
  const { showToast } = useToast()
  const fetchFromGit = useFetchFromGit({
    onSuccess: () => showToast({ text: 'Successfully fetched from remotes', type: 'success', icon: faDownload }),
    onError: error => showToast({ text: `Failed to fetch: ${error.message}`, type: 'error', icon: faDownload }),
  })

  return (
    <Button variant="secondary" onClick={() => fetchFromGit.mutate()} disabled={fetchFromGit.isPending} title="Fetch">
      <FontAwesomeIcon
        icon={fetchFromGit.isPending ? faCircleNotch : faDownload}
        className={cn('size-3', fetchFromGit.isPending && 'animate-spin')}
      />
      Fetch
    </Button>
  )
}
