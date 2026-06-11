"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STACK } from "../lib/data";
import { prefersReducedMotion, scrambleTo } from "../lib/motion";

export default function SpecSheet() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-spec-row]").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 36,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: row, start: "top 92%" },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const onHover = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion()) return;
    const el = e.currentTarget;
    const label = el.dataset.label ?? el.textContent ?? "";
    scrambleTo(el, label, 420);
  };

  return (
    <section id="stack" ref={sectionRef} aria-labelledby="stack-heading" className="py-[var(--section)]">
      <div className="gutter mb-14">
        <p className="font-mono-ui text-dim mb-6">
          <span className="text-accent">(03)</span> — Capabilities
        </p>
        <h2 id="stack-heading" className="leading-[0.92] tracking-tight" style={{ fontSize: "var(--text-title)" }}>
          <span className="font-sans font-medium uppercase">Spec</span>{" "}
          <span className="font-display italic">sheet</span>
        </h2>
      </div>

      <dl>
        {STACK.map((group) => (
          <div
            key={group.label}
            data-spec-row
            className="gutter hairline-t grid grid-cols-1 gap-3 py-7 sm:grid-cols-[11rem_1fr] sm:items-baseline lg:grid-cols-[16rem_1fr]"
          >
            <dt className="font-mono-ui text-dim">{group.label}</dt>
            <dd className="flex flex-wrap gap-x-7 gap-y-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  data-label={item}
                  data-cursor="hover"
                  onMouseEnter={onHover}
                  className="cursor-default font-sans text-xl font-medium uppercase tracking-tight transition-colors duration-200 hover:text-accent sm:text-2xl"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
