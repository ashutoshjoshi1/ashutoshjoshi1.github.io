import { EDUCATION, EXPERIENCE } from "../../lib/data";
import Lines from "../motion/Lines";
import "./experience.css";

export default function Experience() {
  return (
    <section id="experience" className="experience section" data-ink="light" aria-labelledby="experience-title">
      <header className="experience__head wrap">
        <Lines id="experience-title" className="t-head" lines={["Experience"]} />
        <p className="experience__intro" data-rise>
          Six years from enterprise ETL to GPU serving, with a master’s in data science in the middle.
        </p>
      </header>

      <ol className="experience__roles wrap">
        {EXPERIENCE.map((role) => (
          <li key={role.company} className="role">
            <div className="role__when" data-rise>
              <p className="role__period t-lead">{role.period}</p>
              <p className="role__place t-small">{role.location}</p>
            </div>
            <div className="role__what" data-rise style={{ ["--d" as string]: "80ms" }}>
              <h3 className="role__company t-lead">
                {role.company}
                {role.org && <span className="role__org">, for {role.org}</span>}
              </h3>
              <p className="role__title">{role.role}</p>
              <ul className="role__highlights measure">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="experience__education wrap">
        <h3 className="experience__subhead t-lead">Education</h3>
        <ul className="degrees">
          {EDUCATION.map((degree) => (
            <li key={degree.degree} className="degree" data-rise>
              <p className="degree__name">{degree.degree}</p>
              <p className="degree__school muted">
                {degree.school}
                {degree.period && `, ${degree.period}`}
                {degree.note && `, ${degree.note}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
