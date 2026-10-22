"use client";

import { useEffect, useRef } from "react";
import { BatchEngine, SHARED_PREFIX, type Policy } from "../../lib/batching";
import { KvBlockMap, FREE, SHARED } from "../../lib/kvcache";
import { mulberry32, prefersReducedMotion } from "../../lib/motion";
import { fitCanvas } from "../../lib/pixels";

const SLOTS = 12;
const SEED = 21;
/* about this many blocks on screen, at any size: enough to look like memory */
const TARGET_BLOCKS = 880;
/* token capacity of the whole grid, constant across screen sizes */
const TOKEN_CAPACITY = TARGET_BLOCKS * 16;
const SIM_SPEED = 0.25; /* simulated ms per real ms */
const FLASH_MS = 520; /* real ms a newly written block glows */
const FADE_MS = 650; /* real ms a freed block takes to go dark */
const HUD_EVERY_MS = 250;
const STILL_AHEAD_MS = 6000; /* reduced motion: run this far, then draw once */

type Rgb = [number, number, number];
const SURFACE: Rgb = [38, 38, 38];
const INK: Rgb = [241, 241, 239];
const ACCENT: Rgb = [143, 166, 142];

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const css = (c: Rgb) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

const SURFACE_CSS = css(SURFACE);
const ACCENT_CSS = css(ACCENT);
/* request tones are cached; ids only grow, so the cache is trimmed now and then */
const TONE_CACHE_LIMIT = 512;

/* each request gets its own stable grey, between dim and nearly ink */
function requestTone(rid: number): Rgb {
  const h = Math.imul(rid, 2654435761) >>> 0;
  const t = 0.3 + ((h % 1000) / 1000) * 0.55;
  return mix(SURFACE, INK, t);
}

function toneOf(owner: number): Rgb {
  if (owner === FREE) return SURFACE;
  if (owner === SHARED) return ACCENT;
  return requestTone(owner);
}

export interface KvFieldProps {
  policy: Policy;
  requestsPerSec: number;
  /* bump to send a burst of requests */
  burst: number;
  burstSize: number;
  label: string;
}

