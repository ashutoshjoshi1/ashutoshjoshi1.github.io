"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Wire3D from "./Wire3D";
import { prefersReducedMotion } from "../lib/motion";

const RULES = [
  {
    id: "FR-01",
    model: "dish" as const,
    title: "Hardware doesn't lie.",
    body: "Dashboards drift; photons don't. Every system I build starts at the sensor and works backwards — if the instrument disagrees with the chart, the chart loses.",
  },
  {
    id: "FR-02",
    model: "icosahedron" as const,
    title: "Determinism beats vibes.",
    body: "LLMs get to reason. They don't get to gamble. The core stays deterministic, immutable and tested — my trading engine ships at ~93% coverage for a reason.",
  },
  {
    id: "FR-03",
    model: "torus" as const,
    title: "Close the loop.",
    body: "An agent that acts but never measures is just noise with confidence. Pipelines end where feedback begins — every output feeds the next decision.",
  },
  {
    id: "FR-04",
    model: "waveGrid" as const,
    title: "Ship the signal.",
    body: "Data isn't a product until someone downstream can act on it. Five continents of instruments mean nothing if the science never lands.",
  },
];

export default function FlightRules() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((card, i) => {
        gsap.from(card, {
          y: 70,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          delay: (i % 2) * 0.12,
          scrollTrigger: { trigger: card, start: "top 90%" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="rules"
      ref={sectionRef}
      aria-labelledby="rules-heading"
      className="py-[var(--section)]"
    >
      <div className="gutter mb-16">
        <p className="font-mono-ui text-dim mb-6">
          <span className="text-accent">(05)</span> — Operating principles
        </p>
        <h2
          id="rules-heading"
          className="leading-[0.92] tracking-tight"
          style={{ fontSize: "var(--text-title)" }}
        >
          <span className="font-sans font-medium uppercase">Flight</span>{" "}
          <span className="font-display italic">rules</span>
        </h2>
        <p className="mt-8 max-w-md text-sm leading-relaxed text-dim">
          NASA writes flight rules so nobody improvises during a launch. These are mine —
          rendered as the instruments they came from.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {RULES.map((rule) => (
          <article
            key={rule.id}
            data-rule
            data-cursor="hover"
            onMouseEnter={() => setHovered(rule.id)}
            onMouseLeave={() => setHovered(null)}
            className="rule-card gutter py-12 md:px-12 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:border-[var(--line)]"
          >
            <div className="flex items-start justify-between gap-6">
              <span className="font-mono-ui text-dim">{rule.id}</span>
              <span className="font-mono-ui text-accent opacity-0 transition-opacity duration-300 [.rule-card:hover_&]:opacity-100">
                ● TRACKING
              </span>
            </div>
            <Wire3D
              model={rule.model}
              boosted={hovered === rule.id}
              className="mx-auto my-6 block h-52 w-full max-w-xs sm:h-60"
            />
            <h3 className="font-display italic text-3xl leading-tight sm:text-4xl">
              {rule.title}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-dim">{rule.body}</p>
          </article>
        ))}
      </div>
      <div className="hairline-t" aria-hidden="true" />
    </section>
  );
}
