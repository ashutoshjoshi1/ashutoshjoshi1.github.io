"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FleetGlyph, { type GlyphKind } from "./FleetGlyph";
import SectionIntro from "./SectionIntro";
import Button from "./Button";
import { Icon } from "./Icons";
import { FLEET } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

/* x/y: top-left in % of the field; w/h in px (scaled down on phones);
   depth: parallax strength as the field scrolls past the headline */
const TILES: { kind: GlyphKind; x: number; y: number; w: number; h: number; depth: number }[] = [
  { kind: "globe", x: 6, y: 5, w: 150, h: 120, depth: 0.7 },
  { kind: "spectrum", x: 31, y: 1, w: 132, h: 100, depth: 1.25 },
  { kind: "gauge", x: 61, y: 4, w: 116, h: 96, depth: 0.85 },
  { kind: "cloudmask", x: 81, y: 13, w: 150, h: 112, depth: 1.05 },
  { kind: "anomaly", x: 2, y: 33, w: 170, h: 120, depth: 1.15 },
  { kind: "heat", x: 85, y: 39, w: 140, h: 100, depth: 0.75 },
  { kind: "pipeline", x: 10, y: 61, w: 150, h: 104, depth: 0.95 },
  { kind: "sunscan", x: 79, y: 66, w: 150, h: 108, depth: 1.3 },
  { kind: "cpp", x: 31, y: 80, w: 132, h: 96, depth: 0.8 },
  { kind: "wave", x: 58, y: 83, w: 168, h: 104, depth: 1.1 },
];

export default function Fleet() {
  const sectionRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const field = fieldRef.current;
    if (!section || !field || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((wrap, i) => {
        const tile = TILES[i];
        const inner = wrap.firstElementChild as HTMLElement | null;
        if (!inner) return;
        /* burst: tiles start gathered behind the headline (centre, upper
           third of the field), then spread out to their spots */
        gsap.fromTo(
          inner,
          {
            x: () => (0.5 - tile.x / 100) * field.clientWidth * 0.55,
            y: () => (0.33 - tile.y / 100) * field.clientHeight * 0.45,
            scale: 0.4,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: field,
              start: "top 95%",
              end: "top 5%",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          },
        );
        /* depth: nearer tiles drift faster than the sticky headline */
        gsap.to(wrap, {
          yPercent: -70 * tile.depth,
          ease: "none",
          scrollTrigger: { trigger: field, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.from("[data-fleet-card]", {
        x: 80,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-fleet-cards]", start: "top 82%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({
      atStart: el.scrollLeft < 8,
      atEnd: el.scrollLeft + el.clientWidth > el.scrollWidth - 8,
    });
  };

  const page = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.querySelector<HTMLElement>("[data-fleet-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 8), behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="systems" aria-labelledby="fleet-heading" data-nav="light">
      {/* overflow-clip, not hidden: hidden would make this a scroll
          container and break the sticky headline inside it */}
      <div ref={fieldRef} className="relative h-[150svh] min-h-[900px] overflow-clip [--tile-scale:0.62] sm:[--tile-scale:0.8] xl:[--tile-scale:1]">
        {TILES.map((tile) => (
          <div
            key={tile.kind}
            data-tile
            aria-hidden="true"
            /* tiles level with the headline only fit beside it on wide screens */
            className={`absolute ${tile.y > 20 && tile.y < 75 ? "hidden xl:block" : ""}`}
            style={{ left: `${tile.x}%`, top: `${tile.y}%` }}
          >
            <div
              className="float-tile"
              style={{ width: `calc(${tile.w}px * var(--tile-scale))`, height: `calc(${tile.h}px * var(--tile-scale))` }}
            >
              <FleetGlyph kind={tile.kind} />
            </div>
          </div>
        ))}

        <div className="gutter sticky top-0 flex h-[100svh] items-center justify-center">
          <SectionIntro
            id="fleet-heading"
            size="display"
            eyebrow="NASA · Pandonia Global Network"
            lines={["Ground truth", <span key="tail" className="text-taupe">for NASA science.</span>]}
            lead="Production machine learning on 300+ Pandora spectrometers across five continents, from the raw instrument stream to datasets researchers trust."
            className="relative z-10 max-w-3xl"
          >
            <Button href="#fleet-systems" variant="solid" icon="down">
              See the systems
            </Button>
          </SectionIntro>
        </div>
      </div>

      <div id="fleet-systems" className="pb-[var(--section)]">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          data-fleet-cards
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)]"
        >
          {FLEET.map((system) => (
            <article
              key={system.title}
              data-fleet-card
              className="card flex min-h-[25rem] w-[min(84vw,25rem)] shrink-0 snap-start flex-col p-7 sm:p-8"
            >
              <span className="chip-icon">
                <Icon name={system.icon} size={22} />
              </span>
              <h3 className="mt-auto text-[0.95rem] text-dim">{system.title}</h3>
              <p className="mt-3 text-[length:var(--text-card)] leading-[1.45] tracking-[-0.01em]">{system.statement}</p>
              <p className="font-mono-ui mt-8 text-faint">{system.label}</p>
            </article>
          ))}
        </div>

        <div className="gutter mt-12 flex flex-wrap items-end justify-between gap-6">
          <h3 className="h2 max-w-xl">Proven on a planetary instrument network.</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => page(-1)}
              disabled={edges.atStart}
              aria-label="Previous system"
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-button)] border border-line transition-colors hover:bg-card disabled:opacity-35"
            >
              <Icon name="chevronLeft" />
            </button>
            <button
              type="button"
              onClick={() => page(1)}
              disabled={edges.atEnd}
              aria-label="Next system"
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-button)] border border-line transition-colors hover:bg-card disabled:opacity-35"
            >
              <Icon name="chevron" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
