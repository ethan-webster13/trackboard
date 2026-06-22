/* ===========================================================================
   The Muse API client
   ---------------------------------------------------------------------------
   We talk to The Muse's public jobs API here. Unlike Remotive's free endpoint
   (which returned a fixed 30 jobs and ignored every filter), The Muse supports:
     - real pagination          (?page=N)
     - server-side category      (?category=Software Engineering)
     - server-side level         (?level=Entry Level)
     - server-side remote filter (?location=Flexible / Remote)

   IMPORTANT PATTERN — normalization:
   The Muse's JSON shape (job.name, job.company.name, job.refs.landing_page…)
   is messy and specific to them. We convert each job into a clean, simple
   shape (title, company, url…) via normalizeJob() before it leaves this file.
   The rest of the app only ever sees the normalized shape, so if we ever swap
   APIs again, only THIS file changes.

   API docs: https://www.themuse.com/developers/api/v2
   =========================================================================== */

const BASE_URL = 'https://www.themuse.com/api/public/jobs'

// The remote-jobs location value The Muse recognizes.
export const REMOTE_LOCATION = 'Flexible / Remote'

// Categories verified to return results from the live API. `value` is what the
// API expects; `label` is what we show in the dropdown.
export const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Data and Analytics', label: 'Data & Analytics' },
  { value: 'Design and UX', label: 'Design & UX' },
  { value: 'Product Management', label: 'Product Management' },
  { value: 'Project Management', label: 'Project Management' },
  { value: 'Business Operations', label: 'Business Operations' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'Account Management', label: 'Account Management' },
  { value: 'Human Resources and Recruitment', label: 'Human Resources' },
  { value: 'Writing and Editing', label: 'Writing & Editing' },
  { value: 'Education', label: 'Education' },
  { value: 'Healthcare', label: 'Healthcare' },
]

// Experience levels supported by the API.
export const LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Entry Level', label: 'Entry Level' },
  { value: 'Mid Level', label: 'Mid Level' },
  { value: 'Senior Level', label: 'Senior Level' },
  { value: 'Management', label: 'Management' },
]

/**
 * Convert one raw Muse job into the app's clean, normalized shape.
 * Everything outside this file uses these field names.
 */
export function normalizeJob(job) {
  return {
    id: String(job.id),
    title: job.name ?? 'Untitled role',
    company: job.company?.name ?? 'Unknown company',
    location: job.locations?.[0]?.name ?? 'Location not specified',
    category: job.categories?.[0]?.name ?? '',
    level: job.levels?.[0]?.name ?? '',
    url: job.refs?.landing_page ?? '#',
    publishedAt: job.publication_date ?? '',
    description: job.contents ?? '', // raw HTML from The Muse
  }
}

/**
 * Fetch one page of jobs from The Muse.
 *
 * @param {object} options
 * @param {string} options.category   category value ('' = all)
 * @param {string} options.level      level value ('' = all)
 * @param {boolean} options.remoteOnly only remote jobs
 * @param {number} options.page       1-based page number
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{jobs: Array, page: number, pageCount: number, total: number}>}
 */
export async function fetchJobs({
  category = '',
  level = '',
  remoteOnly = false,
  page = 1,
  signal,
} = {}) {
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  if (level) params.set('level', level)
  if (remoteOnly) params.set('location', REMOTE_LOCATION)

  // Optional: a free Muse API key raises the rate limit. Without one the API
  // still works but throttles bursts of requests (occasional 500s). Set
  // VITE_MUSE_API_KEY in .env.local / Vercel to use one.
  const apiKey = import.meta.env.VITE_MUSE_API_KEY
  if (apiKey) params.set('api_key', apiKey)

  const response = await fetch(`${BASE_URL}?${params.toString()}`, { signal })
  if (!response.ok) {
    throw new Error(`The Muse API error: ${response.status}`)
  }

  const data = await response.json()
  return {
    jobs: (data.results ?? []).map(normalizeJob),
    page: data.page ?? page,
    pageCount: data.page_count ?? 0,
    total: data.total ?? 0,
  }
}
