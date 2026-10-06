"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IMPACT_METRICS, IMPACT_STATEMENT } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

/* computer-vision style labels over the Goddard photo, in % of the image */
const BOXES = [
  { label: "nasa_gsfc · 0.98", x: 15.3, y: 1.7, w: 39.4, h: 24, inside: true },
  { label: "text · goddard space flight center", x: 7, y: 46, w: 91, h: 20, inside: false },
  { label: "engineer · 0.99", x: 58.8, y: 53.6, w: 31.4, h: 46.4, inside: false },
];
const KEYPOINTS = [
  [22, 50],
  [38, 53],
  [55, 56],
  [74, 51],
  [30, 61],
  [66, 61],
  [72, 58],
  [65, 76],
  [83, 77],
];

/*
 * The production numbers, on a forest card that pins while its statement
 * lights up — then recedes as the grey sheet slides over it.
 * Track = 300svh: 100 to reveal, 100 to be covered, 100 for the sheet's
 * own overlap (see .sheet's negative margin).
 */
export default function Impact() {
  const trackRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const track = trackRef.current;
    const body = bodyRef.current;
    const dim = dimRef.current;
    if (!track || !body || !dim || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const counters = track.querySelectorAll<HTMLElement>("[data-count]");
      const words = track.querySelectorAll("[data-word]");
      gsap.set(words, { opacity: 0.18 });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: { trigger: track, start: "top 55%", end: "top -60%", scrub: 0.6 },
      });

      gsap.from("[data-box]", {
        opacity: 0,
        scale: 0.86,
        duration: 0.9,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: track, start: "top 35%" },
      });

      counters.forEach((el, i) => {
        const target = Number(el.dataset.count);
        const proxy = { v: 0 };
        el.textContent = "0";
        gsap.to(proxy, {
          v: target,
          duration: 1.6,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: track, start: "top -30%" },
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.v));
          },
        });
      });

      /* covered: the card dims and sinks back as the sheet arrives */
      gsap
        .timeline({ scrollTrigger: { trigger: track, start: "top -100%", end: "top -200%", scrub: true } })
        .to(dim, { opacity: 0.75, ease: "none" }, 0)
        .to(body, { scale: 0.93, ease: "none" }, 0);
    }, track);

    return () => ctx.revert();
  }, []);

  return (
    <div id="impact" ref={trackRef} data-nav="dark" className="relative h-[300svh] bg-black">
      <section
        aria-labelledby="impact-heading"
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden"
      >
        <div
          ref={bodyRef}
          className="frame-x grid w-full items-center gap-2 lg:grid-cols-[auto_minmax(0,1fr)]"
        >
          <figure className="relative hidden aspect-[701/1000] h-[min(74svh,600px)] overflow-hidden rounded-[var(--radius-tile)] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized asset */}
            <img
              src="/images/ashu-nasa.jpg"
              alt="Ashutosh at the main gate of NASA Goddard Space Flight Center"
              width={701}
              height={1000}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
            {BOXES.map((box) => (
              <div
                key={box.label}
                data-box
                aria-hidden="true"
                className="absolute rounded-[4px] border border-white/90"
                style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
              >
                <span
                  className={`font-mono-ui absolute left-0 whitespace-nowrap rounded-[3px] bg-white px-1.5 py-0.5 !text-[0.625rem] text-black ${
                    box.inside ? "top-1.5 ml-1.5" : "-top-6"
                  }`}
                >
                  {box.label}
                </span>
              </div>
            ))}
            {KEYPOINTS.map(([x, y]) => (
              <svg
                key={`${x}-${y}`}
                data-box
                aria-hidden="true"
                viewBox="0 0 8 8"
                className="absolute h-2 w-2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <path d="M0.5 0.5h7l-3.5 6z" fill="none" stroke="white" strokeWidth="1" />
              </svg>
            ))}
          </figure>

          <div className="theme-forest relative flex min-h-[min(78svh,700px)] flex-col justify-between rounded-[var(--radius-card)] bg-forest p-7 sm:p-12 lg:p-14">
            <div>
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
                Production impact · SciGlob for NASA
              </p>
              <h2
                id="impact-heading"
                className="mt-7 max-w-[30ch] text-[clamp(1.65rem,0.8rem+2.6vw,3.25rem)] leading-[1.16] tracking-[-0.014em]"
              >
                {IMPACT_STATEMENT.split(" ").map((word, i) => (
                  <span key={i} data-word>
                    {word}{" "}
                  </span>
                ))}
              </h2>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:grid-cols-4">
              {IMPACT_METRICS.map((metric) => (
                <div key={metric.label} className="flex flex-col-reverse">
                  <dt className="eyebrow mt-3">{metric.label}</dt>
                  <dd className="text-[clamp(2.1rem,1.4rem+2.2vw,3.4rem)] leading-none tabular-nums tracking-[-0.02em]">
                    {metric.sign}
                    <span data-count={metric.value}>{metric.value}</span>%
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div ref={dimRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black opacity-0" />
      </section>
    </div>
  );
}
