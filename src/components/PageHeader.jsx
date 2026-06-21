import './PageHeader.css'

/**
 * Reusable page heading: a big title with an optional subtitle and an
 * optional `actions` slot on the right (e.g. a button).
 *
 * Props:
 *   - title    (string)  required heading text
 *   - subtitle (string)  optional supporting line
 *   - actions  (node)    optional right-aligned content
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  )
}
