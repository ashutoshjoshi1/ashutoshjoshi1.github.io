"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MLP, makeDataset, DATASETS, LAYER_SIZES, type DatasetKind, type Sample } from "../lib/neural";
import { mulberry32, prefersReducedMotion, scrambleTo } from "../lib/motion";

const GRID = 88; /* boundary field resolution — chunky pixels on purpose */
const LEARNING_RATES = [0.01, 0.03, 0.1] as const;
const BATCH_SIZE = 24;
const FRAME_BUDGET_MS = 4; /* training time per frame — speed adapts to the device */
const PARAM_COUNT = 105; /* 2·8+8 + 8·8+8 + 8·1+1 */

const DATASET_SEEDS: Record<DatasetKind, number> = { spiral: 7, moons: 23, rings: 41, xor: 59 };

interface Stats {
  step: number;
  loss: number;
  acc: number;
}

type Rgb = [number, number, number];

/* mirror the :root fallbacks in globals.css */
const FALLBACK: Record<"accent" | "ink" | "dim", Rgb> = {
  accent: [70, 229, 161],
  ink: [242, 244, 250],
  dim: [152, 160, 180],
};

/* handles #rgb, #rrggbb and the rgb()/rgba() strings GSAP writes mid-tween */
function parseColor(raw: string): Rgb | null {
  const s = raw.trim();
  const rgb = s.match(/^rgba?\(([^)]+)\)/);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((v) => parseFloat(v));
    return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) ? [r, g, b] : null;
  }
  if (s.startsWith("#")) {
    const h = s.slice(1);
    if (h.length === 3) {
      return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    }
    if (h.length >= 6) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
  }
  return null;
}

function cssColor(name: string, fallback: Rgb): Rgb {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  return parseColor(raw) ?? fallback;
}

