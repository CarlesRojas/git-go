import { cn } from '@/util/cn'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutationState } from '@tanstack/react-query'
import { FC, useEffect, useState } from 'react'

export const GitActionIndicator: FC = () => {
  const pendingLabels = useMutationState({
    filters: { status: 'pending' },
    select: mutation => mutation.options.meta?.gitActionLabel as string | undefined,
  }).filter((label): label is string => !!label)

  const activeLabel = pendingLabels[pendingLabels.length - 1]
  const [visibleLabel, setVisibleLabel] = useState('')

  useEffect(() => {
    if (activeLabel) setVisibleLabel(activeLabel)
  }, [activeLabel])

  return (
    <div
      className={cn(
        'pointer-events-none flex min-w-0 items-center gap-1.5 transition-opacity duration-200',
        activeLabel ? 'opacity-50 delay-150' : 'opacity-0',
      )}
    >
      <FontAwesomeIcon icon={faCircleNotch} className="size-3 shrink-0 animate-spin" />

      <p className="truncate text-xs">{visibleLabel}</p>
    </div>
  )
}
