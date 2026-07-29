"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ML_SYSTEMS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";
import ProjectVisual from "./ProjectVisual";

/* The day job: production ML running a planetary instrument network.
   Six systems, each tinted by its band on the spectrum. */
export default function Systems() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(gsap.utils.toArray<HTMLElement>("[data-tile]"), {
        y: 48,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: section, start: "top 74%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="systems"
      ref={sectionRef}
      aria-labelledby="systems-heading"
      className="relative py-[var(--section)]"
    >
      <div className="aurora" aria-hidden="true" />

      <div className="gutter relative mb-16 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono-ui text-dim mb-6">
            <span className="text-accent">(01)</span> — Production ML · NASA Pandora network
          </p>
          <h2
            id="systems-heading"
            className="leading-[0.92] tracking-tight"
            style={{ fontSize: "var(--text-title)" }}
          >
            <span className="font-sans font-medium uppercase">Ground</span>{" "}
            <span className="font-display italic">truth</span>
          </h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-dim sm:text-base">
            The day job: machine learning that runs a planetary instrument network — built,
            evaluated and operated in production, not in a notebook.
          </p>
        </div>
        <div className="hidden flex-col items-end gap-1 sm:flex">
          <span className="font-mono-ui text-dim">300+ spectrometers</span>
          <span className="font-mono-ui text-dim">5 continents · 1 pipeline</span>
          <span className="spectrum-strip mt-3 w-40" aria-hidden="true" />
        </div>
      </div>

      <div className="gutter relative">
        <ul className="grid grid-cols-1 gap-px border border-[var(--line-soft)] bg-[var(--line-soft)] sm:grid-cols-2 lg:grid-cols-3">
          {ML_SYSTEMS.map((system) => (
            <li
              key={system.title}
              data-tile
              className="panel flex flex-col justify-between p-7 sm:p-8"
              style={{ ["--band" as string]: system.band, background: "var(--bg)" }}
            >
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-mono-ui band-text">{system.tag}</p>
                  <p className="font-mono-ui text-dim whitespace-nowrap">{system.metric}</p>
                </div>
                <h3 className="mt-5 font-sans text-2xl font-medium uppercase leading-none tracking-tight sm:text-[1.7rem]">
                  {system.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-dim">{system.detail}</p>
              </div>
              <div className="mt-7 overflow-hidden rounded-sm border border-[var(--line-soft)] opacity-80 transition-opacity duration-500 [transition-timing-function:var(--ease-expo)] hover:opacity-100">
                <ProjectVisual seed={system.seed} className="block h-16 w-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
