"use client";

import { useEffect, useRef } from "react";
import { BatchEngine, type EngineStats, type Step } from "../lib/batching";
import { drawTimeline } from "../lib/timeline";
import { prefersReducedMotion } from "../lib/motion";

const MIN_LANE_PX = 22;
const MAX_LANES = 36;
const SIM_SPEED = 0.14; /* simulated ms per real ms: slow motion so tokens read */
const PX_PER_MS = 0.46;
const STATS_EVERY_MS = 600;
const HOVER_BURST = 3;
const CLICK_BURST = 10;
const BURST_COOLDOWN_MS = 450;
const RIPPLE_MS = 900;

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
 * mark each request's first token. Time flows right to left. Moving the
 * cursor over it sends bursts of traffic the batch has to absorb.
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
    let ripples: { x: number; y: number; at: number; big: boolean }[] = [];
    let width = 0;
    let height = 0;
    let lanes = 0;
    let lanePx = MIN_LANE_PX;
    let top = 0;
    let simNow = 0;
    let raf = 0;
    let last = 0;
    let lastStats = 0;
    let lastBurst = 0;
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

    const render = (now: number) => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      if (guides) ctx.drawImage(guides, 0, 0, width, height);
      drawTimeline(ctx, history, {
        left: 0,
        right: width,
        top,
        lanePx,
        lanes,
        nowMs: simNow,
        pxPerMs: PX_PER_MS,
        fade: true,
        showWaste: false,
      });

      /* cursor ripples: where traffic was injected */
      ripples = ripples.filter((r) => now - r.at < RIPPLE_MS);
      ctx.strokeStyle = "#72ce7b";
      ctx.lineWidth = 1.2;
      for (const r of ripples) {
        const p = (now - r.at) / RIPPLE_MS;
        ctx.globalAlpha = (1 - p) * 0.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, (r.big ? 14 : 8) + p * (r.big ? 90 : 46), 0, Math.PI * 2);
        ctx.stroke();
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
      render(now);
      if (now - lastStats > STATS_EVERY_MS) {
        lastStats = now;
        emitStats();
      }
    };

    /* traffic bursts follow the cursor (hover) or a tap/click */
    const burst = (clientX: number, clientY: number, big: boolean) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const now = performance.now();
      if (!big && now - lastBurst < BURST_COOLDOWN_MS) return;
      lastBurst = now;
      engine.inject(big ? CLICK_BURST : HOVER_BURST);
      ripples.push({ x, y, at: now, big });
      lastStats = 0; /* refresh the readout right away */
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") burst(e.clientX, e.clientY, false);
    };
    const onDown = (e: PointerEvent) => burst(e.clientX, e.clientY, true);

    setup();
    render(performance.now());
    emitStats();
    if (!reduced) {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        setup();
        render(performance.now());
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
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
