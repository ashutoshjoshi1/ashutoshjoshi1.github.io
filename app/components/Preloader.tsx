"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getLenis, prefersReducedMotion } from "../lib/motion";

const PHASES = ["ACQUIRING SIGNAL", "CALIBRATING OPTICS", "LOCKING AZIMUTH", "SIGNAL LOCKED"];

export function announceReveal(): void {
  document.documentElement.dataset.revealed = "true";
  window.dispatchEvent(new CustomEvent("aj:reveal"));
}

export default function Preloader() {
  const [gone, setGone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    const phase = phaseRef.current;
    const bar = barRef.current;
    if (!overlay || !counter || !phase || !bar) return;

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
      .to(counter, { yPercent: -120, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.25")
      .to(phase, { opacity: 0, duration: 0.3 }, "<")
      .add(() => {
        release();
        announceReveal();
      })
      .to(overlay, {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
      }, "-=0.1");

    return () => {
      tl.kill();
      release();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "var(--bg)" }}
      aria-hidden="true"
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
  );
}
