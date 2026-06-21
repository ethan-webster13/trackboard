import { useState } from 'react'
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
 * Pipeline — the Kanban board of saved jobs, live from Firestore.
 *
 * Phase 6 adds native HTML5 drag-and-drop: grab a card and drop it on another
 * column to change its stage. The dropdown on each card stays as an accessible
 * fallback (native drag-and-drop is mouse-only, so it doesn't work on touch).
 *
 * How native drag-and-drop works (the three events that matter):
 *   1. dragstart  — fires on the card you pick up; we remember which job it is.
 *   2. dragover   — fires on a drop target; we MUST call preventDefault() or the
 *                   browser won't allow a drop. We also highlight the column.
 *   3. drop       — fires when you release; we move the job to that column.
 */
export default function Pipeline() {
  const { jobs, loading, moveJob, removeJob } = usePipeline()

  // Which job is currently being dragged, and which column is hovered.
  const [draggedJobId, setDraggedJobId] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  function handleDrop(stageId) {
    const job = jobs.find((j) => j.jobId === draggedJobId)
    // Only write to Firestore if the stage actually changed.
    if (job && job.stage !== stageId) {
      moveJob(draggedJobId, stageId)
    }
    setDraggedJobId(null)
    setDragOverStage(null)
  }

  return (
    <div className="container">
      <PageHeader
        title="My Pipeline"
        subtitle="Drag a card between columns to update its stage. Save jobs from the board to get started."
      />

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading your pipeline…</p>
      ) : (
        <div className="pipeline__board">
          {STAGES.map((stage) => {
            const stageJobs = jobs.filter((job) => job.stage === stage.id)
            const isDragOver = dragOverStage === stage.id
            return (
              <section
                key={stage.id}
                className={`pipeline__column ${isDragOver ? 'pipeline__column--dragover' : ''}`}
                // Allow this column to receive a drop.
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragOverStage !== stage.id) setDragOverStage(stage.id)
                }}
                // Clear the highlight only when truly leaving the column, not
                // when moving between its child cards.
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverStage((s) => (s === stage.id ? null : s))
                  }
                }}
                onDrop={() => handleDrop(stage.id)}
              >
                <header className="pipeline__column-head">
                  <span
                    className="pipeline__dot"
                    style={{ backgroundColor: stage.accent }}
                  />
                  <h2 className="pipeline__column-title">{stage.label}</h2>
                  <span className="pipeline__count">{stageJobs.length}</span>
                </header>

                {stageJobs.length === 0 ? (
                  <div className="pipeline__empty">Drop jobs here.</div>
                ) : (
                  stageJobs.map((job) => (
                    <PipelineCard
                      key={job.id}
                      job={job}
                      isDragging={draggedJobId === job.jobId}
                      onDragStart={() => setDraggedJobId(job.jobId)}
                      onDragEnd={() => {
                        setDraggedJobId(null)
                        setDragOverStage(null)
                      }}
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
function PipelineCard({ job, isDragging, onDragStart, onDragEnd, onMove, onRemove }) {
  return (
    <article
      className={`pcard ${isDragging ? 'pcard--dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        // Some browsers require data to be set for the drag to begin.
        e.dataTransfer.setData('text/plain', job.jobId)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
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
        {/* Accessible fallback for changing stage without dragging. */}
        <select
          className="pcard__stage"
          value={job.stage}
          onChange={(e) => onMove(e.target.value)}
          aria-label="Change stage"
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
