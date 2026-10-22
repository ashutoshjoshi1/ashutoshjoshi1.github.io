"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FIELD_STATEMENT, FLEET } from "../../lib/data";
import Lines from "../motion/Lines";
import NasaFrame from "./NasaFrame";
import "./nasa.css";

export default function Nasa() {
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  /* the system crossing the middle of the screen owns the picture */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = rowRefs.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rowRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="nasa" className="nasa section" data-ink="light" aria-labelledby="nasa-title">
      <header className="nasa__head wrap">
        <Lines id="nasa-title" className="nasa__title t-head" lines={["Machine learning", "for NASA"]} />
        <p className="nasa__statement t-lead" data-rise>
          {FIELD_STATEMENT}
        </p>
      </header>

      <div className="nasa__split wrap">
        <div className="nasa__held">
          <NasaFrame active={FLEET[active].picture} />
        </div>

        <ul className="nasa__list">
          {FLEET.map((system, i) => (
            <li
              key={system.title}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="system"
              data-active={active === i}
              data-rise
              style={{ "--d": "60ms" } as CSSProperties}
            >
              <div className="system__head">
                <h3 className="system__title t-lead">{system.title}</h3>
                <p className="system__label t-small">{system.label}</p>
              </div>
              <p className="system__body measure">{system.statement}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
