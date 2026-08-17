/** Largest first, so the coarsest unit that still counts at least one is the one used */
const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/**
 * How long ago a moment was, in the coarsest unit that still counts: '3 days ago', 'last month'.
 * Anything under a minute — and anything the caller could not date at all — reads as 'just now'.
 */
export const formatRelativeDate = (isoDate: string): string => {
  const time = new Date(isoDate).getTime()
  if (!Number.isFinite(time)) return 'just now'

  const elapsed = (Date.now() - time) / 1000
  const magnitude = Math.abs(elapsed)

  for (const { unit, seconds } of UNITS) {
    if (magnitude >= seconds) return relativeTimeFormat.format(-Math.round(elapsed / seconds), unit)
  }

  return 'just now'
}