export default function KvField({ policy, requestsPerSec, burst, burstSize, label }: KvFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BatchEngine | null>(null);
  const redrawRef = useRef<() => void>(() => undefined);
  const throughputRef = useRef<HTMLSpanElement>(null);
  const memoryRef = useRef<HTMLSpanElement>(null);
  const queueRef = useRef<HTMLSpanElement>(null);
  const policyRef = useRef(policy);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const engine = new BatchEngine(SLOTS, requestsPerSec, SEED, policyRef.current);
    engineRef.current = engine;
    let map: KvBlockMap | null = null;
    let cols = 1;
    let cell = 10;
    let offsetX = 0;
    let offsetY = 0;
    let raf = 0;
    let last = 0;
    let lastHud = 0;
    let inView = false;
    /* simulated time is ahead of real time by this factor; colours age in real ms */
    let realNow = 0;
    const toneCss = new Map<number, string>();

    /* the settled colour of a block's owner, without allocating per frame */
    const settledCss = (owner: number): string => {
      if (owner === FREE) return SURFACE_CSS;
      if (owner === SHARED) return ACCENT_CSS;
      let cached = toneCss.get(owner);
      if (!cached) {
        if (toneCss.size > TONE_CACHE_LIMIT) toneCss.clear();
        cached = css(requestTone(owner));
        toneCss.set(owner, cached);
      }
      return cached;
    };

    const layout = () => {
      const { width, height, dpr } = fitCanvas(canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = Math.max(8, Math.sqrt((width * height) / TARGET_BLOCKS));
      cols = Math.max(1, Math.floor(width / cell));
      const rows = Math.max(1, Math.floor(height / cell));
      cell = Math.min(width / cols, height / rows);
      offsetX = (width - cols * cell) / 2;
      offsetY = (height - rows * cell) / 2;
      const blocks = cols * rows;
      map = new KvBlockMap(blocks, Math.max(4, Math.round(TOKEN_CAPACITY / blocks)), SHARED_PREFIX, mulberry32(SEED));
    };

    const advance = (simTarget: number) => {
      if (!map) return;
      while (engine.clock < simTarget) {
        const step = engine.step();
        map.apply(step, realNow, policyRef.current.prefixCache);
      }
    };

    const draw = () => {
      if (!map) return;
      const size = cell - Math.max(1, cell * 0.12);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < map.size; i++) {
        const owner = map.owner[i];
        const age = realNow - map.changedAt[i];
        /* only blocks still glowing or fading need a mixed colour */
        if (owner === FREE && age < FADE_MS) {
          ctx.fillStyle = css(mix(toneOf(map.lastOwner[i]), SURFACE, age / FADE_MS));
        } else if (owner !== FREE && owner !== SHARED && age < FLASH_MS) {
          ctx.fillStyle = css(mix(INK, toneOf(owner), age / FLASH_MS));
        } else {
          ctx.fillStyle = settledCss(owner);
        }
        ctx.fillRect(offsetX + (i % cols) * cell, offsetY + Math.floor(i / cols) * cell, size, size);
      }
    };

    const updateHud = () => {
      const stats = engine.stats();
      if (throughputRef.current) throughputRef.current.textContent = Math.round(stats.tokensPerSec).toLocaleString("en-US");
      if (memoryRef.current) memoryRef.current.textContent = `${Math.round((map?.used() ?? 0) * 100)}%`;
      if (queueRef.current) queueRef.current.textContent = String(stats.queue);
    };

    redrawRef.current = () => {
      if (!reduced) return;
      realNow += STILL_AHEAD_MS;
      advance(engine.clock + STILL_AHEAD_MS * SIM_SPEED * 4);
      realNow += FADE_MS;
      draw();
      updateHud();
    };

    /* the loop runs only while the field is on screen and the tab visible */
    const loop = (now: number) => {
      if (!inView || document.hidden) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - (last || now));
      last = now;
      realNow += dt;
      advance(engine.clock + dt * SIM_SPEED);
      draw();
      if (now - lastHud > HUD_EVERY_MS) {
        lastHud = now;
        updateHud();
      }
    };

    layout();
    /* start from a warmed-up server, not an empty one */
    advance(4000);
    realNow += FADE_MS;
    draw();
    updateHud();
    const start = () => {
      if (reduced || raf || !inView || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      layout();
      advance(engine.clock + 2000);
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
      engineRef.current = null;
    };
    /* the engine lives for the component's lifetime; props reach it below */
  }, []);

  useEffect(() => {
    policyRef.current = policy;
    engineRef.current?.setPolicy(policy);
    redrawRef.current();
  }, [policy]);

  useEffect(() => {
    engineRef.current?.setRate(requestsPerSec);
    redrawRef.current();
  }, [requestsPerSec]);

  useEffect(() => {
    if (burst === 0) return;
    engineRef.current?.inject(burstSize);
    redrawRef.current();
  }, [burst, burstSize]);

  return (
    <figure className="kv">
      <div className="kv__hud t-small" aria-live="off">
        <span>
          <span ref={throughputRef} className="kv__value">
            0
          </span>{" "}
          tokens/s
        </span>
        <span>
          <span ref={memoryRef} className="kv__value">
            0%
          </span>{" "}
          memory in use
        </span>
        <span>
          <span ref={queueRef} className="kv__value">
            0
          </span>{" "}
          waiting
        </span>
      </div>
      <canvas ref={canvasRef} className="kv__canvas" role="img" aria-label={label} />
      <figcaption className="kv__legend t-small">
        <span className="kv__key">
          <i className="kv__swatch kv__swatch--free" aria-hidden="true" />
          Free block of GPU memory
        </span>
        <span className="kv__key">
          <i className="kv__swatch kv__swatch--used" aria-hidden="true" />
          A request&rsquo;s KV cache
        </span>
        <span className="kv__key">
          <i className="kv__swatch kv__swatch--shared" aria-hidden="true" />
          Shared system prompt, cached once
        </span>
      </figcaption>
    </figure>
  );
}
