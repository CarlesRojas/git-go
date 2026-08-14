import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutationState } from '@tanstack/react-query'
import { FC, useEffect } from 'react'
import { toast } from 'sonner'

const LOADING_TOAST_ID = 'git-go-loading-toast'
const SHOW_DELAY = 150

export const GitActionLoadingToast: FC = () => {
  const pendingLabels = useMutationState({
    filters: { status: 'pending' },
    select: mutation => mutation.options.meta?.gitActionLabel as string | undefined,
  }).filter((label): label is string => !!label)

  const activeLabel = pendingLabels[pendingLabels.length - 1]

  useEffect(() => {
    if (!activeLabel) {
      toast.dismiss(LOADING_TOAST_ID)
      return
    }

    const timeout = setTimeout(() => {
      toast(
        <div className="rounded-main-outer relative flex w-full gap-3 px-3">
          <div className="flex h-fit min-h-10 w-fit items-center justify-center">
            <FontAwesomeIcon
              icon={faCircleNotch}
              className="text-vsc-editor-fg/80 m-0! size-4 max-h-4 min-h-4 animate-spin p-0!"
            />
          </div>

          <span className="py-3 text-xs leading-tight opacity-80">{activeLabel}</span>
        </div>,
        { duration: Infinity, id: LOADING_TOAST_ID },
      )
    }, SHOW_DELAY)

    return () => clearTimeout(timeout)
  }, [activeLabel])

  useEffect(() => {
    return () => {
      toast.dismiss(LOADING_TOAST_ID)
    }
  }, [])

  return null
}
