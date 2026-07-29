"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SignalField from "./SignalField";
import Wire3D from "./Wire3D";
import { splitChars, scrambleTo, attachRepel, prefersReducedMotion } from "../lib/motion";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const firstNameRef = useRef<HTMLSpanElement>(null);
  const lastNameRef = useRef<HTMLSpanElement>(null);
  const periodRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const [scrollPct, setScrollPct] = useState("000");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const first = firstNameRef.current;
    const last = lastNameRef.current;
    const meta = metaRef.current;
    if (!section || !first || !last || !meta) return;

    let detachRepel: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const chars = [...splitChars(first), ...splitChars(last)];
      if (periodRef.current) chars.push(periodRef.current);

      if (prefersReducedMotion()) {
        gsap.set(chars, { yPercent: 0 });
        gsap.set(meta.children, { opacity: 1 });
      } else {
        gsap.set(chars, { yPercent: 130 });
        gsap.set(meta.children, { opacity: 0, y: 18 });

        const intro = () => {
          gsap.to(chars, {
            yPercent: 0,
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.04,
            delay: 0.1,
            onComplete: () => {
              /* once settled, the name becomes touchable — chars dodge the cursor */
              detachRepel = attachRepel(chars, { radius: 150, strength: 34 });
            },
          });
          gsap.to(meta.children, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.75,
          });
          if (roleRef.current) {
            scrambleTo(roleRef.current, "Senior Software Engineer — AI/ML Systems · NASA Pandora", 1100);
          }
        };

        if (document.documentElement.dataset.revealed === "true") {
          intro();
        } else {
          window.addEventListener("aj:reveal", intro, { once: true });
        }

        /* name drifts up + fades as you leave the hero */
        gsap.to([first, last], {
          yPercent: -14,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      ScrollTrigger.create({
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        onUpdate: (self) => {
          setScrollPct(String(Math.round(self.progress * 100)).padStart(3, "0"));
        },
      });
    }, section);

    return () => {
      detachRepel?.();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden"
    >
      <div className="aurora" aria-hidden="true" />
      <div className="absolute inset-0 opacity-90">
        <SignalField />
      </div>
      {/* legibility washes */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56"
        style={{ background: "linear-gradient(to top, var(--bg) 20%, transparent)" }}
      />

      {/* instrument stamp — a Pandora dish spinning in wireframe */}
      <div className="pointer-events-none absolute right-[var(--gutter)] top-24 z-10 hidden flex-col items-center md:flex">
        <Wire3D model="dish" className="block h-32 w-32" zoom={1.15} />
        <p className="font-mono-ui text-dim mt-1">
          Pandora net — <span className="text-accent">online</span>
        </p>
      </div>

      <div className="gutter relative z-10 flex flex-1 flex-col justify-end pb-10 sm:pb-14">
        <div ref={metaRef}>
          {/* the identity element — light, split into its bands */}
          <span className="spectrum-strip spectrum-strip--glow mb-6 block w-24 sm:w-36" aria-hidden="true" />
          <p className="font-mono-ui text-dim mb-4">
            <span className="text-accent">[</span>{" "}
            <span ref={roleRef}>Senior Software Engineer — AI/ML Systems · NASA Pandora</span>{" "}
            <span className="text-accent">]</span>
          </p>
        </div>

        <h1 id="hero-heading" aria-label="Ashutosh Joshi" className="leading-[0.86] tracking-[-0.03em]">
          <span
            ref={firstNameRef}
            className="block font-sans font-medium uppercase"
            style={{ fontSize: "var(--text-hero)" }}
          >
            Ashutosh
          </span>
          <span
            className="block font-display italic lowercase"
            style={{ fontSize: "var(--text-hero)" }}
          >
            <span ref={lastNameRef}>joshi</span>
            <span className="split-mask" aria-hidden="true">
              <span ref={periodRef} className="split-char not-italic text-accent">
                .
              </span>
            </span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-dim sm:text-lg">
            I turn raw sensor noise into NASA science by day — and build{" "}
            <em className="font-display italic text-ink">LLM agents, RAG systems and neural nets</em>{" "}
            after dark. One of them is training on this page right now.
          </p>
          <div className="font-mono-ui text-dim flex items-center gap-6 whitespace-nowrap">
            <span>39.20°N / 76.86°W</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              SCRL <span className="text-accent">{scrollPct}</span>%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
