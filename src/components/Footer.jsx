import './Footer.css'

/**
 * Site footer shown on every page. Static for now — a place to show the
 * project name and a couple of links.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">📋 TrackBoard</span>
        <span className="footer__note">
          Built with React, Vite &amp; Firebase
        </span>
      </div>
    </footer>
  )
}
