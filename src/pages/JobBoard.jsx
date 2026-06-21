import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import JobCard from '../components/JobCard.jsx'
import { fetchJobs } from '../api/remotive.js'
import './JobBoard.css'

/**
 * JobBoard — live remote job listings from the Remotive API.
 *
 * Because the free API returns one fixed batch (it ignores category/limit
 * params), we fetch ONCE and then do all filtering in the browser:
 *   - category : derived from the jobs themselves, filtered client-side
 *   - search   : free-text match on title/company, client-side
 *
 * State:
 *   - jobs     : every job returned by the API
 *   - status   : 'loading' | 'error' | 'success' (a simple state machine)
 *   - category : the selected category name ('' = all)
 *   - search   : the text typed in the search box
 */
export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('loading')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  // Fetch jobs once, when the component first mounts (empty dependency array).
  useEffect(() => {
    // AbortController cancels the request if the component unmounts mid-flight.
    const controller = new AbortController()

    async function load() {
      setStatus('loading')
      try {
        const result = await fetchJobs({ signal: controller.signal })
        setJobs(result)
        setStatus('success')
      } catch (err) {
        // A cancelled request throws an AbortError — that's expected, ignore it.
        if (err.name !== 'AbortError') {
          console.error(err)
          setStatus('error')
        }
      }
    }

    load()
    return () => controller.abort()
  }, [])

  // Build the category dropdown options from the data we actually received.
  // Set() removes duplicates; we sort them alphabetically for a tidy list.
  const categories = useMemo(() => {
    const names = jobs.map((job) => job.category).filter(Boolean)
    return [...new Set(names)].sort()
  }, [jobs])

  // Apply category + search filters to produce the jobs we actually render.
  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return jobs.filter((job) => {
      const matchesCategory = !category || job.category === category
      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.company_name?.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [jobs, category, search])

  return (
    <div className="container">
      <PageHeader
        title="Find your next role"
        subtitle="Browse live remote job listings and save the ones worth chasing to your pipeline."
      />

      {/* Search + category filter */}
      <div className="jobboard__controls">
        <input
          type="search"
          className="jobboard__search"
          placeholder="Search by title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="jobboard__filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Render different UI depending on the current status. */}
      {status === 'loading' && <JobBoardSkeletons />}

      {status === 'error' && (
        <div className="jobboard__state">
          <p>⚠️ Couldn’t load jobs right now.</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {status === 'success' && visibleJobs.length === 0 && (
        <div className="jobboard__state">
          <p>No jobs match your filters.</p>
        </div>
      )}

      {status === 'success' && visibleJobs.length > 0 && (
        <>
          <p className="jobboard__count">
            Showing {visibleJobs.length} job
            {visibleJobs.length !== 1 ? 's' : ''}
          </p>
          <div className="jobboard__grid">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** A grid of shimmering placeholder cards shown while jobs load. */
function JobBoardSkeletons() {
  const skeletons = Array.from({ length: 6 })
  return (
    <div className="jobboard__grid">
      {skeletons.map((_, i) => (
        <div key={i} className="job-card job-card--skeleton" aria-hidden="true">
          <div className="skeleton skeleton--logo" />
          <div className="skeleton skeleton--line" style={{ width: '70%' }} />
          <div className="skeleton skeleton--line" style={{ width: '45%' }} />
          <div className="skeleton skeleton--chip" />
        </div>
      ))}
    </div>
  )
}
