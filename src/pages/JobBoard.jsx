import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import JobCard from '../components/JobCard.jsx'
import JobDetailModal from '../components/JobDetailModal.jsx'
import { fetchJobs, CATEGORIES, LEVELS } from '../api/muse.js'
import './JobBoard.css'

/**
 * JobBoard — live job listings from The Muse API.
 *
 * The Muse supports real server-side filtering and pagination, so:
 *   - category / level / remoteOnly  → re-fetch from page 1 (server filters)
 *   - "Load more"                    → fetch the next page and APPEND
 *   - search box                     → filters the already-loaded jobs locally
 */
export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [status, setStatus] = useState('loading') // 'loading'|'error'|'success'
  const [loadingMore, setLoadingMore] = useState(false)

  // Filters (drive new server requests)
  const [category, setCategory] = useState('')
  const [level, setLevel] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)

  // Pagination + local search
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  // The job shown in the detail modal (null = closed)
  const [selectedJob, setSelectedJob] = useState(null)

  // Fetch the FIRST page whenever a filter changes. Replaces the list.
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setStatus('loading')
      try {
        const result = await fetchJobs({
          category,
          level,
          remoteOnly,
          page: 1,
          signal: controller.signal,
        })
        setJobs(result.jobs)
        setPage(1)
        setPageCount(result.pageCount)
        setTotal(result.total)
        setStatus('success')
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err)
          setStatus('error')
        }
      }
    }
    load()
    return () => controller.abort()
  }, [category, level, remoteOnly])

  // Fetch the NEXT page and append it to the existing list.
  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const next = page + 1
      const result = await fetchJobs({ category, level, remoteOnly, page: next })
      // Avoid duplicates if the API ever returns overlap.
      setJobs((prev) => {
        const seen = new Set(prev.map((j) => j.id))
        return [...prev, ...result.jobs.filter((j) => !seen.has(j.id))]
      })
      setPage(next)
    } catch (err) {
      console.error('Could not load more jobs:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [page, category, level, remoteOnly])

  // Client-side text search across the jobs already loaded.
  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return jobs
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query)
    )
  }, [jobs, search])

  const hasMore = page < pageCount

  return (
    <div className="container">
      <PageHeader
        title="Find your next role"
        subtitle="Thousands of live listings from The Muse. Filter, search, and save the ones worth chasing."
      />

      {/* Filter + search controls */}
      <div className="jobboard__controls">
        <input
          type="search"
          className="jobboard__search"
          placeholder="Search loaded jobs by title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="jobboard__filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="jobboard__filter"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Experience level"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <label className="jobboard__toggle">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          Remote only
        </label>
      </div>

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
            Showing {visibleJobs.length} of {total.toLocaleString()} matching jobs
          </p>
          <div className="jobboard__grid">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} onOpenDetail={setSelectedJob} />
            ))}
          </div>

          {/* Load more — only when there are more pages and we're not searching
              (search filters locally, so paging would be confusing then). */}
          {hasMore && !search && (
            <div className="jobboard__loadmore">
              <button
                className="btn btn-primary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more jobs'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail modal (renders only when a job is selected) */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
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
