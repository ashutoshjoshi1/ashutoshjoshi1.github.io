"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MORE_WORK, PROJECTS } from "../../lib/data";
import Lines from "../motion/Lines";
import Icon from "../ui/Icon";
import "./work.css";

/* wide screens show the open project beside its name and let the reading
   position choose it; phones open one project at a time under its name */
const WIDE_QUERY = "(min-width: 900px)";

/* The index: every project's name, large. One is open at a time; on a wide
   screen its description stands beside it and follows the row being read
   (or pointed at), on a phone it opens in place. */
export default function Work() {
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [open, setOpen] = useState(-1);

  useEffect(() => {
    if (!window.matchMedia(WIDE_QUERY).matches) return;
    setOpen(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = rowRefs.current.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setOpen(index);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    rowRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const point = (i: number) => {
    if (window.matchMedia(`${WIDE_QUERY} and (hover: hover)`).matches) setOpen(i);
  };
  const toggle = (i: number) => {
    const wide = window.matchMedia(WIDE_QUERY).matches;
    setOpen((current) => (current === i && !wide ? -1 : i));
  };

  return (
    <section id="work" className="work section" aria-labelledby="work-title">
      <header className="work__head wrap grid-12">
        <Lines id="work-title" className="work__title t-head" lines={["Selected work"]} />
        <p className="work__intro t-lead" data-rise>
          Fourteen things I built after hours and shipped like production: agents, retrieval, instruments and graphics.
        </p>
      </header>

      <ol className="work__list wrap">
        {PROJECTS.map((project, i) => {
          const isOpen = open === i;
          const detailsId = `work-${project.slug}`;
          return (
            <li
              key={project.slug}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="project"
              data-open={isOpen}
              data-rise
              style={{ "--d": `${(i % 5) * 60}ms` } as CSSProperties}
            >
              <h3 className="project__heading">
                <button
                  type="button"
                  className="project__button"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onPointerEnter={() => point(i)}
                  onFocus={() => point(i)}
                  onClick={() => toggle(i)}
                >
                  <span className="project__name t-head">{project.name}</span>
                  <span className="project__meta t-small">
                    {project.domain} · {project.year}
                  </span>
                </button>
              </h3>
              <div id={detailsId} className="project__details" role="region" aria-label={project.name} inert={!isOpen}>
                <div className="project__inner">
                  <p className="project__description">{project.description}</p>
                  <p className="project__stack t-small soft">{project.stack.join(", ")}</p>
                  {project.private ? (
                    <p className="project__private t-small">Private repository. A walkthrough is available on request.</p>
                  ) : (
                    <a className="link project__link sans" href={project.link} target="_blank" rel="noopener noreferrer">
                      Read the code on GitHub
                      <Icon name="arrow-up-right" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="work__more wrap grid-12">
        <div className="work__more-head">
          <h3 className="work__more-title t-lead sans">More on GitHub</h3>
          <p className="work__more-intro">
            Thirteen smaller public repositories, each described from its own README: instrument software from the lab,
            and the machine learning and vision work that came before it.
          </p>
        </div>
        {MORE_WORK.map((group) => (
          <div key={group.label} className="work__group">
            <h4 className="work__group-title t-small soft">{group.label}</h4>
            <ul className="repos">
              {group.items.map((repo) => (
                <li key={repo.name} className="repo" data-rise>
                  <p className="repo__line">
                    <a className="repo__name link sans" href={repo.link} target="_blank" rel="noopener noreferrer">
                      {repo.name}
                    </a>
                    <span className="repo__meta t-small soft figures">
                      {repo.language}, {repo.year}
                    </span>
                  </p>
                  <p className="repo__summary">{repo.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
