import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { usePipeline } from '../context/PipelineContext.jsx'
import { timeAgo, htmlToParagraphs } from '../utils/format.js'
import './JobDetailModal.css'

/**
 * JobDetailModal — a popup showing a job's full description and details.
 *
 * Props:
 *   - job (object)  the normalized job to show (null = closed)
 *   - onClose (fn)  called to dismiss the modal
 *
 * Accessibility/UX touches: closes on Escape, closes when you click the dark
 * overlay, and locks background scroll while open.
 */
export default function JobDetailModal({ job, onClose }) {
  const { user } = useAuth()
  const { isSaved, saveJob, removeJob } = usePipeline()
  const navigate = useNavigate()

  // Close on Escape, and prevent the page behind from scrolling while open.
  // IMPORTANT: only do this when a job is actually open. This component is
  // always mounted (with job=null when closed), and hooks run before the early
  // return below — so without this guard we'd lock page scroll permanently.
  useEffect(() => {
    if (!job) return

    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [job, onClose])

  if (!job) return null

  const saved = isSaved(job.id)
  // Convert the API's HTML description to safe plain-text paragraphs.
  const paragraphs = htmlToParagraphs(job.description)

  async function handleSaveToggle() {
    if (!user) {
      navigate('/login')
      return
    }
    if (saved) await removeJob(job.id)
    else await saveJob(job)
  }

  return (
    // Clicking the overlay (but not the dialog) closes the modal.
    <div className="modal__overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={job.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className="modal__header">
          <h2 className="modal__title">{job.title}</h2>
          <p className="modal__company">{job.company}</p>
          <ul className="modal__meta">
            {job.location && <li>📍 {job.location}</li>}
            {job.level && <li>📈 {job.level}</li>}
            {job.category && <li>🏷️ {job.category}</li>}
            {job.publishedAt && <li>🕒 {timeAgo(job.publishedAt)}</li>}
          </ul>
        </header>

        <div className="modal__body">
          {paragraphs.length > 0 ? (
            paragraphs.map((text, i) => <p key={i}>{text}</p>)
          ) : (
            <p className="modal__empty">No description provided.</p>
          )}
        </div>

        <footer className="modal__footer">
          <button
            type="button"
            className={`btn ${saved ? 'job-card__save--saved' : 'btn-primary'}`}
            onClick={handleSaveToggle}
          >
            {saved ? '✓ Saved' : '+ Save to pipeline'}
          </button>
          <a className="btn" href={job.url} target="_blank" rel="noreferrer">
            Apply on The Muse ↗
          </a>
        </footer>
      </div>
    </div>
  )
}
