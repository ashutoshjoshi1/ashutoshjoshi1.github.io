import { Fragment } from "react";
import { HERO, PRINCIPLES, PROFILE, type Principle } from "../../lib/data";
import Lines from "../motion/Lines";
import "./letter.css";

/* a principle's body, with the highlighter over its marked phrase */
function Body({ principle }: { principle: Principle }) {
  const { body, mark } = principle;
  const at = mark ? body.indexOf(mark) : -1;
  if (!mark || at < 0) return <>{body}</>;
  return (
    <Fragment>
      {body.slice(0, at)}
      <mark className="marker" data-reveal>
        {mark}
      </mark>
      {body.slice(at + mark.length)}
    </Fragment>
  );
}

/* How I work, as a short letter: each paragraph opens with its rule. */
export default function Letter() {
  return (
    <section id="how-i-work" className="letter section" aria-labelledby="letter-title">
      <div className="letter__grid wrap grid-12">
        <div className="letter__head">
          <Lines id="letter-title" className="t-head" lines={["How I work"]} />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img
            className="letter__portrait"
            src={HERO.photo}
            alt=""
            width={1024}
            height={1536}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="letter__body">
          {PRINCIPLES.map((principle) => (
            <p key={principle.title} className="letter__paragraph" data-rise>
              <span className="letter__rule">{principle.title}</span> <Body principle={principle} />
            </p>
          ))}
          <p className="letter__sign" data-rise>
            <span className="letter__name t-lead">Ashutosh</span>
            <span className="t-small soft">
              {PROFILE.role}, {PROFILE.org}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
