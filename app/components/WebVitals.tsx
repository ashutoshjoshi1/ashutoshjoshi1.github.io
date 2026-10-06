"use client";

import { useEffect, useRef, useState } from "react";

interface Vitals {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  kb: number | null;
}

/* not in TypeScript's DOM lib yet */
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

function supports(type: string): boolean {
  return typeof PerformanceObserver !== "undefined" && PerformanceObserver.supportedEntryTypes?.includes(type);
}

function transferredKb(): number | null {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (!nav) return null;
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const bytes = nav.transferSize + resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  return Math.round(bytes / 1024);
}

/*
 * The site's own Core Web Vitals, measured in the visitor's browser —
 * a performance engineer's portfolio should prove it's fast, not claim it.
 * Unsupported metrics (e.g. LCP/INP in Safari) show as "—".
 */
export default function WebVitals() {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const [vitals, setVitals] = useState<Vitals>({ lcp: null, cls: null, inp: null, kb: null });

  useEffect(() => {
    const observers: PerformanceObserver[] = [];
    const watch = (type: string, onEntries: (entries: PerformanceEntry[]) => void, extra: Record<string, number> = {}) => {
      if (!supports(type)) return;
      try {
        const po = new PerformanceObserver((list) => onEntries(list.getEntries()));
        po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(po);
      } catch {
        /* entry type listed but not observable here: leave the metric as "—" */
      }
    };

    watch("largest-contentful-paint", (entries) => {
      const latest = entries[entries.length - 1];
      if (latest) setVitals((v) => ({ ...v, lcp: latest.startTime }));
    });

    let cls = 0;
    watch("layout-shift", (entries) => {
      for (const entry of entries as LayoutShiftEntry[]) if (!entry.hadRecentInput) cls += entry.value;
      setVitals((v) => ({ ...v, cls }));
    });
    if (supports("layout-shift")) setVitals((v) => ({ ...v, cls: v.cls ?? 0 }));

    watch(
      "event",
      (entries) => {
        const worst = entries.reduce((max, e) => Math.max(max, e.duration), 0);
        setVitals((v) => ({ ...v, inp: Math.max(v.inp ?? 0, worst) }));
      },
      { durationThreshold: 16 },
    );

    /* page weight once the footer is actually reached (lazy assets loaded) */
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setVitals((v) => ({ ...v, kb: transferredKb() }));
    });
    if (rootRef.current) io.observe(rootRef.current);

    return () => {
      observers.forEach((po) => po.disconnect());
      io.disconnect();
    };
  }, []);

  const show = (value: number | null, format: (n: number) => string) => (value === null ? "—" : format(value));

  return (
    <p ref={rootRef} className="font-mono-ui flex flex-wrap items-center gap-x-4 gap-y-1 text-faint">
      <span className="flex items-center gap-2 text-dim">
        <span className="status-dot" aria-hidden="true" />
        This visit, measured live
      </span>
      <span>LCP {show(vitals.lcp, (n) => `${(n / 1000).toFixed(2)} s`)}</span>
      <span>CLS {show(vitals.cls, (n) => n.toFixed(3))}</span>
      <span>INP {show(vitals.inp, (n) => `${Math.round(n)} ms`)}</span>
      <span>{show(vitals.kb, (n) => `${n.toLocaleString("en-US")} KB transferred`)}</span>
    </p>
  );
}
