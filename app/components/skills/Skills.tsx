import { SKILLS } from "../../lib/data";
import Lines from "../motion/Lines";
import "./skills.css";

/* The toolbox, set as large running text rather than a wall of tags. */
export default function Skills() {
  return (
    <section id="skills" className="skills section" data-ink="light" aria-labelledby="skills-title">
      <header className="skills__head wrap">
        <Lines id="skills-title" className="t-head" lines={["The toolbox"]} />
      </header>
      <dl className="skills__groups wrap">
        {SKILLS.map((group) => (
          <div key={group.label} className="skill-group" data-rise>
            <dt className="skill-group__label t-small">{group.label}</dt>
            <dd className="skill-group__items t-lead">{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
