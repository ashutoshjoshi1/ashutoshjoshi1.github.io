import { HERO } from "../../lib/data";
import "./intro.css";

/* The introduction, first chapter of the split: who I am in four short
   paragraphs, beside the server running as it does in production. */
export default function Intro() {
  const [first, ...rest] = HERO.intro;
  return (
    <section id="about" className="chapter intro" data-chapter="intro" aria-labelledby="intro-title">
      <h2 id="intro-title" className="intro__title t-lead" data-rise>
        {first}
      </h2>
      {rest.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="intro__paragraph" data-rise>
          {paragraph}
        </p>
      ))}
    </section>
  );
}
