"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MLP, makeDataset, DATASETS, LAYER_SIZES, type DatasetKind, type Sample } from "../../lib/neural";
import { mulberry32, prefersReducedMotion } from "../../lib/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { drawField, drawGraph, FIELD_GRID, parseHex, type LabColors } from "./labCanvas";

const LEARNING_RATES = [0.01, 0.03, 0.1] as const;
const BATCH_SIZE = 24;
const FRAME_BUDGET_MS = 4; /* training time per frame: speed adapts to the device */
const PARAM_COUNT = 105; /* 2·8+8 + 8·8+8 + 8·1+1 */
const DATASET_SEEDS: Record<DatasetKind, number> = { spiral: 7, moons: 23, rings: 41, xor: 59 };
const FALLBACK: LabColors = { accent: [70, 96, 74], ink: [28, 28, 28], dim: [107, 106, 99] };

interface Stats {
  step: number;
  loss: number;
  acc: number;
}

/* read from the lab itself: its pale field redefines the colour roles */
function readColors(host: Element): LabColors {
  const style = getComputedStyle(host);
  return {
    accent: parseHex(style.getPropertyValue("--accent")) ?? FALLBACK.accent,
    ink: parseHex(style.getPropertyValue("--ink")) ?? FALLBACK.ink,
    dim: parseHex(style.getPropertyValue("--muted")) ?? FALLBACK.dim,
  };
}

/*
 * A 2-8-8-1 network training in the browser: hand-written backprop, a
 * decision field drawn as cells, live weights. Click the field to add points.
 */
