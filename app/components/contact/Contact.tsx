import { CONTACT, CONTACT_PICTURE } from "../../lib/data";
import Icon from "../ui/Icon";
import "./contact.css";

const handle = (url: string) => url.replace(/\/$/, "").split("/").pop() ?? url;

/* "Visit card on a photograph": the satellite's view of where I live, and
   one solid card with every way to reach me. */
export default function Contact() {
  return (
    <section id="contact" className="contact" data-ink="light" aria-labelledby="contact-title">
      <figure className="contact__picture">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
        <img src={CONTACT_PICTURE.src} alt={CONTACT_PICTURE.alt} width={1280} height={940} loading="lazy" decoding="async" />
        <figcaption className="contact__caption t-small">{CONTACT_PICTURE.caption}</figcaption>
      </figure>

      <div className="contact__card" data-rise>
        <h2 id="contact-title" className="contact__title t-lead">
          Work with me
        </h2>
        <p className="contact__lede">
          Open to roles in LLM inference, ML platforms and GPU systems. Based in Baltimore, on US Eastern time.
        </p>
        <dl className="contact__rows">
          <div className="contact__row">
            <dt>Email</dt>
            <dd>
              <a className="link" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </dd>
          </div>
          <div className="contact__row">
            <dt>Phone</dt>
            <dd>
              <a className="link" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                {CONTACT.phone}
              </a>
            </dd>
          </div>
          <div className="contact__row">
            <dt>GitHub</dt>
            <dd>
              <a className="link" href={CONTACT.github} target="_blank" rel="noopener noreferrer">
                {handle(CONTACT.github)}
              </a>
            </dd>
          </div>
          <div className="contact__row">
            <dt>LinkedIn</dt>
            <dd>
              <a className="link" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
                {handle(CONTACT.linkedin)}
              </a>
            </dd>
          </div>
          <div className="contact__row">
            <dt>Résumé</dt>
            <dd>
              <a className="link" href={CONTACT.resume} target="_blank" rel="noopener">
                PDF, one page
              </a>
            </dd>
          </div>
        </dl>
        <a className="button contact__button" href={`mailto:${CONTACT.email}`}>
          Email Ashutosh
          <Icon name="arrow-right" className="button__arrow" />
        </a>
      </div>
    </section>
  );
}
