import { useState } from 'react'
import { timeAgo, formatJobType } from '../utils/format.js'
import './JobCard.css'

/**
 * JobCard — displays one job listing.
 *
 * Props:
 *   - job (object) a single job from the Remotive API
 *
 * In Phase 5 we'll add a "Save to pipeline" button here that writes to
 * Firestore. For now it links out to the original posting.
 */
export default function JobCard({ job }) {
  // Some companies have no logo (or a broken URL). Track that so we can fall
  // back to a letter avatar instead of showing a broken image icon.
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = job.company_logo && !logoFailed

  return (
    <article className="job-card">
      <div className="job-card__top">
        {showLogo ? (
          <img
            className="job-card__logo"
            src={job.company_logo}
            alt={`${job.company_name} logo`}
            loading="lazy"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className="job-card__logo job-card__logo--fallback">
            {job.company_name?.charAt(0) ?? '?'}
          </div>
        )}

        <div className="job-card__heading">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company_name}</p>
        </div>
      </div>

      <ul className="job-card__meta">
        {job.candidate_required_location && (
          <li>📍 {job.candidate_required_location}</li>
        )}
        {job.job_type && <li>🕒 {formatJobType(job.job_type)}</li>}
        {job.salary && <li>💰 {job.salary}</li>}
      </ul>

      <div className="job-card__footer">
        <span className="job-card__chip">{job.category}</span>
        <span className="job-card__date">{timeAgo(job.publication_date)}</span>
      </div>

      <a
        className="btn btn-primary job-card__apply"
        href={job.url}
        target="_blank"
        rel="noreferrer"
      >
        View on Remotive ↗
      </a>
    </article>
  )
}
