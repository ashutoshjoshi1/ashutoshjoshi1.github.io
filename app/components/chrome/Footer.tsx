import { CONTACT, CONTACT_PICTURE } from "../../lib/data";
import { SECTION_LINKS } from "./links";
import WebVitals from "./WebVitals";
import "./footer.css";

/* The close: graduation day on one half, the way back into the page on the other. */
export default function Footer() {
  return (
    <footer className="footer" data-theme="night">
      <figure className="footer__picture">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
        <img
          src={CONTACT_PICTURE.src}
          alt={CONTACT_PICTURE.alt}
          width={1400}
          height={934}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="footer__caption t-small">{CONTACT_PICTURE.caption}</figcaption>
      </figure>

      <div className="footer__side">
        <p className="footer__mark sans">Ashutosh Joshi</p>
        <nav aria-label="Sections, again">
          <ul className="footer__menu">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a className="footer__link t-lead sans" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__blocks t-small">
          <p>
            <a className="link" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            <br />
            {CONTACT.phone}
            <br />
            {CONTACT.location}
          </p>
          <p>
            <a className="link" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <br />
            <a className="link" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <br />
            <a className="link" href={CONTACT.resume} target="_blank" rel="noopener">
              Résumé, PDF
            </a>
          </p>
        </div>

        <div className="footer__small">
          <WebVitals />
          <p className="t-small soft">
            © {new Date().getFullYear()} Ashutosh Joshi. Built by hand: a Next.js static export, a toy LLM server and a
            sun calculator. No trackers.
          </p>
        </div>
      </div>
    </footer>
  );
}
