"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  BatchEngine,
  CELL_BLOCKED,
  CELL_DECODE,
  CELL_PREFILL,
  CELL_STALL,
  MARK_HIT,
  type EngineStats,
  type Policy,
  type Step,
} from "../../lib/batching";
import { fitCanvas } from "../../lib/canvas";
import { prefersReducedMotion } from "../../lib/motion";
import { BURST_SIZE } from "../split/ServerContext";

const SLOTS = 12;
const SEED = 21;
/* simulated milliseconds across the chart, and how fast they pass */
const WINDOW_MS = 3200;
const SIM_SPEED = 0.3;
/* a tab that stalls for a while does not leap ahead when it wakes */
const MAX_FRAME_MS = 64;
const STATS_EVERY_MS = 250;
/* the column right of "now" where waiting requests stack up */
const QUEUE_GUTTER = 30;
const QUEUE_BAR = { width: 16, height: 3, gap: 2 };
const CACHE_MARK_PX = 4;

const COLORS = {
  track: "#121212",
  blocked: "#353431",
  prefill: "#ecebe6",
  token: "#c9c7c0",
  stall: "#6b6964",
  cached: "#f2b330",
  queue: "#a19e96",
};

export function describeStats(stats: EngineStats): string {
  const tokens = Math.round(stats.tokensPerSec).toLocaleString("en-US");
  const ttft = (stats.ttftP99 / 1000).toFixed(2);
  return `${tokens} tokens a second · ${stats.queue} waiting · first token P99 ${ttft} s`;
}

interface ServerViewProps {
  policy: Policy;
  /* requests a second */
  load: number;
  /* bumped once per burst of requests */
  burst: number;
  /* this view is the one on show (the stage's current layer) */
  active: boolean;
  label: string;
  /* where the live figures are written, a few times a second */
  statsRef: RefObject<HTMLSpanElement | null>;
}

/*
 * The simulated server as a strip chart. Each of the twelve lanes is a batch
 * slot; time runs right to left, the newest pass at the right edge. A prompt
 * being read is a solid block, each generated token a tick, a slot that sits
 * empty while requests wait a grey band, a sequence stalled behind someone
 * else's prompt a thin line, and a prompt that starts from the prefix cache
 * a gold mark. Waiting requests stack up to the right of now.
 */
