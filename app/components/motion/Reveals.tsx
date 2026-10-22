"use client";

import { useEffect } from "react";

/* every element that arrives once as it scrolls into view */
const SELECTOR = "[data-rise], [data-lines], [data-reveal]";

/*
 * One observer for the whole page. Elements start in their finished state;
 * under `html.js` and motion allowed, CSS holds them back until this marks
 * them `is-in`, when their top is about 88% of the way down the screen.
 * Each fires once and is never replayed.
 */
export default function Reveals() {
  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
