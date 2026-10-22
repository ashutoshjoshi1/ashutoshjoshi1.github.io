"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
    gsap.registerPlugin(ScrollTrigger);
    /* mobile URL bars resize the viewport constantly; don't re-measure
       every pin and scrub for that */
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* pins and scrubs are measured against text: re-measure once the
       real fonts have swapped in */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion() || coarse) {
      return () => {
        cancelled = true;
      };
    }

    const lenis = new Lenis({ lerp: LERP });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
