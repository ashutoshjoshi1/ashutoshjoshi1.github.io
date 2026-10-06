"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BatchField from "./BatchField";
import { PROFILE, CONTACT } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";
import type { EngineStats } from "../lib/batching";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const tpsRef = useRef<HTMLSpanElement>(null);
  const ttftRef = useRef<HTMLSpanElement>(null);
  const batchRef = useRef<HTMLSpanElement>(null);
  const queueRef = useRef<HTMLSpanElement>(null);

  /* live readout from the simulated engine — written straight to the DOM
     so a 600ms stats tick never re-renders the hero */
  const onStats = useCallback((stats: EngineStats) => {
    if (tpsRef.current) tpsRef.current.textContent = Math.round(stats.tokensPerSec).toLocaleString("en-US");
    if (ttftRef.current) ttftRef.current.textContent = String(Math.round(stats.ttftP50));
    if (batchRef.current) batchRef.current.textContent = `${stats.busy}/${stats.slots}`;
    if (queueRef.current) queueRef.current.textContent = String(stats.queue);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    const copy = copyRef.current;
    if (!section || !frame || !media || !copy || prefersReducedMotion()) return;

    const inset = getComputedStyle(document.documentElement).getPropertyValue("--frame-inset").trim() || "18px";
    const closed = `inset(0% ${inset} 0% ${inset} round 10px)`;

    const ctx = gsap.context(() => {
      /* arrival: the frame opens vertically, the footage settles, the
         headline rises line by line */
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(frame, { clipPath: `inset(6% ${inset} 6% ${inset} round 10px)` }, { clipPath: closed, duration: 1.6 }, 0)
        .from(media, { scale: 1.14, duration: 2.4 }, 0)
        .from(copy.querySelectorAll(".line-inner"), { yPercent: 108, duration: 1.25, stagger: 0.1 }, 0.25)
        .from(section.querySelectorAll("[data-hero-fade]"), { opacity: 0, y: 12, duration: 1, stagger: 0.07 }, 0.55);

      /* scroll: the frame opens to full bleed while the page goes dark,
         handing off seamlessly to the black stack section below */
      gsap
        .timeline({
          scrollTrigger: { trigger: section, start: 0, end: "bottom top", scrub: true },
        })
        .fromTo(
          frame,
          { clipPath: closed },
          { clipPath: "inset(0% 0px 0% 0px round 0px)", ease: "none", duration: 0.55, immediateRender: false },
          0,
        )
        /* the white margins go dark early so no grey seam shows mid-scroll */
        .to(section, { backgroundColor: "#000000", ease: "none", duration: 0.3 }, 0)
        .to(copy, { yPercent: -16, opacity: 0, ease: "none", duration: 1 }, 0)
        .to(media, { yPercent: 10, ease: "none", duration: 1 }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-labelledby="hero-heading"
      data-nav="light"
      className="relative bg-paper"
    >
      <div
        ref={frameRef}
        className="hero-frame theme-dark relative h-[calc(100svh-7rem)] min-h-[540px] overflow-hidden bg-black"
      >
        <div ref={mediaRef} className="absolute inset-0">
          <BatchField className="absolute inset-0 h-full w-full" onStats={onStats} />
        </div>
        {/* legibility: the footage falls away behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(62% 52% at 50% 50%, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        <div
          ref={copyRef}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        >
          <h1 id="hero-heading">
            <span data-hero-fade className="eyebrow mb-7 flex justify-center">
              {PROFILE.name} — {PROFILE.role}
            </span>
            <span className="display block">
              {PROFILE.headline.map((line) => (
                <span key={line} className="line-mask">
                  <span className="line-inner">{line}</span>
                </span>
              ))}
            </span>
          </h1>
          <p data-hero-fade className="lead mt-7">
            {PROFILE.org} · {CONTACT.location}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-7">
          <p data-hero-fade className="font-mono-ui hidden items-center gap-2.5 text-dim sm:flex">
            <span className="status-dot" aria-hidden="true" />
            Live sim · move or tap to add traffic
          </p>
          <p data-hero-fade className="font-mono-ui text-dim">
            Scroll to explore
          </p>
          <p data-hero-fade className="font-mono-ui hidden tabular-nums text-dim md:block">
            <span ref={tpsRef}>—</span> tok/s · TTFT p50 <span ref={ttftRef}>—</span> ms · batch{" "}
            <span ref={batchRef}>—</span> · queue <span ref={queueRef}>—</span>
          </p>
        </div>
      </div>
    </section>
  );
}
