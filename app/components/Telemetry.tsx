"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

const READINGS = [
  { value: 6, pad: 2, suffix: "", label: "years shipping software" },
  { value: 5, pad: 2, suffix: "", label: "continents of instruments" },
  { value: 8, pad: 2, suffix: "", label: "selected transmissions" },
  { value: 150, pad: 3, suffix: "+", label: "repos of experiments" },
];

export default function Telemetry() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;

    const counters = section.querySelectorAll<HTMLElement>("[data-count]");
    if (prefersReducedMotion()) {
      counters.forEach((el) => {
        const target = Number(el.dataset.count);
        el.textContent = String(target).padStart(Number(el.dataset.pad), "0");
      });
      return;
    }

    const ctx = gsap.context(() => {
      counters.forEach((el, i) => {
        const target = Number(el.dataset.count);
        const pad = Number(el.dataset.pad);
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: target,
          duration: 1.6,
          delay: i * 0.12,
          ease: "power3.inOut",
          scrollTrigger: { trigger: section, start: "top 78%" },
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.v)).padStart(pad, "0");
          },
        });
      });

      gsap.from(section.querySelectorAll("[data-reading]"), {
        y: 44,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: section, start: "top 82%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Career telemetry"
      className="hairline-t hairline-b"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {READINGS.map((reading, i) => (
          <div
            key={reading.label}
            data-reading
            className={`gutter border-[var(--line)] py-12 sm:py-16 ${
              [
                "",
                "border-l",
                "border-t lg:border-l lg:border-t-0",
                "border-l border-t lg:border-t-0",
              ][i]
            }`}
          >
            <p className="leading-none tracking-tight" style={{ fontSize: "var(--text-stat)" }}>
              <span
                data-count={reading.value}
                data-pad={reading.pad}
                className="font-sans font-medium tabular-nums"
              >
                {"0".repeat(reading.pad)}
              </span>
              {reading.suffix && (
                <span className="font-display italic text-accent">{reading.suffix}</span>
              )}
            </p>
            <p className="font-mono-ui text-dim mt-4">{reading.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
