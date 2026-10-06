"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Wire3D from "./Wire3D";
import SectionIntro from "./SectionIntro";
import { PRINCIPLES } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

export default function Principles() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-principle]", { opacity: 0, y: 60 });
      ScrollTrigger.batch("[data-principle]", {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, overwrite: true }),
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
        lead="Eight rules I hold every system to: four from serving models at scale, four flight rules from the instrument work. Each is drawn as the shape it came from."
        className="mb-14 max-w-2xl"
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((rule, i) => (
          <article
            key={rule.title}
            data-principle
            onMouseEnter={() => setHovered(rule.title)}
            onMouseLeave={() => setHovered(null)}
            className="card flex flex-col p-6 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-ui text-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono-ui text-faint">{i < 4 ? "Serving" : "Flight rule"}</span>
            </div>
            <Wire3D
              model={rule.model}
              boosted={hovered === rule.title}
              className="mx-auto mt-2 block h-40 w-full max-w-[13rem]"
            />
            <h3 className="mt-5 text-[length:var(--text-card)] leading-snug tracking-[-0.01em]">{rule.title}</h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-dim">{rule.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
