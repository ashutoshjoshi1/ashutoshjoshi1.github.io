"use client";

import { useEffect, useRef } from "react";
import {
  BatchEngine,
  CELL_DECODE,
  CELL_PREFILL,
  MARK_DONE,
  MARK_FIRST,
  MARK_HIT,
  type EngineStats,
  type Step,
} from "../lib/batching";
import { prefersReducedMotion } from "../lib/motion";

const MIN_LANE_PX = 22;
const MAX_LANES = 36;
const SIM_SPEED = 0.14; /* simulated ms per real ms: slow motion so tokens read */
const PX_PER_MS = 0.46;
const STATS_EVERY_MS = 600;
const SIGNAL: [number, number, number] = [114, 206, 123];

interface BatchFieldProps {
  className?: string;
  onStats?: (stats: EngineStats) => void;
}

/* request rate that keeps the batch ~80% full without queueing — the
   per-slot capacity shrinks as batches grow (longer forward passes) */
function requestsPerSec(slots: number): number {
  return slots * (0.38 - 0.004 * slots);
}

/*
 * The hero "footage": a live continuous-batching timeline. Lanes are batch
 * slots; green bars are prefill, ticks are decoded tokens, hollow squares
 * mark each request's first token. Time flows right to left.
 */
export default function BatchField({ className, onStats }: BatchFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onStatsRef = useRef(onStats);

  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    let engine = new BatchEngine(1, 1, 1);
    let history: Step[] = [];
    let guides: HTMLCanvasElement | null = null;
    let width = 0;
    let height = 0;
    let lanes = 0;
    let lanePx = MIN_LANE_PX;
    let top = 0;
    let simNow = 0;
    let raf = 0;
    let last = 0;
    let lastStats = 0;
    let inView = true;

    const windowMs = () => width / PX_PER_MS;

    const trim = () => {
      const oldest = simNow - windowMs() - 200;
      let drop = 0;
      while (drop < history.length && history[drop].t1 < oldest) drop++;
      if (drop > 0) history = history.slice(drop);
    };

    /* dotted lane guides are static — render them once per resize */
    const paintGuides = (dpr: number) => {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const g = off.getContext("2d");
      if (!g) return null;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "rgba(255, 255, 255, 0.09)";
      for (let s = 0; s < lanes; s++) {
        const y = Math.round(top + s * lanePx);
        for (let x = 0; x < width; x += 7) g.fillRect(x, y, 1, 1);
      }
      return off;
    };

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      lanePx = Math.max(width < 640 ? 26 : MIN_LANE_PX, height / MAX_LANES);
      lanes = Math.max(8, Math.floor(height / lanePx));
      top = (height - (lanes - 1) * lanePx) / 2;

      engine = new BatchEngine(lanes, requestsPerSec(lanes), 11);
      history = [];
      /* warm up so the field is already full on first paint */
      while (engine.clock < windowMs() + 6000) history.push(engine.step());
      simNow = engine.clock;
      trim();
      guides = paintGuides(dpr);
    };

    const xAt = (t: number) => width - (simNow - t) * PX_PER_MS;
    const ageAt = (x: number) => {
      const a = Math.min(1, Math.max(0, x / width));
      return 0.12 + 0.88 * Math.pow(a, 1.4);
    };

    const render = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      if (guides) ctx.drawImage(guides, 0, 0, width, height);

      /* pass 1 — decode ticks, white, brightness per request */
      ctx.fillStyle = "#ffffff";
      for (const st of history) {
        const x1 = xAt(st.t1);
        if (x1 < -4 || x1 > width + 4) continue;
        const age = ageAt(x1);
        for (let s = 0; s < lanes; s++) {
          if (st.kind[s] !== CELL_DECODE) continue;
          ctx.globalAlpha = (st.shade[s] / 255) * age * 0.9;
          ctx.fillRect(x1 - 1.5, top + s * lanePx - 3.5, 1.5, 7);
        }
      }

      /* pass 2 — prefill bars and prefix-cache hits, signal green */
      ctx.fillStyle = `rgb(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]})`;
      for (const st of history) {
        const x0 = xAt(st.t0);
        const x1 = xAt(st.t1);
        if (x1 < -4 || x0 > width + 4) continue;
        const age = ageAt(x1);
        for (let s = 0; s < lanes; s++) {
          if (st.kind[s] !== CELL_PREFILL) continue;
          const y = top + s * lanePx;
          ctx.globalAlpha = 0.8 * age;
          ctx.fillRect(x0, y - 1, Math.max(1, x1 - x0 - 1), 2);
          if (st.mark[s] & MARK_HIT) {
            ctx.beginPath();
            ctx.moveTo(x0, y - 4);
            ctx.lineTo(x0 + 4, y);
            ctx.lineTo(x0, y + 4);
            ctx.lineTo(x0 - 4, y);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      /* pass 3 — keypoints: first token (hollow square), done (ring) */
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      for (const st of history) {
        const x1 = xAt(st.t1);
        if (x1 < -8 || x1 > width + 8) continue;
        const age = ageAt(x1);
        for (let s = 0; s < lanes; s++) {
          const m = st.mark[s];
          if (!m) continue;
          const y = top + s * lanePx;
          ctx.globalAlpha = age;
          if (m & MARK_FIRST) ctx.strokeRect(x1 - 3.5, y - 3.5, 7, 7);
          if (m & MARK_DONE) {
            ctx.beginPath();
            ctx.arc(x1 + 4, y, 2.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const emitStats = () => onStatsRef.current?.(engine.stats());

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(64, now - (last || now));
      last = now;
      simNow += dt * SIM_SPEED;
      while (engine.clock < simNow + 40) history.push(engine.step());
      trim();
      render();
      if (now - lastStats > STATS_EVERY_MS) {
        lastStats = now;
        emitStats();
      }
    };

    setup();
    render();
    emitStats();
    if (!reduced) raf = requestAnimationFrame(loop);

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        setup();
        render();
      });
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
