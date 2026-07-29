"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

/* must mirror the :root tokens in globals.css — this is the tween's home state */
const DARK = {
  "--bg": "#06070b",
  "--bg-elev": "#0c0e16",
  "--ink": "#f2f4fa",
  "--ink-dim": "#98a0b4",
  "--line": "rgba(242, 244, 250, 0.12)",
  "--line-soft": "rgba(242, 244, 250, 0.055)",
  "--accent": "#46e5a1",
  "--accent-dim": "rgba(70, 229, 161, 0.35)",
};

const PAPER = {
  "--bg": "#eceae2",
  "--bg-elev": "#e0ddd2",
  "--ink": "#131418",
  "--ink-dim": "#676c7a",
  "--line": "rgba(19, 20, 24, 0.18)",
  "--line-soft": "rgba(19, 20, 24, 0.08)",
  /* aurora green drops to forest depth for contrast on lab paper */
  "--accent": "#0d7d55",
  "--accent-dim": "rgba(13, 125, 85, 0.35)",
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
