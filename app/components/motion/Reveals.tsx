"use client";

import { useEffect } from "react";

/* every element that arrives once as it scrolls into view */
const SELECTOR = "[data-rise], [data-lines], [data-reveal]";

/*
 * One observer for the whole page. Elements start in their finished state;
 * under `html.js` and motion allowed, CSS holds them back until this marks
 * them `is-in`: at once when they are already on screen, otherwise when
 * their top is about 88% of the way down. Each fires once, never replayed.
 */
export default function Reveals() {
  useEffect(() => {
    const all = [...document.querySelectorAll<HTMLElement>(SELECTOR)];
    if (!("IntersectionObserver" in window)) {
      all.forEach((el) => el.classList.add("is-in"));
      return;
    }
    /* nothing on the first screen waits for a scroll: it arrives on load */
    const onFirstScreen = (el: HTMLElement) => el.getBoundingClientRect().top < window.innerHeight;
    all.filter(onFirstScreen).forEach((el) => el.classList.add("is-in"));
    const elements = all.filter((el) => !el.classList.contains("is-in"));
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