export default function ServerView({ policy, load, burst, active, label, statsRef }: ServerViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BatchEngine | null>(null);
  const policyRef = useRef(policy);
  const loadRef = useRef(load);
  const activeRef = useRef(active);
  /* bursts sent before this view existed are not replayed into it */
  const burstRef = useRef(burst);
  /* restart the loop (or redraw the still) after a change from outside */
  const wakeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const engine = new BatchEngine(SLOTS, loadRef.current, SEED, policyRef.current);
    engineRef.current = engine;
    const history: Step[] = [];
    let size = { width: 1, height: 1, dpr: 1 };
    let raf = 0;
    let last = 0;
    let lastStats = -Infinity;
    let queue = 0;
    let inView = false;

    const advance = (simMs: number) => {
      const target = engine.clock + simMs;
      while (engine.clock < target) history.push(engine.step());
      const horizon = engine.clock - WINDOW_MS;
      let drop = 0;
      while (drop < history.length && history[drop].t1 < horizon) drop++;
      if (drop) history.splice(0, drop);
    };

    const writeStats = () => {
      const stats = engine.stats();
      queue = stats.queue;
      if (statsRef.current) statsRef.current.textContent = describeStats(stats);
    };

    const draw = () => {
      const { width, height, dpr } = size;
      const snap = (x: number) => Math.round(x * dpr) / dpr;
      const hair = 1 / dpr;
      const chartW = width - QUEUE_GUTTER;
      const lane = height / SLOTS;
      const bar = Math.max(4, Math.round(lane * 0.62));
      const pad = (lane - bar) / 2;
      const tickW = Math.max(hair, Math.round(1.25 * dpr) / dpr);
      const tickH = Math.round(bar * 0.7);
      const scale = chartW / WINDOW_MS;
      const now = engine.clock;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLORS.track;
      for (let s = 0; s < SLOTS; s++) ctx.fillRect(0, snap(s * lane + pad), chartW, bar);

      /* one pass per colour, each a single path: no allocations per frame */
      const pass = (color: string, add: (x0: number, w: number, y: number, s: number, step: Step) => void) => {
        ctx.beginPath();
        for (const step of history) {
          const x0 = Math.max(0, snap(chartW - (now - step.t0) * scale));
          const x1 = snap(chartW - (now - step.t1) * scale);
          if (x1 <= 0) continue;
          const w = Math.max(hair, x1 - x0);
          for (let s = 0; s < SLOTS; s++) add(x0, w, snap(s * lane + pad), s, step);
        }
        ctx.fillStyle = color;
        ctx.fill();
      };
      pass(COLORS.blocked, (x0, w, y, s, step) => {
        if (step.kind[s] === CELL_BLOCKED) ctx.rect(x0, y, w, bar);
      });
      pass(COLORS.stall, (x0, w, y, s, step) => {
        if (step.kind[s] === CELL_STALL) ctx.rect(x0, y + Math.floor(bar / 2), w, hair * 2);
      });
      pass(COLORS.token, (x0, w, y, s, step) => {
        if (step.kind[s] !== CELL_DECODE) return;
        const n = step.tokens[s];
        for (let k = 0; k < n; k++) ctx.rect(snap(x0 + ((k + 0.5) * w) / n - tickW / 2), y + (bar - tickH) / 2, tickW, tickH);
      });
      pass(COLORS.prefill, (x0, w, y, s, step) => {
        if (step.kind[s] === CELL_PREFILL) ctx.rect(x0, y, w, bar);
      });
      pass(COLORS.cached, (x0, w, y, s, step) => {
        if (step.kind[s] === CELL_PREFILL && step.mark[s] & MARK_HIT) ctx.rect(x0, y, Math.min(w, CACHE_MARK_PX), bar);
      });

      /* the waiting requests, stacked from the bottom right of now */
      const step = QUEUE_BAR.height + QUEUE_BAR.gap;
      const shown = Math.min(queue, Math.floor(height / step));
      ctx.fillStyle = COLORS.queue;
      for (let i = 0; i < shown; i++) {
        ctx.fillRect(width - QUEUE_BAR.width, snap(height - (i + 1) * step + QUEUE_BAR.gap), QUEUE_BAR.width, QUEUE_BAR.height);
      }
    };

    const shouldRun = () => inView && activeRef.current && !document.hidden;

    const frame = (t: number) => {
      raf = 0;
      if (!shouldRun()) {
        last = 0;
        return;
      }
      const dt = last ? Math.min(MAX_FRAME_MS, t - last) : 16;
      last = t;
      advance(dt * SIM_SPEED);
      if (t - lastStats > STATS_EVERY_MS) {
        lastStats = t;
        writeStats();
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    /* reduced motion: run a stretch of traffic, then hold one still frame */
    const still = () => {
      advance(WINDOW_MS);
      writeStats();
      draw();
    };

    const wake = () => {
      if (reduced) {
        if (inView) still();
      }
      else if (!raf && shouldRun()) raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const resize = () => {
      size = fitCanvas(canvas);
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
      draw();
    };

    /* the first time the view is seen it arrives with the chart already
       full; a view that is never shown (the phone's or the desk's twin)
       never simulates at all */
    let primed = false;
    const prime = () => {
      if (primed) return;
      primed = true;
      advance(WINDOW_MS);
      writeStats();
      draw();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      if (inView) prime();
      wake();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", wake);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      wakeRef.current = () => undefined;
      engineRef.current = null;
    };
  }, [statsRef]);

  useEffect(() => {
    policyRef.current = policy;
    engineRef.current?.setPolicy(policy);
    wakeRef.current();
  }, [policy]);

  useEffect(() => {
    loadRef.current = load;
    engineRef.current?.setRate(load);
    wakeRef.current();
  }, [load]);

  useEffect(() => {
    /* only a new burst counts, never one sent before this view existed */
    const isNew = burst > burstRef.current;
    burstRef.current = burst;
    if (!isNew) return;
    engineRef.current?.inject(BURST_SIZE);
    wakeRef.current();
  }, [burst]);

  useEffect(() => {
    activeRef.current = active;
    wakeRef.current();
  }, [active]);

  return <canvas ref={canvasRef} className="server__canvas" role="img" aria-label={label} />;
}
