import PageHeader from '../components/PageHeader.jsx'
import './JobBoard.css'

/**
 * JobBoard — the live job listings page.
 *
 * This is the Phase 2 *layout*: a hero header, a search/filter bar, and a
 * grid of "skeleton" placeholder cards that show the shape of real listings.
 * In Phase 3 we'll replace the skeletons with live data from the Remotive API.
 */
export default function JobBoard() {
  // Render a few placeholder cards so the grid looks populated for now.
  const skeletons = Array.from({ length: 6 })

  return (
    <div className="container">
      <PageHeader
        title="Find your next role"
        subtitle="Browse live remote job listings and save the ones worth chasing to your pipeline."
      />

      {/* Search + filter bar (not wired up yet — that's Phase 3) */}
      <div className="jobboard__controls">
        <input
          type="search"
          className="jobboard__search"
          placeholder="Search by title, company, or keyword…"
          disabled
        />
        <select className="jobboard__filter" disabled defaultValue="">
          <option value="">All categories</option>
          <option>Software Development</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>
      </div>

      {/* Placeholder grid — real job cards arrive in Phase 3 */}
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
    </div>
  )
}
