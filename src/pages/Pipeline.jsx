import PageHeader from '../components/PageHeader.jsx'
import './Pipeline.css'

// The stages a job application moves through. We define them in one place so
// the board and (later) the data layer stay in sync.
const STAGES = [
  { id: 'wishlist', label: 'Wishlist', accent: 'var(--color-text-muted)' },
  { id: 'applied', label: 'Applied', accent: 'var(--color-primary)' },
  { id: 'interview', label: 'Interview', accent: 'var(--color-warning)' },
  { id: 'offer', label: 'Offer', accent: 'var(--color-success)' },
  { id: 'rejected', label: 'Rejected', accent: 'var(--color-danger)' },
]

/**
 * Pipeline — the Kanban board of saved job applications.
 *
 * Phase 2 lays out the five columns with empty states. In Phases 5 & 6 we'll
 * load saved jobs from Firestore and make the cards draggable between columns.
 */
export default function Pipeline() {
  return (
    <div className="container">
      <PageHeader
        title="My Pipeline"
        subtitle="Track every application from wishlist to offer. Save jobs from the board to get started."
      />

      <div className="pipeline__board">
        {STAGES.map((stage) => (
          <section key={stage.id} className="pipeline__column">
            <header className="pipeline__column-head">
              <span
                className="pipeline__dot"
                style={{ backgroundColor: stage.accent }}
              />
              <h2 className="pipeline__column-title">{stage.label}</h2>
              <span className="pipeline__count">0</span>
            </header>

            <div className="pipeline__empty">
              No jobs here yet.
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
