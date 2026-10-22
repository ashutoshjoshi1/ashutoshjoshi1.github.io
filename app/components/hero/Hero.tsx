import { CONTACT, HERO } from "../../lib/data";
import Lines from "../motion/Lines";
import Icon from "../ui/Icon";
import PortraitFigure from "./PortraitFigure";
import "./hero.css";

/* The first chapter of the split: the name and what I do, the one action,
   then a short introduction. The portrait holds on the stage beside it. */
export default function Hero() {
  const [first, ...rest] = HERO.intro;
  return (
    <section id="top" className="chapter hero" data-chapter="portrait" aria-labelledby="hero-title">
      <PortraitFigure placement="inline" />

      <div className="hero__sheet">
        <Lines as="h1" id="hero-title" className="hero__name t-display" lines={HERO.name} delay={150} />
        <p className="hero__role t-lead sans" data-rise style={{ "--d": "380ms" } as React.CSSProperties}>
          {HERO.role}
        </p>
        <p className="hero__lede t-lead" data-rise style={{ "--d": "460ms" } as React.CSSProperties}>
          {HERO.lede}
        </p>
        <div className="hero__actions" data-rise style={{ "--d": "560ms" } as React.CSSProperties}>
          <a className="button" href={`mailto:${CONTACT.email}`}>
            Email Ashutosh
            <Icon name="arrow-right" className="button__arrow" />
          </a>
          <a className="link sans" href={CONTACT.resume} target="_blank" rel="noopener">
            Résumé, PDF
          </a>
        </div>
      </div>

      <div className="hero__intro">
        <p className="hero__intro-first" data-rise>
          {first}
        </p>
        {rest.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} data-rise>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
