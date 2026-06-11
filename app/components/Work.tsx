"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";
import ProjectVisual from "./ProjectVisual";

/* CRT-style switch glitch: a few frames of sliced clip-path + jitter */
function runGlitch(el: HTMLElement): void {
  const tl = gsap.timeline();
  for (let i = 0; i < 5; i++) {
    const top = Math.random() * 60;
    const bottom = Math.random() * 60;
    tl.set(el, {
      clipPath: `inset(${top}% 0 ${bottom}% 0)`,
      x: (Math.random() - 0.5) * 18,
    }).to({}, { duration: 0.035 });
  }
  tl.set(el, { clipPath: "inset(0% 0 0% 0)", x: 0 });
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
        gsap.from(row, {
          yPercent: 60,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: row, start: "top 92%" },
        });
      });

      /* scroll-velocity skew on the list */
      const list = section.querySelector("ul");
      if (list) {
        const proxy = { skew: 0 };
        const setSkew = gsap.quickSetter(list, "skewY", "deg");
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const skew = gsap.utils.clamp(-2, 2, self.getVelocity() / -450);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, {
                skew: 0,
                duration: 0.7,
                ease: "power3",
                overwrite: true,
                onUpdate: () => setSkew(proxy.skew),
              });
            }
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  /* preview follows the cursor with lag + velocity tilt */
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
    const moveX = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3.out" });
    const moveY = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3.out" });
    const rotate = gsap.quickTo(preview, "rotation", { duration: 0.6, ease: "power3.out" });

    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      /* keep the panel inside the viewport: flip above/below the cursor */
      const below = e.clientY < window.innerHeight * 0.55;
      moveX(e.clientX);
      moveY(e.clientY + (below ? 190 : -190));
      rotate(gsap.utils.clamp(-7, 7, (e.clientX - lastX) * 0.45));
      lastX = e.clientX;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    gsap.to(preview, {
      scale: active === null ? 0 : 1,
      opacity: active === null ? 0 : 1,
      duration: 0.45,
      ease: "expo.out",
      overwrite: "auto",
    });
    if (active !== null && previewInnerRef.current && !prefersReducedMotion()) {
      runGlitch(previewInnerRef.current);
    }
  }, [active]);

  return (
    <section id="work" ref={sectionRef} aria-labelledby="work-heading" className="py-[var(--section)]">
      <div className="gutter mb-16 flex items-end justify-between">
        <div>
          <p className="font-mono-ui text-dim mb-6">
            <span className="text-accent">(01)</span> — Selected work
          </p>
          <h2 id="work-heading" className="leading-[0.92] tracking-tight" style={{ fontSize: "var(--text-title)" }}>
            <span className="font-sans font-medium uppercase">Field</span>{" "}
            <span className="font-display italic">notes</span>
          </h2>
        </div>
        <p className="font-mono-ui text-dim hidden sm:block">8 transmissions / 2024 — 26</p>
      </div>

      <ul onMouseLeave={() => setActive(null)}>
        {PROJECTS.map((project, i) => (
          <li key={project.name} data-row className="hairline-t last:border-b last:border-[var(--line)]">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="gutter group grid grid-cols-[2.6rem_1fr] items-baseline gap-x-4 py-7 transition-colors duration-300 hover:bg-[var(--bg-elev)] sm:grid-cols-[3.5rem_1fr_auto] sm:py-9"
            >
              <span className="font-mono-ui text-dim transition-colors duration-300 group-hover:text-accent">
                {project.index}
              </span>
              <div>
                <h3
                  className="font-sans font-medium uppercase leading-none tracking-tight transition-transform duration-500 [transition-timing-function:var(--ease-expo)] group-hover:translate-x-3 sm:group-hover:translate-x-5"
                  style={{ fontSize: "var(--text-row)" }}
                >
                  {project.name}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-dim">
                  {project.description}
                </p>
                <p className="font-mono-ui text-dim mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </p>
                {/* mobile-only signature strip */}
                <div className="mt-5 overflow-hidden rounded-sm border border-[var(--line-soft)] sm:hidden">
                  <ProjectVisual seed={project.seed} className="block h-24 w-full" />
                </div>
              </div>
              <div className="hidden flex-col items-end gap-2 self-start sm:flex">
                <span className="font-mono-ui text-dim">{project.domain}</span>
                <span className="font-mono-ui text-dim opacity-60">{project.year}</span>
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block text-accent opacity-0 transition-all duration-500 [transition-timing-function:var(--ease-expo)] -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100"
                >
                  ↗
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {/* cursor-following preview (fine pointers only) */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden w-[26rem] overflow-hidden border border-[var(--line)] sm:block"
        style={{ background: "var(--bg-elev)" }}
      >
        {active !== null && (
          <div ref={previewInnerRef}>
            <ProjectVisual seed={PROJECTS[active].seed} className="block h-56 w-full" />
            <div className="flex items-center justify-between px-4 py-3 hairline-t">
              <span className="font-mono-ui text-accent">{PROJECTS[active].domain}</span>
              <span className="font-mono-ui text-dim">
                {PROJECTS[active].index} / {PROJECTS[active].year}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
