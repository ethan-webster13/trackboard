import PageHeader from '../components/PageHeader.jsx'
import { usePipeline } from '../context/PipelineContext.jsx'
import './Pipeline.css'

// The stages a job application moves through. Defined once so the board and the
// data layer stay in sync. The `id` matches the `stage` field stored in
// Firestore (see api/pipeline.js).
const STAGES = [
  { id: 'wishlist', label: 'Wishlist', accent: 'var(--color-text-muted)' },
  { id: 'applied', label: 'Applied', accent: 'var(--color-primary)' },
  { id: 'interview', label: 'Interview', accent: 'var(--color-warning)' },
  { id: 'offer', label: 'Offer', accent: 'var(--color-success)' },
  { id: 'rejected', label: 'Rejected', accent: 'var(--color-danger)' },
]

/**
 * Pipeline — the Kanban board of saved job applications, live from Firestore.
 *
 * Phase 5: jobs appear here the instant they're saved (real-time sync), and you
 * can move them between stages via a dropdown or remove them. Phase 6 adds
 * drag-and-drop on top of this.
 */
export default function Pipeline() {
  const { jobs, loading, moveJob, removeJob } = usePipeline()

  return (
    <div className="container">
      <PageHeader
        title="My Pipeline"
        subtitle="Track every application from wishlist to offer. Save jobs from the board to get started."
      />

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading your pipeline…</p>
      ) : (
        <div className="pipeline__board">
          {STAGES.map((stage) => {
            // Jobs whose stored stage matches this column.
            const stageJobs = jobs.filter((job) => job.stage === stage.id)
            return (
              <section key={stage.id} className="pipeline__column">
                <header className="pipeline__column-head">
                  <span
                    className="pipeline__dot"
                    style={{ backgroundColor: stage.accent }}
                  />
                  <h2 className="pipeline__column-title">{stage.label}</h2>
                  <span className="pipeline__count">{stageJobs.length}</span>
                </header>

                {stageJobs.length === 0 ? (
                  <div className="pipeline__empty">No jobs here yet.</div>
                ) : (
                  stageJobs.map((job) => (
                    <PipelineCard
                      key={job.id}
                      job={job}
                      onMove={(stageId) => moveJob(job.jobId, stageId)}
                      onRemove={() => removeJob(job.jobId)}
                    />
                  ))
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** A single saved-job card inside a pipeline column. */
function PipelineCard({ job, onMove, onRemove }) {
  return (
    <article className="pcard">
      <div className="pcard__head">
        <h3 className="pcard__title">{job.title}</h3>
        <button
          type="button"
          className="pcard__remove"
          title="Remove from pipeline"
          onClick={onRemove}
        >
          ×
        </button>
      </div>
      <p className="pcard__company">{job.company_name}</p>

      <div className="pcard__footer">
        {/* Move between stages via a dropdown (drag-and-drop comes in Phase 6) */}
        <select
          className="pcard__stage"
          value={job.stage}
          onChange={(e) => onMove(e.target.value)}
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <a
          className="pcard__link"
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
