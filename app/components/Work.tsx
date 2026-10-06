"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionIntro from "./SectionIntro";
import ProjectVisual from "./ProjectVisual";
import { Icon } from "./Icons";
import { PROJECTS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

type Tone = "card" | "forest" | "slate" | "clay" | "night";

const TONES: Record<Tone, { surface: string; visual: "light" | "dark"; dot: string }> = {
  card: { surface: "bg-card", visual: "light", dot: "var(--forest)" },
  forest: { surface: "theme-forest bg-forest", visual: "dark", dot: "var(--signal)" },
  slate: { surface: "theme-forest bg-slate", visual: "dark", dot: "#c9d6e3" },
  clay: { surface: "theme-clay bg-clay", visual: "dark", dot: "#f1d9c2" },
  night: { surface: "theme-dark bg-black", visual: "dark", dot: "var(--signal)" },
};

/* bento rhythm on a 12-col grid: two features, a row of three,
   a feature with a stacked pair, then a row of four */
const LAYOUT: { span: string; tone: Tone; feature?: boolean }[] = [
  { span: "md:col-span-2 lg:col-span-5 lg:row-span-2", tone: "forest", feature: true },
  { span: "md:col-span-2 lg:col-span-7 lg:row-span-2", tone: "card", feature: true },
  { span: "lg:col-span-4", tone: "slate" },
  { span: "lg:col-span-4", tone: "card" },
  { span: "md:col-span-2 lg:col-span-4", tone: "clay" },
  { span: "md:col-span-2 lg:col-span-7 lg:row-span-2", tone: "night", feature: true },
  { span: "lg:col-span-5", tone: "card" },
  { span: "lg:col-span-5", tone: "card" },
  { span: "lg:col-span-3", tone: "forest" },
  { span: "lg:col-span-3", tone: "card" },
  { span: "lg:col-span-3", tone: "slate" },
  { span: "lg:col-span-3", tone: "card" },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-work-card]", { opacity: 0, y: 56 });
      ScrollTrigger.batch("[data-work-card]", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }),
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-labelledby="work-heading"
      data-nav="light"
      className="frame-x pb-[var(--section)] pt-[calc(var(--section)*0.6)]"
    >
      <SectionIntro
        id="work-heading"
        size="display"
        eyebrow={`Selected work · ${PROJECTS.length} projects`}
        lines={["Built after hours.", <span key="tail" className="text-taupe">Shipped like production.</span>]}
        lead="Agent security, RAG, agentic systems, NASA instrument software and native graphics, all open on GitHub."
        className="mb-16 max-w-4xl"
      />

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:auto-rows-[minmax(17rem,auto)] lg:grid-cols-12">
        {PROJECTS.map((project, i) => {
          const layout = LAYOUT[i % LAYOUT.length];
          const tone = TONES[layout.tone];
          return (
            <li key={project.name} data-work-card className={layout.span}>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex h-full flex-col overflow-hidden rounded-[14px] p-6 transition-transform duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 sm:p-7 ${tone.surface}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="eyebrow">
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: tone.dot }} aria-hidden="true" />
                    {project.domain}
                  </span>
                  <span className="font-mono-ui text-faint">{project.year}</span>
                </div>

                <div
                  className={`relative mt-6 overflow-hidden rounded-[10px] ${
                    layout.feature ? "min-h-[11rem] flex-1" : "h-16"
                  }`}
                >
                  <ProjectVisual
                    seed={project.seed}
                    tone={tone.visual}
                    className="absolute inset-0 h-full w-full transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06]"
                  />
                </div>

                <div className="mt-6">
                  <h3
                    className={
                      layout.feature
                        ? "text-[clamp(1.6rem,1.1rem+1.3vw,2.25rem)] leading-tight tracking-[-0.012em]"
                        : "text-[1.35rem] leading-snug tracking-[-0.01em]"
                    }
                  >
                    {project.name}
                  </h3>
                  <p className={`mt-3 text-[0.95rem] leading-relaxed text-dim ${layout.feature ? "" : "line-clamp-3"}`}>
                    {project.description}
                  </p>
                  <p className="font-mono-ui mt-5 text-faint">{project.stack.join(" · ")}</p>
                </div>

                <span
                  aria-hidden="true"
                  className="absolute right-5 top-14 grid h-9 w-9 place-items-center rounded-full bg-[var(--chip)] opacity-0 transition-all duration-500 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-1 group-hover:opacity-100"
                >
                  <Icon name="arrow" size={16} />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
