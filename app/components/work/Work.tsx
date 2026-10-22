"use client";

import { useEffect, useRef, useState } from "react";
import { MORE_WORK, PROJECTS, type Project } from "../../lib/data";
import Lines from "../motion/Lines";
import Icon from "../ui/Icon";
import PixelArt from "./PixelArt";
import "./work.css";

/* where there is a pointer and room, a frame beside the list shows the
   project; elsewhere each row carries its own small picture */
const FRAME_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 900px)";

/* the preview frame follows the row, never the pointer */
function useRowFrame() {
  const indexRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<Project | null>(null);

  const show = (project: Project, row: HTMLElement) => {
    const index = indexRef.current;
    const frame = frameRef.current;
    if (!index || !frame || !window.matchMedia(FRAME_QUERY).matches) return;
    const y = row.offsetTop + row.offsetHeight / 2 - frame.offsetHeight / 2;
    const max = index.offsetHeight - frame.offsetHeight;
    const opening = !frame.classList.contains("is-open");
    /* open in place the first time, rather than sliding in from the top */
    if (opening) frame.style.transitionProperty = "clip-path";
    frame.style.transform = `translate3d(0, ${Math.min(max, Math.max(0, y)).toFixed(0)}px, 0)`;
    if (opening) {
      frame.getBoundingClientRect();
      frame.style.transitionProperty = "";
    }
    frame.classList.add("is-open");
    setShown(project);
  };

  /* at rest the frame holds the first project, so the index never leaves
     half the screen empty; it then stays on whichever row was last pointed at */
  useEffect(() => {
    const first = indexRef.current?.querySelector<HTMLElement>(".work__row");
    if (first) show(PROJECTS[0], first);
  }, []);

  return { indexRef, frameRef, shown, show };
}

export default function Work() {
  const { indexRef, frameRef, shown, show } = useRowFrame();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="work" className="work section" data-ink="light" aria-labelledby="work-title">
      <header className="work__head wrap">
        <Lines id="work-title" className="t-head" lines={["Selected", "work"]} />
        <p className="work__intro" data-rise>
          Fourteen things I built after hours and shipped like production: agents, retrieval, instruments and
          graphics. Point at a name to see it, open it for the details.
        </p>
      </header>

      <div ref={indexRef} className="work__index wrap">
        <ul className="work__list">
          {PROJECTS.map((project, i) => {
            const isOpen = open === project.slug;
            const panelId = `work-${project.slug}`;
            return (
              <li key={project.slug} className="work__item" data-open={isOpen} data-rise style={{ ["--d" as string]: `${(i % 6) * 50}ms` }}>
                <button
                  type="button"
                  className="work__row"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onPointerEnter={(e) => show(project, e.currentTarget)}
                  onFocus={(e) => show(project, e.currentTarget)}
                  onClick={() => setOpen(isOpen ? null : project.slug)}
                >
                  <span className="work__label">
                    <span className="work__name">{project.name}</span>
                    <span className="work__meta t-small">
                      {project.domain}, {project.year}
                    </span>
                  </span>
                  <PixelArt slug={project.slug} seed={project.seed} label="" className="work__thumb" />
                </button>
                <div id={panelId} className="work__panel" role="region" aria-label={project.name} inert={!isOpen}>
                  <div className="work__panel-inner">
                    <div className="work__details">
                    <p className="work__description measure">{project.description}</p>
                    <p className="work__stack t-small">{project.stack.join(", ")}</p>
                    {project.private ? (
                      <p className="work__private t-small">Private repository. A walkthrough is available on request.</p>
                    ) : (
                      <a className="link work__link" href={project.link} target="_blank" rel="noopener noreferrer">
                        Read the code on GitHub
                        <Icon name="arrow-up-right" />
                      </a>
                    )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div ref={frameRef} className="work__frame" aria-hidden="true">
          {shown && <PixelArt slug={shown.slug} seed={shown.seed} label="" className="work__frame-art" />}
        </div>
      </div>

      <div className="work__more wrap">
        <div className="work__more-head">
          <h3 className="work__more-title t-lead">More on GitHub</h3>
          <p className="work__more-intro">
            Thirteen smaller public repositories, each described from its own README: instrument software from the
            lab, and the machine learning and vision work that came before it.
          </p>
        </div>
        {MORE_WORK.map((group) => (
          <div key={group.label} className="work__group">
            <h4 className="work__group-title t-small">{group.label}</h4>
            <ul className="work__repos">
              {group.items.map((repo) => (
                <li key={repo.name} className="repo" data-rise>
                  <a className="repo__name link" href={repo.link} target="_blank" rel="noopener noreferrer">
                    {repo.name}
                  </a>
                  <p className="repo__summary">{repo.summary}</p>
                  <p className="repo__meta t-small">
                    {repo.language}, {repo.year}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
