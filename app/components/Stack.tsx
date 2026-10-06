"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StackArt, { type ArtKind } from "./StackArt";
import { CHAPTERS, TOOLCHAIN } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

/* how the four panels sit in space for each chapter: whole-stack rotation
   plus the per-panel spread (dx sideways, dz into the screen) */
interface Arrangement {
  ry: number;
  rx: number;
  rz: number;
  dx: number;
  dz: number;
}

const ARRANGEMENTS: Arrangement[] = [
  { ry: -26, rx: 9, rz: -3, dx: 44, dz: 64 },
  { ry: -34, rx: 7, rz: -2, dx: 70, dz: 86 },
  { ry: -16, rx: 13, rz: -5, dx: 30, dz: 122 },
  { ry: -38, rx: 5, rz: 0, dx: 20, dz: 44 },
  { ry: -21, rx: 9, rz: -3, dx: 86, dz: 58 },
];

/* per chapter: the headline chart on the front glass "screen", and a
   supporting line drawing on the panel behind it */
const ART: { screen: ArtKind; drawing: ArtKind }[] = [
  { screen: "lanes", drawing: "kvGrid" },
  { screen: "speedup", drawing: "batch" },
  { screen: "gpus", drawing: "pods" },
  { screen: "bits", drawing: "spec" },
  { screen: "latency", drawing: "gate" },
];

const panelPose = (a: Arrangement, depth: number) => ({ x: (depth - 1.5) * a.dx, z: -depth * a.dz });

/* later chapters' drawings start hidden in the markup itself, so a static
   (reduced-motion or pre-hydration) render shows one clean set */
const LATER_CHAPTER = { opacity: 0 };

export default function Stack() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const pin = pinRef.current;
    const inner = innerRef.current;
    if (!section || !pin || !inner) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      const texts = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      const layers = (i: number) => gsap.utils.toArray<HTMLElement>(`[data-art="${i}"]`);
      const first = ARRANGEMENTS[0];

      gsap.set(inner, { rotationY: first.ry, rotationX: first.rx, rotationZ: first.rz });
      panels.forEach((panel, depth) => gsap.set(panel, panelPose(first, depth)));
      if (prefersReducedMotion()) return;

      gsap.set(texts.slice(1), { autoAlpha: 0, y: 28 });
      gsap.set(section.querySelectorAll("[data-word]"), { opacity: 0.2 });

      /* one scroll-scrubbed timeline, one unit per chapter: the stack
         re-poses, drawings cross-fade, then the copy lights up word by word */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => `+=${window.innerHeight * CHAPTERS.length * 0.9}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      CHAPTERS.forEach((_, i) => {
        const at = i;
        if (i > 0) {
          const a = ARRANGEMENTS[i];
          tl.to(inner, { rotationY: a.ry, rotationX: a.rx, rotationZ: a.rz, duration: 0.42, ease: "power2.inOut" }, at);
          panels.forEach((panel, depth) => {
            tl.to(panel, { ...panelPose(a, depth), duration: 0.42, ease: "power2.inOut" }, at);
          });
          tl.to(layers(i - 1), { opacity: 0, duration: 0.18 }, at);
          tl.to(layers(i), { opacity: 1, duration: 0.26 }, at + 0.14);
          tl.to(texts[i - 1], { autoAlpha: 0, y: -28, duration: 0.18 }, at);
          tl.to(texts[i], { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" }, at + 0.14);
        }
        tl.to(texts[i].querySelectorAll("[data-word]"), { opacity: 1, duration: 0.08, stagger: { amount: 0.4 } }, at + (i === 0 ? 0.04 : 0.36));
        const extras = texts[i].querySelectorAll("[data-extra]");
        if (extras.length > 0) {
          tl.fromTo(extras, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.05 }, at + 0.62);
        }
      });
      tl.to({}, { duration: 0.25 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="serving"
      ref={sectionRef}
      aria-label="LLM inference work"
      data-nav="dark"
      className="theme-dark relative bg-black"
    >
      <div ref={pinRef} className="stack-frame flex h-[100svh] min-h-[640px] flex-col overflow-hidden">
        {/* the 3D stage */}
        <div className="stage relative h-[46%] min-h-[260px] w-full [--panel-w:clamp(230px,36vw,430px)]">
          <div className="stage-float absolute inset-0">
            <div ref={innerRef} className="stage-inner">
              {/* depth order: 0 glass screen (headline chart), 1 drawing,
                  2 annotations, 3 back frame */}
              <div data-panel className="panel3d panel3d--screen">
                {ART.map((art, i) => (
                  <div key={i} data-art={i} className="art-layer" style={i > 0 ? LATER_CHAPTER : undefined}>
                    <StackArt kind={art.screen} seed={11 + i} />
                  </div>
                ))}
              </div>
              <div data-panel className="panel3d">
                {ART.map((art, i) => (
                  <div key={i} data-art={i} className="art-layer" style={i > 0 ? LATER_CHAPTER : undefined}>
                    <StackArt kind={art.drawing} seed={31 + i} />
                  </div>
                ))}
              </div>
              <div data-panel className="panel3d">
                {ART.map((_, i) => (
                  <div key={i} data-art={i} className="art-layer" style={i > 0 ? LATER_CHAPTER : undefined}>
                    <StackArt kind="annotations" seed={53 + i} />
                  </div>
                ))}
              </div>
              <div data-panel className="panel3d panel3d--back" />
            </div>
          </div>
        </div>

        {/* chapter copy: all chapters share one grid cell and cross-fade */}
        <div className="gutter flex flex-1 items-start justify-center pt-[3vh]">
          <div className="chapter-stack grid w-full max-w-4xl text-center">
            {CHAPTERS.map((chapter, i) => (
              <div key={chapter.title} data-chapter className="chapter">
                <p className="eyebrow">
                  <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
                  {chapter.eyebrow}
                </p>
                <h2 className="h2 mt-5">{chapter.title}</h2>
                <p className="lead mx-auto mt-5 max-w-3xl !text-[var(--ink)]">
                  {chapter.body.split(" ").map((word, w) => (
                    <span key={w} data-word>
                      {word}{" "}
                    </span>
                  ))}
                </p>
                {chapter.metric && (
                  <p data-extra className="mt-7 flex justify-center">
                    <span className="btn btn-forest btn-sm pointer-events-none font-mono-ui !text-[0.75rem]">
                      {chapter.metric}
                    </span>
                  </p>
                )}
                {i === 1 && (
                  <ul data-extra className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2" aria-label="Serving toolchain">
                    {TOOLCHAIN.map((tool) => (
                      <li key={tool} className="text-[0.95rem] text-faint">
                        {tool}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
