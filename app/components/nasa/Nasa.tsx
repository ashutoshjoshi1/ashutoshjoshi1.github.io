import { FLEET, NASA_INTRO } from "../../lib/data";
import Lines from "../motion/Lines";
import SkyFigure from "./SkyFigure";
import "./nasa.css";

/* The third chapter of the split: the machine learning and data systems
   behind NASA's Pandora network, read beside the sun the instruments follow. */
export default function Nasa() {
  return (
    <section id="nasa" className="chapter nasa" data-chapter="sky" aria-labelledby="nasa-title">
      <Lines id="nasa-title" className="nasa__title t-head" lines={["Machine learning", "for NASA"]} />
      <p className="nasa__intro t-lead" data-rise>
        {NASA_INTRO}
      </p>

      <SkyFigure placement="inline" />

      <ul className="systems">
        {FLEET.map((system) => (
          <li key={system.title} className="system" data-rise>
            <h3 className="system__title t-lead sans">{system.title}</h3>
            <p className="system__body">{system.statement}</p>
            <p className="system__label t-small soft">{system.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
