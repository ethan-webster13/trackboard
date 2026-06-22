import { useCallback, useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import JobCard from '../components/JobCard.jsx'
import JobDetailModal from '../components/JobDetailModal.jsx'
import { fetchJobs, CATEGORIES, LEVELS } from '../api/muse.js'
import { isWithinLastMonth } from '../utils/format.js'
import './JobBoard.css'

// The Muse returns jobs in relevance order (not by date) and only ~1 in 4 are
// recent, so we fetch several API pages per "load" to gather a useful number of
// fresh jobs, then filter + sort on the client.
const PAGES_PER_LOAD = 3

/**
 * JobBoard — live job listings from The Muse API.
 *
 * Rules enforced here:
 *   - only jobs posted in the LAST MONTH are ever shown (client-side filter)
 *   - results are sorted NEWEST FIRST
 *   - category / level / remote filters run server-side
 *   - search filters the already-loaded jobs locally
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
  const [nextPage, setNextPage] = useState(1) // next API page to request
  const [pageCount, setPageCount] = useState(0)
  const [search, setSearch] = useState('')

  const [selectedJob, setSelectedJob] = useState(null)

  // Fetch PAGES_PER_LOAD pages starting at `startPage`, keep only jobs from the
  // last month. Resilient: if one page request fails (Muse rate-limits bursts),
  // we keep the pages that succeeded instead of failing the whole batch.
  const fetchBatch = useCallback(
    async (startPage, signal) => {
      const pageNums = Array.from(
        { length: PAGES_PER_LOAD },
        (_, i) => startPage + i
      )
      const settled = await Promise.allSettled(
        pageNums.map((p) =>
          fetchJobs({ category, level, remoteOnly, page: p, signal })
        )
      )

      let maxPageCount = 0
      const batch = []
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          maxPageCount = Math.max(maxPageCount, r.value.pageCount)
          batch.push(...r.value.jobs)
        }
      }
      const recent = batch.filter((j) => isWithinLastMonth(j.publishedAt))
      return { recent, pageCount: maxPageCount }
    },
    [category, level, remoteOnly]
  )

  // Reload the first batch whenever a filter changes.
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setStatus('loading')
      try {
        const { recent, pageCount: pc } = await fetchBatch(1, controller.signal)
        setJobs(recent)
        setNextPage(1 + PAGES_PER_LOAD)
        setPageCount(pc)
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
  }, [fetchBatch])

  // Fetch the next batch of pages and append the recent ones.
  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const { recent } = await fetchBatch(nextPage)
      setJobs((prev) => {
        const seen = new Set(prev.map((j) => j.id))
        return [...prev, ...recent.filter((j) => !seen.has(j.id))]
      })
      setNextPage((p) => p + PAGES_PER_LOAD)
    } catch (err) {
      console.error('Could not load more jobs:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [fetchBatch, nextPage])

  // Search filter + newest-first sort applied to the loaded jobs.
  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query)
        )
      : jobs
    return [...filtered].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    )
  }, [jobs, search])

  const hasMore = nextPage <= pageCount

  return (
    <div className="container">
      <PageHeader
        title="Find your next role"
        subtitle="Fresh listings from The Muse — posted in the last month, newest first. Filter, search, and save the ones worth chasing."
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
          <p>No jobs posted in the last month match your filters.</p>
          {hasMore && (
            <button className="btn" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}

      {status === 'success' && visibleJobs.length > 0 && (
        <>
          <p className="jobboard__count">
            Showing {visibleJobs.length} job
            {visibleJobs.length !== 1 ? 's' : ''} posted in the last month
          </p>
          <div className="jobboard__grid">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} onOpenDetail={setSelectedJob} />
            ))}
          </div>

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
