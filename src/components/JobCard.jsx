import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { usePipeline } from '../context/PipelineContext.jsx'
import { timeAgo } from '../utils/format.js'
import './JobCard.css'

/**
 * JobCard — displays one normalized job with a "Save to pipeline" toggle and a
 * "Details" button that opens the full description modal.
 *
 * Props:
 *   - job (object)        a normalized job (see api/muse.js)
 *   - onOpenDetail (fn)   called when the user clicks "Details"
 */
export default function JobCard({ job, onOpenDetail }) {
  const { user } = useAuth()
  const { isSaved, saveJob, removeJob } = usePipeline()
  const navigate = useNavigate()

  const [busy, setBusy] = useState(false) // true while a save/remove is in flight
  const saved = isSaved(job.id)

  async function handleSaveToggle() {
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
        {/* The Muse doesn't provide logos, so we always show a letter avatar. */}
        <div className="job-card__logo job-card__logo--fallback">
          {job.company?.charAt(0) ?? '?'}
        </div>

        <div className="job-card__heading">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
        </div>
      </div>

      <ul className="job-card__meta">
        {job.location && <li>📍 {job.location}</li>}
        {job.level && <li>📈 {job.level}</li>}
      </ul>

      <div className="job-card__footer">
        {job.category && <span className="job-card__chip">{job.category}</span>}
        <span className="job-card__date">{timeAgo(job.publishedAt)}</span>
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
        <button
          type="button"
          className="btn job-card__view"
          onClick={() => onOpenDetail(job)}
        >
          Details
        </button>
      </div>
    </article>
  )
}
