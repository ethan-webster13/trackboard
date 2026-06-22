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
 * Convert an HTML string (like a job description from an external API) into
 * readable plain text, preserving paragraph/list breaks.
 *
 * Why not just render the HTML directly? Injecting third-party HTML into the
 * page (e.g. via dangerouslySetInnerHTML) is an XSS risk — a malicious or buggy
 * source could include <script> or event handlers. Converting to text is a
 * simple, dependency-free way to stay safe. We use the browser's own parser
 * (DOMParser) so we don't hand-roll fragile regexes.
 *
 * @param {string} html
 * @returns {string[]} an array of text paragraphs (empty lines removed)
 */
export function htmlToParagraphs(html) {
  if (!html) return []
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Put a newline after block elements so paragraphs/list items don't run
  // together once we read textContent.
  doc.body.querySelectorAll('p, br, li, div, h1, h2, h3, h4, ul, ol').forEach(
    (el) => el.append('\n')
  )

  return doc.body.textContent
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
