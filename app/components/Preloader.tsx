"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getLenis, prefersReducedMotion } from "../lib/motion";

const PHASES = ["ACQUIRING SIGNAL", "CALIBRATING OPTICS", "LOCKING AZIMUTH", "SIGNAL LOCKED"];

const BOOT_LINES = [
  ["PWR BUS", "NOMINAL"],
  ["OPTICS", "ALIGNED"],
  ["AZ / EL DRIVE", "SLEWING"],
  ["UPLINK", "39.20N 76.86W"],
  ["L0 STREAM", "ACQUIRED"],
  ["SIG", "LOCKED"],
] as const;

export function announceReveal(): void {
  document.documentElement.dataset.revealed = "true";
  window.dispatchEvent(new CustomEvent("aj:reveal"));
}

export default function Preloader() {
  const [gone, setGone] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const accent = accentRef.current;
    const counter = counterRef.current;
    const phase = phaseRef.current;
    const bar = barRef.current;
    const boot = bootRef.current;
    if (!panel || !accent || !counter || !phase || !bar || !boot) return;

    if (prefersReducedMotion()) {
      announceReveal();
      setGone(true);
      return;
    }

    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    const release = () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };

    const progress = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => setGone(true),
    });

    tl.to(progress, {
      v: 100,
      duration: 2.1,
      ease: "power3.inOut",
      onUpdate: () => {
        const v = Math.round(progress.v);
        counter.textContent = String(v).padStart(3, "0");
        bar.style.transform = `scaleX(${v / 100})`;
        const idx = Math.min(PHASES.length - 1, Math.floor((v / 100) * PHASES.length));
        phase.textContent = PHASES[idx];
      },
    })
      /* telemetry boot log types in alongside the counter */
      .from(
        boot.children,
        { opacity: 0, x: -10, duration: 0.3, ease: "power2.out", stagger: 0.3 },
        0.15,
      )
      .to(counter, { yPercent: -120, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.25")
      .to(phase, { opacity: 0, duration: 0.3 }, "<")
      .to(boot, { opacity: 0, duration: 0.3 }, "<")
      .add(() => {
        release();
        announceReveal();
      })
      /* two-stage exit: dark panel peels first, accent flash chases it */
      .to(panel, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "-=0.1")
      .to(accent, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.09");

    return () => {
      tl.kill();
      release();
    };
  }, []);

  if (gone) return null;

  return (
    <div className="fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={accentRef} className="absolute inset-0" style={{ background: "var(--accent)" }} />
      <div
        ref={panelRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <span ref={phaseRef} className="font-mono-ui text-dim mb-6">
          ACQUIRING SIGNAL
        </span>
        <span
          ref={counterRef}
          className="font-display italic leading-none"
          style={{ fontSize: "clamp(5rem, 16vw, 13rem)" }}
        >
          000
        </span>

        <div
          ref={bootRef}
          className="absolute left-[var(--gutter)] top-1/2 hidden -translate-y-1/2 flex-col gap-2 sm:flex"
        >
          {BOOT_LINES.map(([system, status], i) => (
            <p key={system} className="font-mono-ui flex w-56 justify-between gap-4">
              <span className="text-dim">{system}</span>
              <span className={i >= BOOT_LINES.length - 2 ? "text-accent" : "text-dim"}>
                {status}
              </span>
            </p>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--line)" }}>
          <div
            ref={barRef}
            className="h-px origin-left"
            style={{ background: "var(--accent)", transform: "scaleX(0)" }}
          />
        </div>
        <span className="font-mono-ui text-dim absolute bottom-6 left-[var(--gutter)]">
          AJ — PORTFOLIO ©2026
        </span>
        <span className="font-mono-ui text-dim absolute bottom-6 right-[var(--gutter)]">
          39.20°N / 76.86°W
        </span>
      </div>
    </div>
  );
}
