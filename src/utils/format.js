/* Small, reusable formatting helpers. Pure functions (same input → same
   output, no side effects), which makes them easy to reason about and test. */

/**
 * Turn an ISO date string into a friendly relative label like "3 days ago".
 */
export function timeAgo(isoDate) {
  if (!isoDate) return ''
  const then = new Date(isoDate).getTime()
  const seconds = Math.floor((Date.now() - then) / 1000)

  const units = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'week', secs: 604800 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ]

  for (const { label, secs } of units) {
    const value = Math.floor(seconds / secs)
    if (value >= 1) {
      return `${value} ${label}${value > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

/**
 * Convert the API's job_type ("full_time", "contract") into a nice label.
 */
export function formatJobType(jobType) {
  if (!jobType) return ''
  return jobType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
