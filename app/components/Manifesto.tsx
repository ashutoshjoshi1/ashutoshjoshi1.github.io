"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitWords, prefersReducedMotion } from "../lib/motion";
import { MANIFESTO } from "../lib/data";

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const words = splitWords(text);
      gsap.set(words, { opacity: 0.13 });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.04,
        ease: "none",
        scrollTrigger: {
          trigger: text,
          start: "top 78%",
          end: "bottom 45%",
          scrub: 0.4,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-label="Mission statement" className="gutter py-[var(--section)]">
      <p className="font-mono-ui text-dim mb-10">
        <span className="text-accent">(00)</span> — Mission
      </p>
      <p
        ref={textRef}
        className="max-w-5xl font-sans leading-[1.35] tracking-tight"
        style={{ fontSize: "var(--text-manifesto)" }}
      >
        {MANIFESTO}
      </p>
      <p className="mt-10 font-display italic text-2xl sm:text-4xl text-accent">
        Noise in. Signal out.
      </p>
    </section>
  );
}
