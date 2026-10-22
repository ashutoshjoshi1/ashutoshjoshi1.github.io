"use client";

import { useEffect, useRef } from "react";

const PROBE_SIZE = 100;

/* A line of display type sized by measurement to span its container
   exactly, at any width and in any face. */
export default function FitName({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = `${PROBE_SIZE}px`;
      const natural = el.scrollWidth;
      const available = box.clientWidth - parseFloat(getComputedStyle(box).paddingLeft) - parseFloat(getComputedStyle(box).paddingRight);
      if (natural > 0) el.style.fontSize = `${((PROBE_SIZE * available) / natural).toFixed(2)}px`;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <p ref={ref} className={className} aria-hidden="true">
      {text}
    </p>
  );
}
