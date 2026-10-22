import { PRINCIPLES } from "../../lib/data";
import Lines from "../motion/Lines";
import NeuralLab from "./NeuralLab";
import "./lab.css";

/* The page's one change of ground: the pale field holds the lab and the
   rules the work runs on. */
export default function Lab() {
  return (
    <section id="lab" className="lab section" data-ink="dark" aria-labelledby="lab-title">
      <header className="lab__head wrap">
        <Lines id="lab-title" className="t-head" lines={["Watch a network", "learn"]} />
        <p className="lab__intro" data-rise>
          A two-layer network training in your browser right now, with backpropagation written by hand in about two
          hundred lines of TypeScript. No libraries, no GPU, no server. Click the field to add points and it adapts.
        </p>
      </header>

      <div className="wrap">
        <NeuralLab />
      </div>

      <div id="principles" className="lab__principles wrap">
        <h3 className="lab__subhead t-lead">How I work</h3>
        <ul className="principles">
          {PRINCIPLES.map((principle, i) => (
            <li key={principle.title} className="principle" data-rise style={{ ["--d" as string]: `${(i % 2) * 70}ms` }}>
              <h4 className="principle__title t-lead">{principle.title}</h4>
              <p className="principle__body">{principle.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
