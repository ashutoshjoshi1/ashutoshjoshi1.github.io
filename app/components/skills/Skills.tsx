import { SKILLS, SKILLS_LEAD } from "../../lib/data";
import Lines from "../motion/Lines";
import "./skills.css";

/* The toolkit: one lead line, then each group as a paragraph that opens
   with its name, in four columns. */
export default function Skills() {
  return (
    <section id="skills" className="skills section" aria-labelledby="skills-title">
      <div className="wrap">
        <Lines id="skills-title" className="skills__title t-head" lines={["Toolkit"]} />
        <p className="skills__lead t-lead" data-rise>
          {SKILLS_LEAD}
        </p>
        <div className="skills__columns">
          {SKILLS.map((group, i) => (
            <p key={group.label} className="skills__group" data-rise style={{ ["--d" as string]: `${(i % 4) * 70}ms` }}>
              <span className="skills__label sans">{group.label}.</span> {group.items.join(", ")}.
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