export default function NeuralLab() {
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);
  const netRef = useRef<MLP | null>(null);
  const samplesRef = useRef<Sample[]>([]);
  const rngRef = useRef(mulberry32(1));
  const emaLossRef = useRef(0);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const colorsRef = useRef<LabColors>(FALLBACK);
  const inViewRef = useRef(false);
  const pausedRef = useRef(false);
  const lrRef = useRef<number>(0.03);
  const frameRef = useRef(0);
  const reducedRef = useRef(false);
  /* restarts the training loop after a pause, a hidden tab or scrolling away */
  const kickRef = useRef<() => void>(() => undefined);

  const [dataset, setDataset] = useState<DatasetKind>("spiral");
  const [lr, setLr] = useState<number>(0.03);
  const [paused, setPaused] = useState(false);
  const [brush, setBrush] = useState<0 | 1>(0);
  const [stats, setStats] = useState<Stats>({ step: 0, loss: 0, acc: 0 });
  const [announcement, setAnnouncement] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    lrRef.current = lr;
    pausedRef.current = paused;
    kickRef.current();
  }, [lr, paused]);

  const drawAll = useCallback(() => {
    const net = netRef.current;
    if (!net) return;
    if (fieldRef.current && offscreenRef.current) {
      drawField(fieldRef.current, offscreenRef.current, net, samplesRef.current, colorsRef.current);
    }
    if (graphRef.current) {
      const samples = samplesRef.current;
      drawGraph(graphRef.current, net, samples[frameRef.current % Math.max(1, samples.length)], colorsRef.current);
    }
  }, []);

  const train = useCallback((steps: number) => {
    const net = netRef.current;
    if (!net) return;
    for (let i = 0; i < steps; i++) {
      const loss = net.trainStep(samplesRef.current, lrRef.current, BATCH_SIZE, rngRef.current);
      emaLossRef.current = emaLossRef.current === 0 ? loss : emaLossRef.current * 0.94 + loss * 0.06;
    }
  }, []);

  const syncStats = useCallback(() => {
    const net = netRef.current;
    if (net) setStats({ step: net.step, loss: emaLossRef.current, acc: net.accuracy(samplesRef.current) });
  }, []);

  const resetRun = useCallback(
    (kind: DatasetKind) => {
      const seed = DATASET_SEEDS[kind];
      samplesRef.current = makeDataset(kind, 220, seed);
      netRef.current?.reset(seed);
      rngRef.current = mulberry32(seed * 3 + 1);
      emaLossRef.current = 0;
      if (reducedRef.current) train(600);
      drawAll();
      syncStats();
    },
    [drawAll, syncStats, train],
  );

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();
    netRef.current = new MLP(DATASET_SEEDS.spiral);
    samplesRef.current = makeDataset("spiral", 220, DATASET_SEEDS.spiral);
    rngRef.current = mulberry32(DATASET_SEEDS.spiral * 3 + 1);
    const offscreen = document.createElement("canvas");
    offscreen.width = FIELD_GRID;
    offscreen.height = FIELD_GRID;
    offscreenRef.current = offscreen;
    if (rootRef.current) colorsRef.current = readColors(rootRef.current);

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const fit = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    const fitAll = () => {
      fit(fieldRef.current);
      fit(graphRef.current);
      drawAll();
    };
    fitAll();
    const ro = new ResizeObserver(fitAll);
    if (rootRef.current) ro.observe(rootRef.current);
    let alive = true;
    let raf = 0;
    const running = () => alive && inViewRef.current && !pausedRef.current && !document.hidden;
    /* the loop exists only while it has something to do */
    const loop = () => {
      if (!running()) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
      frameRef.current++;
      const t0 = performance.now();
      while (performance.now() - t0 < FRAME_BUDGET_MS) train(2);
      drawAll();
      if (frameRef.current % 18 === 0) syncStats();
    };

    if (reducedRef.current) {
      /* no loop: train in idle chunks until the boundary is learned, then hold it */
      const later = (fn: () => void) =>
        typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => fn()) : window.setTimeout(fn, 80);
      const chunk = () => {
        if (!alive) return;
        train(2000);
        drawAll();
        syncStats();
        const net = netRef.current;
        if (net && net.step < 40000 && net.accuracy(samplesRef.current) < 0.97) later(chunk);
      };
      later(chunk);
    } else {
      kickRef.current = () => {
        if (!raf && running()) raf = requestAnimationFrame(loop);
      };
    }

    const kick = () => kickRef.current();
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry?.isIntersecting ?? false;
      kick();
    });
    if (rootRef.current) io.observe(rootRef.current);
    document.addEventListener("visibilitychange", kick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      kickRef.current = () => undefined;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
    };
  }, [drawAll, syncStats, train]);

  const addSample = (nx: number, ny: number) => {
    samplesRef.current = [...samplesRef.current, { x: nx, y: ny, label: brush }];
    setAnnouncement(
      `${brush === 0 ? "Green" : "Dark"} point added. The network is training on ${samplesRef.current.length} points.`,
    );
    if (reducedRef.current) {
      train(300);
      syncStats();
    }
    drawAll();
  };

  const onFieldClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    addSample(((e.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((e.clientY - rect.top) / rect.height) * 2);
  };

  /* keyboard path: a point near the centre, jittered */
  const onFieldKey = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const rng = rngRef.current;
    addSample(rng() * 1.4 - 0.7, rng() * 1.4 - 0.7);
  };

  const toggleRun = () => {
    if (!reducedRef.current) {
      setPaused((p) => !p);
      return;
    }
    train(600);
    drawAll();
    syncStats();
  };

  return (
    <div ref={rootRef} className="neural">
      <canvas
        ref={fieldRef}
        className="neural__field"
        onClick={onFieldClick}
        onKeyDown={onFieldKey}
        tabIndex={0}
        role="button"
        aria-label="Add a training point. The field shows what the network has learned so far; click a spot, or press Enter to add a point near the centre."
      />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="neural__panel">
        <dl className="neural__stats">
          <div>
            <dt className="t-small">Steps</dt>
            <dd className="t-lead">{stats.step.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt className="t-small">Loss</dt>
            <dd className="t-lead">{stats.loss.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="t-small">Accuracy</dt>
            <dd className="t-lead">{(stats.acc * 100).toFixed(1)}%</dd>
          </div>
        </dl>

        <figure className="neural__graph">
          <canvas ref={graphRef} role="img" aria-label="The network's live weights: thicker lines are larger weights, green ones positive" />
          <figcaption className="t-small">
            {LAYER_SIZES.join("-")} network, {PARAM_COUNT} weights, live
          </figcaption>
        </figure>

        <fieldset className="lever">
          <legend className="lever__label t-small">Data</legend>
          <div className="segments">
            {DATASETS.map((d) => (
              <button
                key={d.kind}
                type="button"
                className="segment"
                aria-pressed={dataset === d.kind}
                onClick={() => {
                  setDataset(d.kind);
                  resetRun(d.kind);
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="lever">
          <legend className="lever__label t-small">Learning rate</legend>
          <div className="segments">
            {LEARNING_RATES.map((rate) => (
              <button key={rate} type="button" className="segment" aria-pressed={lr === rate} onClick={() => setLr(rate)}>
                {rate}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="lever">
          <legend className="lever__label t-small">A click adds</legend>
          <div className="segments">
            <button type="button" className="segment" aria-pressed={brush === 0} onClick={() => setBrush(0)}>
              Green points
            </button>
            <button type="button" className="segment" aria-pressed={brush === 1} onClick={() => setBrush(1)}>
              Dark points
            </button>
          </div>
        </fieldset>

        <div className="neural__actions">
          <button type="button" className="button button--quiet" onClick={toggleRun}>
            {reduced ? "Train 600 steps" : paused ? "Resume" : "Pause"}
          </button>
          <button type="button" className="button button--quiet" onClick={() => resetRun(dataset)}>
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
