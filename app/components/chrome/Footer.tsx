import { CONTACT } from "../../lib/data";
import FitName from "./FitName";
import WebVitals from "./WebVitals";
import "./footer.css";

/* The close: the name at the full width of the page, then the small print. */
export default function Footer() {
  return (
    <footer className="footer" data-ink="light">
      <div className="footer__top wrap">
        <p className="footer__line t-lead">
          Built by hand: a Next.js static export, a canvas engine for the pixels, a toy LLM server, no trackers.
        </p>
        <nav className="footer__links" aria-label="Elsewhere">
          <a className="link" href={`mailto:${CONTACT.email}`}>
            Email
          </a>
          <a className="link" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a className="link" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="link" href={CONTACT.resume} target="_blank" rel="noopener">
            Résumé
          </a>
        </nav>
      </div>

      <div className="footer__name wrap" data-rise>
        <FitName text="Ashutosh Joshi" className="footer__fit" />
      </div>

      <div className="footer__small wrap">
        <WebVitals />
        <p className="t-small muted">© {new Date().getFullYear()} Ashutosh Joshi</p>
      </div>
    </footer>
  );
}
