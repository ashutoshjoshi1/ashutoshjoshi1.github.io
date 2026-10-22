import { CONTACT, EDUCATION, EXPERIENCE } from "../../lib/data";
import Lines from "../motion/Lines";
import "./experience.css";

/* The résumé as one printed sheet on the night ground: each line says what
   changed, and the number it changed by stands at the right. */
export default function Experience() {
  return (
    <section id="experience" className="experience section" data-theme="night" aria-labelledby="experience-title">
      <div className="experience__grid wrap grid-12">
        <header className="experience__head">
          <Lines id="experience-title" className="t-head" lines={["Experience"]} />
          <p className="experience__intro" data-rise>
            Six years from enterprise ETL to GPU serving, with a master’s in data science in the middle.
          </p>
          <a className="link sans t-small" href={CONTACT.resume} target="_blank" rel="noopener" data-rise>
            The one-page résumé, PDF
          </a>
        </header>

        <div className="sheet" data-reveal>
          {EXPERIENCE.map((role) => (
            <div key={role.company} className="sheet__group">
              <div className="sheet__group-head">
                <h3 className="sheet__company t-lead">
                  {role.company}
                  {role.org && <span className="sheet__org">, for {role.org}</span>}
                </h3>
                <p className="sheet__when t-small figures">{role.period}</p>
              </div>
              <p className="sheet__role t-small">
                {role.role} · {role.location}
              </p>
              <ul className="sheet__items">
                {role.highlights.map((highlight) => (
                  <li key={highlight.text} className="sheet__item" data-rise>
                    <span className="sheet__text">{highlight.text}</span>
                    {highlight.figure && <span className="sheet__figure t-lead figures">{highlight.figure}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sheet__group">
            <div className="sheet__group-head">
              <h3 className="sheet__company t-lead">Education</h3>
            </div>
            <ul className="sheet__items">
              {EDUCATION.map((degree) => (
                <li key={degree.degree} className="sheet__item" data-rise>
                  <span className="sheet__text">
                    {degree.degree}, {degree.school}
                    {degree.period && `, ${degree.period}`}
                  </span>
                  {degree.note && <span className="sheet__figure t-lead figures">{degree.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
