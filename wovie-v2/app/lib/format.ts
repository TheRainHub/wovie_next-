// Display helpers shared by cards, banners and the film page.

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m}min`
  return m ? `${h}h ${m}min` : `${h}h`
}

export function formatScore(score: number) {
  return score.toFixed(1)
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatVotes(n: number) {
  return `${formatCount(n)} ${n === 1 ? 'vote' : 'votes'}`
}

export function formatMoney(value: number | null | undefined) {
  if (!value) return null
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${Math.round(value / 1_000_000)}M`
  return `$${value.toLocaleString('en-US')}`
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function yearOf(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : String(date.getUTCFullYear())
}

const DAY = 24 * 60 * 60 * 1000

/** "New" means out already, and for no longer than `days`. */
export function isRecentRelease(value: string | Date | null | undefined, now = new Date(), days = 90) {
  if (!value) return false
  const released = new Date(value).getTime()
  if (Number.isNaN(released)) return false
  return released <= now.getTime() && now.getTime() - released <= days * DAY
}