export default function NeuralLab() {
  const sectionRef = useRef<HTMLElement>(null);
  const fieldWrapRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  const netRef = useRef<MLP | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const rngRef = useRef(mulberry32(1));
  const lossHistoryRef = useRef<number[]>([]);
  const emaLossRef = useRef(0);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const inViewRef = useRef(false);
  const pausedRef = useRef(false);
  const lrRef = useRef<number>(0.03);
  const rafRef = useRef(0);
  const frameRef = useRef(0);
  const colorsRef = useRef({ accent: FALLBACK.accent, ink: FALLBACK.ink, dim: FALLBACK.dim });
  const reducedRef = useRef(false);

  const [dataset, setDataset] = useState<DatasetKind>("spiral");
  const [lr, setLr] = useState<number>(0.03);
  const [paused, setPaused] = useState(false);
  const [brush, setBrush] = useState<0 | 1>(0);
  const [stats, setStats] = useState<Stats>({ step: 0, loss: 0, acc: 0 });

  useEffect(() => {
    lrRef.current = lr;
    pausedRef.current = paused;
  }, [lr, paused]);

  /* ------------------------------------------------------------ drawing */

  const drawField = useCallback(() => {
    const canvas = fieldRef.current;
    const net = netRef.current;
    if (!canvas || !net) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    if (w === 0 || h === 0) return;

    let off = offscreenRef.current;
    if (!off) {
      off = document.createElement("canvas");
      off.width = GRID;
      off.height = GRID;
      offscreenRef.current = off;
    }
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    const { accent, ink } = colorsRef.current;
    const img = offCtx.createImageData(GRID, GRID);
    const data = img.data;
    for (let j = 0; j < GRID; j++) {
      const ny = 1 - (2 * (j + 0.5)) / GRID;
      for (let i = 0; i < GRID; i++) {
        const nx = (2 * (i + 0.5)) / GRID - 1;
        const p = net.forward(nx, ny);
        const k = (j * GRID + i) * 4;
        /* p = p(label 1); class A (label 0, accent dots) owns the accent region */
        if (p < 0.5) {
          const a = (0.5 - p) * 2;
          data[k] = accent[0];
          data[k + 1] = accent[1];
          data[k + 2] = accent[2];
          data[k + 3] = Math.round(a * 120);
        } else {
          const a = (p - 0.5) * 2;
          data[k] = ink[0];
          data[k + 1] = ink[1];
          data[k + 2] = ink[2];
          data[k + 3] = Math.round(a * 46);
        }
      }
    }
    offCtx.putImageData(img, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, w, h);

    /* crosshair axes */
    ctx.strokeStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, 0.10)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    /* samples — class A filled accent, class B hollow ink; one path per class */
    const r = Math.max(2.5, w / 220);
    ctx.fillStyle = `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`;
    ctx.beginPath();
    for (const s of samplesRef.current) {
      if (s.label !== 0) continue;
      const px = ((s.x + 1) / 2) * w;
      const py = ((1 - s.y) / 2) * h;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, 0.9)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const s of samplesRef.current) {
      if (s.label !== 1) continue;
      const px = ((s.x + 1) / 2) * w;
      const py = ((1 - s.y) / 2) * h;
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.stroke();
  }, []);

  const drawGraph = useCallback(() => {
    const canvas = graphRef.current;
    const net = netRef.current;
    if (!canvas || !net) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    if (w === 0 || h === 0) return;
    const { accent, ink, dim } = colorsRef.current;

    /* pulse the node brightness with a real training sample, not whatever
       grid cell the field renderer forwarded last */
    const samples = samplesRef.current;
    if (samples.length > 0) {
      const probe = samples[frameRef.current % samples.length];
      net.forward(probe.x, probe.y);
    }

    ctx.clearRect(0, 0, w, h);
    const padX = w * 0.09;
    const padY = h * 0.14;
    const xs = LAYER_SIZES.map((_, l) => padX + (l / (LAYER_SIZES.length - 1)) * (w - padX * 2));
    const nodeY = (l: number, i: number): number => {
      const n = LAYER_SIZES[l];
      if (n === 1) return h / 2;
      return padY + (i / (n - 1)) * (h - padY * 2);
    };

    /* edges — width and glow track |weight|, hue tracks sign */
    for (let l = 0; l < net.weights.length; l++) {
      for (let j = 0; j < net.weights[l].length; j++) {
        for (let i = 0; i < net.weights[l][j].length; i++) {
          const weight = net.weights[l][j][i];
          const mag = Math.min(1, Math.abs(weight) / 2.2);
          if (mag < 0.03) continue;
          ctx.strokeStyle =
            weight > 0
              ? `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.12 + mag * 0.65})`
              : `rgba(${dim[0]}, ${dim[1]}, ${dim[2]}, ${0.10 + mag * 0.45})`;
          ctx.lineWidth = 0.4 + mag * 2.4;
          ctx.beginPath();
          ctx.moveTo(xs[l], nodeY(l, i));
          ctx.lineTo(xs[l + 1], nodeY(l + 1, j));
          ctx.stroke();
        }
      }
    }

    /* nodes — brightness tracks the latest activations */
    for (let l = 0; l < LAYER_SIZES.length; l++) {
      for (let i = 0; i < LAYER_SIZES[l]; i++) {
        const a = Math.min(1, Math.abs(net.activations[l]?.[i] ?? 0));
        const x = xs[l];
        const y = nodeY(l, i);
        ctx.fillStyle = `rgba(${ink[0]}, ${ink[1]}, ${ink[2]}, ${0.18 + a * 0.6})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2.2, w / 130), 0, Math.PI * 2);
        ctx.fill();
        if (a > 0.55) {
          ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${a * 0.8})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(3.6, w / 90), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }, []);

  const drawSpark = useCallback(() => {
    const canvas = sparkRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    if (w === 0 || h === 0) return;
    const { accent } = colorsRef.current;
    const hist = lossHistoryRef.current;
    ctx.clearRect(0, 0, w, h);
    if (hist.length < 2) return;
    const max = Math.max(0.1, ...hist);
    ctx.strokeStyle = `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < hist.length; i++) {
      const x = (i / (hist.length - 1)) * w;
      const y = h - (hist[i] / max) * (h - 3) - 1.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, []);

  const drawAll = useCallback(() => {
    drawField();
    drawGraph();
    drawSpark();
  }, [drawField, drawGraph, drawSpark]);

  /* --------------------------------------------------------- training */

  const trainBurst = useCallback((steps: number) => {
    const net = netRef.current;
    if (!net) return;
    for (let i = 0; i < steps; i++) {
      const loss = net.trainStep(samplesRef.current, lrRef.current, BATCH_SIZE, rngRef.current);
      emaLossRef.current = emaLossRef.current === 0 ? loss : emaLossRef.current * 0.94 + loss * 0.06;
    }
    lossHistoryRef.current.push(emaLossRef.current);
    if (lossHistoryRef.current.length > 160) lossHistoryRef.current.shift();
  }, []);

  const syncStats = useCallback(() => {
    const net = netRef.current;
    if (!net) return;
    setStats({
      step: net.step,
      loss: emaLossRef.current,
      acc: net.accuracy(samplesRef.current),
    });
  }, []);

  const resetRun = useCallback(
    (kind: DatasetKind) => {
      const seed = DATASET_SEEDS[kind];
      samplesRef.current = makeDataset(kind, 220, seed);
      netRef.current?.reset(seed);
      rngRef.current = mulberry32(seed * 3 + 1);
      lossHistoryRef.current = [];
      emaLossRef.current = 0;
      if (reducedRef.current) trainBurst(600);
      /* unconditional — the loop skips drawing while paused or reduced */
      drawAll();
      syncStats();
    },
    [drawAll, syncStats, trainBurst],
  );

  /* one-time setup: net, canvases, observers, loop */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    reducedRef.current = prefersReducedMotion();
    netRef.current = new MLP(DATASET_SEEDS.spiral);
    samplesRef.current = makeDataset("spiral", 220, DATASET_SEEDS.spiral);
    rngRef.current = mulberry32(DATASET_SEEDS.spiral * 3 + 1);

    const refreshColors = () => {
      colorsRef.current = {
        accent: cssColor("--accent", FALLBACK.accent),
        ink: cssColor("--ink", FALLBACK.ink),
        dim: cssColor("--ink-dim", FALLBACK.dim),
      };
    };
    refreshColors();

    /* keep canvas buffers matched to layout size (dpr-aware, capped at 2) */
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const bw = Math.max(1, Math.round(rect.width * dpr));
      const bh = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
    };
    const fitAll = () => {
      fit(fieldRef.current);
      fit(graphRef.current);
      fit(sparkRef.current);
      drawAll();
    };
    fitAll();
    const ro = new ResizeObserver(fitAll);
    if (fieldWrapRef.current) ro.observe(fieldWrapRef.current);

    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: "80px" },
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    let alive = true;
    const loop = () => {
      if (!alive) return;
      rafRef.current = requestAnimationFrame(loop);
      if (!inViewRef.current || pausedRef.current || document.hidden) return;

      frameRef.current++;
      if (frameRef.current % 60 === 0) refreshColors();

      /* train inside a fixed time budget so speed adapts to the machine */
      const t0 = performance.now();
      while (performance.now() - t0 < FRAME_BUDGET_MS) {
        trainBurst(2);
      }
      /* alternate the heavy redraws — field on even frames, graph/spark on odd */
      if (frameRef.current % 2 === 0) {
        drawField();
      } else {
        drawGraph();
        drawSpark();
      }
      if (frameRef.current % 18 === 0) syncStats();
    };

    if (reducedRef.current) {
      /* no animation loop — train in idle-time chunks until the boundary is
         actually learned, then leave the converged snapshot on screen */
      const runIdle = (fn: () => void) =>
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(() => fn())
          : window.setTimeout(fn, 80);
      const trainChunk = () => {
        if (!alive) return;
        trainBurst(2000);
        drawAll();
        syncStats();
        const net = netRef.current;
        if (net && net.step < 40000 && net.accuracy(samplesRef.current) < 0.97) {
          runIdle(trainChunk);
        }
      };
      runIdle(trainChunk);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    /* header reveal, consistent with the other sections */
    const ctx = gsap.context(() => {
      if (reducedRef.current) return;
      gsap.from("[data-lab-reveal]", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      ctx.revert();
    };
  }, []);

  /* ------------------------------------------------------ interactions */

  const onDatasetPick = (kind: DatasetKind) => {
    setDataset(kind);
    resetRun(kind);
  };

  const addSample = (nx: number, ny: number) => {
    samplesRef.current = [...samplesRef.current, { x: nx, y: ny, label: brush }];
    if (reducedRef.current) {
      trainBurst(300);
      syncStats();
    }
    drawAll();
  };

  const onFieldClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = fieldRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    addSample(nx, ny);
  };

  /* keyboard path for point-dropping — a jittered spot near the center */
  const onFieldKey = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const rng = rngRef.current;
    addSample(rng() * 1.4 - 0.7, rng() * 1.4 - 0.7);
  };

  const onChipHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion()) return;
    const el = e.currentTarget;
    scrambleTo(el, el.dataset.label ?? el.textContent ?? "", 360);
  };

  const chip = (active: boolean) =>
    `border px-3 py-2 font-mono-ui transition-colors duration-300 ${
      active
        ? "border-[var(--accent)] text-accent"
        : "border-[var(--line)] text-dim hover:border-[var(--accent)] hover:text-accent"
    }`;

  return (
    <section id="lab" ref={sectionRef} aria-labelledby="lab-heading" className="py-[var(--section)]">
      <div className="gutter mb-14">
        <p data-lab-reveal className="font-mono-ui text-dim mb-6">
          <span className="text-accent">(04)</span> — Lab / Live training run
        </p>
        <h2
          id="lab-heading"
          data-lab-reveal
          className="leading-[0.92] tracking-tight"
          style={{ fontSize: "var(--text-title)" }}
        >
          <span className="font-sans font-medium uppercase">Watch it</span>{" "}
          <span className="font-display italic text-accent">learn.</span>
        </h2>
        <p data-lab-reveal className="mt-8 max-w-xl text-base leading-relaxed text-dim sm:text-lg">
          A {LAYER_SIZES.join("·")} multilayer perceptron training in your browser right now —
          backprop <em className="font-display italic text-ink">hand-rolled in ~200 lines of TypeScript</em>.
          No PyTorch, no WebGL, no API calls. Click the field to drop new points; it adapts live.
        </p>
      </div>

      <div className="gutter grid grid-cols-1 gap-4 lg:grid-cols-12" data-lab-reveal>
        {/* decision field */}
        <div className="border border-[var(--line)] lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
            <span className="font-mono-ui text-dim">Decision field — f: ℝ² → [0, 1]</span>
            <span className="font-mono-ui text-accent hidden sm:inline">● live</span>
          </div>
          <div ref={fieldWrapRef} className="relative aspect-square w-full">
            <canvas
              ref={fieldRef}
              onClick={onFieldClick}
              onKeyDown={onFieldKey}
              tabIndex={0}
              role="img"
              aria-label="Interactive decision boundary of a small neural network training live. Click, or focus and press Enter, to add data points."
              className="absolute inset-0 h-full w-full cursor-crosshair focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--accent)]"
            />
            <p className="font-mono-ui text-dim pointer-events-none absolute bottom-3 left-4">
              click to drop <span className="text-accent">{brush === 0 ? "class a" : "class b"}</span>
            </p>
          </div>
        </div>

        {/* instrument column */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* topology */}
          <div className="border border-[var(--line)]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
              <span className="font-mono-ui text-dim">Topology {LAYER_SIZES.join("-")}</span>
              <span className="font-mono-ui text-dim">{PARAM_COUNT} params</span>
            </div>
            <div className="h-44 w-full sm:h-52">
              <canvas
                ref={graphRef}
                role="img"
                aria-label="Live diagram of the network's weights and activations"
                className="h-full w-full"
              />
            </div>
          </div>

          {/* telemetry */}
          <div className="border border-[var(--line)]">
            <div className="grid grid-cols-3 divide-x divide-[var(--line)] border-b border-[var(--line)]">
              <div className="px-4 py-3">
                <p className="font-mono-ui text-dim">Step</p>
                <p className="mt-1 font-sans text-xl font-medium tabular-nums sm:text-2xl">
                  {String(stats.step).padStart(6, "0")}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="font-mono-ui text-dim">Loss</p>
                <p className="mt-1 font-sans text-xl font-medium tabular-nums text-accent sm:text-2xl">
                  {stats.loss.toFixed(4)}
                </p>
              </div>
              <div className="px-4 py-3">
                <p className="font-mono-ui text-dim">Acc</p>
                <p className="mt-1 font-sans text-xl font-medium tabular-nums sm:text-2xl">
                  {(stats.acc * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-14 w-full px-2 py-1.5">
              <canvas ref={sparkRef} aria-hidden="true" className="h-full w-full" />
            </div>
          </div>

          {/* controls */}
          <div className="border border-[var(--line)] px-4 py-4">
            <p className="font-mono-ui text-dim mb-3">Dataset</p>
            <div className="flex flex-wrap gap-2">
              {DATASETS.map((d) => (
                <button
                  key={d.kind}
                  onClick={() => onDatasetPick(d.kind)}
                  onMouseEnter={onChipHover}
                  data-label={d.label.toUpperCase()}
                  data-cursor="hover"
                  aria-pressed={dataset === d.kind}
                  className={chip(dataset === d.kind)}
                >
                  {d.label.toUpperCase()}
                </button>
              ))}
            </div>

            <p className="font-mono-ui text-dim mb-3 mt-5">Learning rate</p>
            <div className="flex flex-wrap gap-2">
              {LEARNING_RATES.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setLr(rate)}
                  data-cursor="hover"
                  aria-pressed={lr === rate}
                  className={chip(lr === rate)}
                >
                  {rate}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono-ui text-dim mb-3">Drop points</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBrush(0)}
                    data-cursor="hover"
                    aria-pressed={brush === 0}
                    className={chip(brush === 0)}
                  >
                    + CLASS A
                  </button>
                  <button
                    onClick={() => setBrush(1)}
                    data-cursor="hover"
                    aria-pressed={brush === 1}
                    className={chip(brush === 1)}
                  >
                    + CLASS B
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (reducedRef.current) {
                      trainBurst(600);
                      drawAll();
                      syncStats();
                    } else {
                      setPaused((p) => !p);
                    }
                  }}
                  data-cursor="hover"
                  className={chip(false)}
                >
                  {reducedRef.current ? "TRAIN" : paused ? "RUN" : "PAUSE"}
                </button>
                <button onClick={() => resetRun(dataset)} data-cursor="hover" className={chip(false)}>
                  RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
