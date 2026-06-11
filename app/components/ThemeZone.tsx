"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

const DARK = {
  "--bg": "#0b0a08",
  "--bg-elev": "#14120e",
  "--ink": "#eae6dd",
  "--ink-dim": "#8f8a7b",
  "--line": "rgba(234, 230, 221, 0.12)",
  "--line-soft": "rgba(234, 230, 221, 0.06)",
  "--accent": "#00e65d",
  "--accent-dim": "rgba(0, 230, 93, 0.35)",
};

const PAPER = {
  "--bg": "#e9e4d8",
  "--bg-elev": "#ded7c6",
  "--ink": "#161310",
  "--ink-dim": "#6e6757",
  "--line": "rgba(22, 19, 16, 0.18)",
  "--line-soft": "rgba(22, 19, 16, 0.08)",
  /* phosphor green drops to forest depth for contrast on bone paper */
  "--accent": "#0b7c3c",
  "--accent-dim": "rgba(11, 124, 60, 0.35)",
};

interface ThemeZoneProps {
  children: ReactNode;
}

/*
 * Inverts the entire page to paper-light while this zone owns the viewport,
 * then hands the darkness back. GSAP tweens the CSS custom properties on
 * <html>, so every var()-driven surface follows — including the canvases.
 */
export default function ThemeZone({ children }: ThemeZoneProps) {
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const zone = zoneRef.current;
    if (!zone) return;
    if (prefersReducedMotion()) return;

    const html = document.documentElement;
    const flip = (vars: Record<string, string>) =>
      gsap.to(html, { ...vars, duration: 0.9, ease: "power2.inOut", overwrite: "auto" });

    const trigger = ScrollTrigger.create({
      trigger: zone,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: () => flip(PAPER),
      onLeave: () => flip(DARK),
      onEnterBack: () => flip(PAPER),
      onLeaveBack: () => flip(DARK),
    });

    return () => {
      trigger.kill();
      gsap.set(html, DARK);
    };
  }, []);

  return <div ref={zoneRef}>{children}</div>;
}
