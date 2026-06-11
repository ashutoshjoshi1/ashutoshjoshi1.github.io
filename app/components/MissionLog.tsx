"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MISSIONS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

export default function MissionLog() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-entry]").forEach((entry) => {
        gsap.from(entry, {
          y: 56,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: entry, start: "top 90%" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="log"
      ref={sectionRef}
      aria-labelledby="log-heading"
      className="gutter grid gap-14 py-[var(--section)] lg:grid-cols-[1fr_1.6fr] lg:gap-8"
    >
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="font-mono-ui text-dim mb-6">
          <span className="text-accent">(02)</span> — Experience
        </p>
        <h2 id="log-heading" className="leading-[0.92] tracking-tight" style={{ fontSize: "var(--text-title)" }}>
          <span className="font-sans font-medium uppercase">Mission</span>
          <br />
          <span className="font-display italic">log</span>
        </h2>
        <p className="mt-8 max-w-xs text-sm leading-relaxed text-dim">
          Six years across enterprise data, research and scientific instrumentation — currently
          keeping a global atmospheric network honest.
        </p>
      </div>

      <ol>
        {MISSIONS.map((mission) => (
          <li key={mission.company} data-entry className="hairline-t py-9 first:border-t-0 lg:first:border-t">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-sans text-2xl font-medium uppercase tracking-tight sm:text-3xl">
                {mission.company}
                {mission.detail && (
                  <span className="font-display italic lowercase text-dim"> / {mission.detail}</span>
                )}
              </h3>
              <span className="font-mono-ui text-dim flex items-center gap-3 tabular-nums">
                {mission.active && (
                  <span className="flex items-center gap-2 text-accent">
                    <span className="status-dot" aria-hidden="true" />
                    Active
                  </span>
                )}
                {mission.period}
              </span>
            </div>
            <p className="font-mono-ui text-dim mt-2">
              {mission.role} — {mission.location}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-dim sm:text-base">
              {mission.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
