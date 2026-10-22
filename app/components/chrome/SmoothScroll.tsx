"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { setLenis, prefersReducedMotion } from "../../lib/motion";

interface SmoothScrollProps {
  children: ReactNode;
}

/* light smoothing (lerp 0.12) for weight, never for touch or reduced
   motion: the page must stop when the hand stops */
const LERP = 0.12;

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion() || coarse) return;

    const lenis = new Lenis({ lerp: LERP, autoRaf: true });
    setLenis(lenis);
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
