import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { usePipeline } from '../context/PipelineContext.jsx'
import { timeAgo, formatJobType } from '../utils/format.js'
import './JobCard.css'

/**
 * JobCard — displays one job listing with a "Save to pipeline" toggle.
 *
 * Props:
 *   - job (object) a single job from the Remotive API
 */
export default function JobCard({ job }) {
  const { user } = useAuth()
  const { isSaved, saveJob, removeJob } = usePipeline()
  const navigate = useNavigate()

  const [logoFailed, setLogoFailed] = useState(false)
  const [busy, setBusy] = useState(false) // true while a save/remove is in flight
  const showLogo = job.company_logo && !logoFailed
  const saved = isSaved(job.id)

  async function handleSaveToggle() {
    // Saving requires an account — send guests to the login page first.
    if (!user) {
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      if (saved) {
        await removeJob(job.id)
      } else {
        await saveJob(job)
      }
    } catch (err) {
      console.error('Could not update pipeline:', err)
      alert('Sorry, that didn’t save. Please try again.')
    } finally {
      setBusy(false)
    }
  }

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

      <div className="job-card__actions">
        <button
          type="button"
          className={`btn job-card__save ${saved ? 'job-card__save--saved' : 'btn-primary'}`}
          onClick={handleSaveToggle}
          disabled={busy}
        >
          {busy ? '…' : saved ? '✓ Saved' : '+ Save'}
        </button>
        <a
          className="btn job-card__view"
          href={job.url}
          target="_blank"
          rel="noreferrer"
        >
          View ↗
        </a>
      </div>
    </article>
  )
}
