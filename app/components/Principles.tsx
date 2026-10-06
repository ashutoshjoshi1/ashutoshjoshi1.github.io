"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Wire3D from "./Wire3D";
import SectionIntro from "./SectionIntro";
import { prefersReducedMotion } from "../lib/motion";

const PRINCIPLES = [
  {
    model: "waveGrid" as const,
    title: "Measure, then tune.",
    body: "Every model and config change runs through the benchmark harness: TTFT, ITL, P95/P99, MFU/MBU. Intuition picks the experiment; numbers pick the winner.",
  },
  {
    model: "torus" as const,
    title: "The tail is the product.",
    body: "Users feel P99, not the average. Chunked prefill keeps one long prompt from stalling everyone's decode, and cache-aware routing keeps hot prefixes hot.",
  },
  {
    model: "icosahedron" as const,
    title: "Every GPU hour has an owner.",
    body: "Quantization, speculative decoding, MIG for small models and SLO-driven autoscaling. Idle silicon is a bug, not a cost of doing business.",
  },
  {
    model: "dish" as const,
    title: "Parity before speed.",
    body: "The Blick C++17 rewrite answers to a parity harness against legacy output before any optimization lands. Fast and wrong is just wrong, sooner.",
  },
];

export default function Principles() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-principle]", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-principles]", start: "top 84%" },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="principles"
      ref={sectionRef}
      aria-labelledby="principles-heading"
      className="gutter pb-[var(--section)] pt-[calc(var(--section)*0.5)]"
    >
      <SectionIntro
        id="principles-heading"
        eyebrow="Principles"
        lines={["How I work."]}
        lead="Four rules I hold every system to, drawn as the shapes they came from."
        className="mb-14 max-w-2xl"
      />
      <div data-principles className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((rule) => (
          <article
            key={rule.title}
            data-principle
            onMouseEnter={() => setHovered(rule.title)}
            onMouseLeave={() => setHovered(null)}
            className="card flex flex-col p-6 sm:p-7"
          >
            <Wire3D model={rule.model} boosted={hovered === rule.title} className="mx-auto block h-44 w-full max-w-[14rem]" />
            <h3 className="mt-6 text-[length:var(--text-card)] leading-snug tracking-[-0.01em]">{rule.title}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-dim">{rule.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
