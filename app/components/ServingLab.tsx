"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import SectionIntro from "./SectionIntro";
import { BatchEngine, BASELINE_POLICY, simulate, type Policy, type Step } from "../lib/batching";
import { drawTimeline, type TimelineMarker } from "../lib/timeline";
import { prefersReducedMotion } from "../lib/motion";

const SLOTS = 12;
const SEED = 21;
const SATURATING_RPS = 12; /* well past capacity: throughput = capacity */
const SIM_SPEED = 0.25; /* simulated ms per real ms */
const GUTTER = 44; /* lane-label column */
const PAD_TOP = 20; /* room for marker labels */
const PAD_BOTTOM = 10;
const BURST = 16;
const TUNE_STEP_MS = 1800;
const SMOOTH_ITL_MS = 45;

const LOADS = [
  { id: "low", label: "Low", rps: 2.4 },
  { id: "medium", label: "Medium", rps: 3.6 },
  { id: "high", label: "High", rps: 4.4 },
] as const;
type LoadId = (typeof LOADS)[number]["id"];

interface Control {
  key: keyof Policy;
  label: string;
  off: string;
  on: string;
  hint: string;
  marker: string;
}

const CONTROLS: Control[] = [
  { key: "continuous", label: "Batching", off: "Static", on: "Continuous", hint: "Refill a slot the moment its request finishes.", marker: "continuous" },
  { key: "chunkedPrefill", label: "Prefill", off: "Whole", on: "Chunked", hint: "Split prompts so decodes never stall behind them.", marker: "chunked" },
  { key: "prefixCache", label: "Prefix cache", off: "Off", on: "On", hint: "Reuse the shared system prompt's KV cache.", marker: "prefix cache" },
  { key: "speculative", label: "Speculative decoding", off: "Off", on: "On", hint: "Draft three tokens, verify them in one pass.", marker: "speculative" },
  { key: "fp8", label: "Weights", off: "FP16", on: "FP8", hint: "Half the bytes streamed every pass.", marker: "fp8" },
];

interface LabMetrics {
  capacity: number;
  capacityX: number;
  ttftP99: number;
  ttftCut: number;
  itlP99: number;
  costCut: number;
}

/* baseline runs are shared across every policy at a given load */
const baselineCache = new Map<number, ReturnType<typeof simulate>>();
function baselineAt(rps: number) {
  const hit = baselineCache.get(rps);
  if (hit) return hit;
  const run = simulate(BASELINE_POLICY, SLOTS, rps, SEED);
  baselineCache.set(rps, run);
  return run;
}

function measure(policy: Policy, rps: number): LabMetrics {
  const capacity = simulate(policy, SLOTS, SATURATING_RPS, SEED).throughput;
  const baseCapacity = baselineAt(SATURATING_RPS).throughput;
  const atLoad = simulate(policy, SLOTS, rps, SEED);
  const base = baselineAt(rps);
  return {
    capacity,
    capacityX: capacity / baseCapacity,
    ttftP99: atLoad.ttftP99,
    ttftCut: 1 - atLoad.ttftP99 / base.ttftP99,
    itlP99: atLoad.itlP99,
    costCut: 1 - baseCapacity / capacity,
  };
}

const fmtTokens = (v: number) => `${Math.round(v).toLocaleString("en-US")}`;
const fmtTimes = (v: number) => `${v.toFixed(2)}×`;
const fmtMs = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
/* near-total cuts keep a decimal so 99.5% never reads as "100%" */
const fmtPct = (v: number) => (v > 0.99 && v < 1 ? `${(Math.floor(v * 1000) / 10).toFixed(1)}%` : `${Math.round(v * 100)}%`);

/* a number that glides to its new value instead of jumping */
function Readout({ value, format }: { value: number; format: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      shown.current = value;
      return;
    }
    const proxy = { v: shown.current };
    const tween = gsap.to(proxy, {
      v: value,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => {
        el.textContent = format(proxy.v);
        shown.current = proxy.v;
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, format]);

  return <span ref={ref}>{format(value)}</span>;
}

export default function ServingLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<BatchEngine | null>(null);
  const markersRef = useRef<TimelineMarker[]>([]);
  const simNowRef = useRef(0);
  const redrawRef = useRef<() => void>(() => undefined);
  const tuneTimers = useRef<number[]>([]);
  const stepRef = useRef<HTMLSpanElement>(null);
  const batchRef = useRef<HTMLSpanElement>(null);
  const queueRef = useRef<HTMLSpanElement>(null);

  const [policy, setPolicy] = useState<Policy>(BASELINE_POLICY);
  const [loadId, setLoadId] = useState<LoadId>("medium");
  const [tuning, setTuning] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const rps = LOADS.find((l) => l.id === loadId)?.rps ?? 3.6;
  const metrics = useMemo(() => measure(policy, rps), [policy, rps]);
  const isBaseline = CONTROLS.every((c) => !policy[c.key]);

  /* the live engine + canvas loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const engine = new BatchEngine(SLOTS, LOADS[1].rps, SEED, BASELINE_POLICY);
    engineRef.current = engine;
    let history: Step[] = [];
    let width = 0;
    let height = 0;
    let lanePx = 20;
    let windowMs = 4200;
    let raf = 0;
    let last = 0;
    let lastHud = 0;
    let inView = false;
    const monoFamily = getComputedStyle(document.body).getPropertyValue("--font-mono").trim() || "ui-monospace";
    const markerFont = `10px ${monoFamily}, ui-monospace, monospace`;

    const advanceTo = (target: number) => {
      while (engine.clock < target + 40) history.push(engine.step());
      const oldest = target - windowMs - 300;
      let drop = 0;
      while (drop < history.length && history[drop].t1 < oldest) drop++;
      if (drop > 0) history = history.slice(drop);
      markersRef.current = markersRef.current.filter((m) => m.t > oldest);
    };

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lanePx = (height - PAD_TOP - PAD_BOTTOM) / SLOTS;
      windowMs = width < 640 ? 2600 : 4200;
    };

    const render = () => {
      const right = width - 10;
      const top = PAD_TOP + lanePx / 2;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);

      /* lane guides + labels */
      ctx.font = markerFont;
      ctx.textBaseline = "middle";
      for (let s = 0; s < SLOTS; s++) {
        const y = Math.round(top + s * lanePx);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(GUTTER, y, right - GUTTER, 1);
        ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
        ctx.fillText(`S${String(s + 1).padStart(2, "0")}`, 12, y);
      }
      ctx.textBaseline = "alphabetic";

      drawTimeline(ctx, history, {
        left: GUTTER,
        right,
        top,
        lanePx,
        lanes: SLOTS,
        nowMs: simNowRef.current,
        pxPerMs: (right - GUTTER) / windowMs,
        fade: false,
        showWaste: true,
        markers: markersRef.current,
        markerFont,
      });

      /* "now" edge */
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillRect(right, PAD_TOP - 4, 1, height - PAD_TOP - PAD_BOTTOM + 8);
    };

    const updateHud = () => {
      const stats = engine.stats();
      if (stepRef.current) stepRef.current.textContent = stats.steps.toLocaleString("en-US");
      if (batchRef.current) batchRef.current.textContent = `${stats.busy}/${stats.slots}`;
      if (queueRef.current) queueRef.current.textContent = String(stats.queue);
    };

    /* reduced motion: jump the simulation forward and draw a still */
    redrawRef.current = () => {
      if (!reduced) return;
      simNowRef.current = engine.clock + windowMs * 0.9;
      advanceTo(simNowRef.current);
      render();
      updateHud();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!inView || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min(64, now - (last || now));
      last = now;
      simNowRef.current += dt * SIM_SPEED;
      advanceTo(simNowRef.current);
      render();
      if (now - lastHud > 250) {
        lastHud = now;
        updateHud();
      }
    };

    setup();
    simNowRef.current = windowMs + 2000;
    advanceTo(simNowRef.current);
    render();
    updateHud();
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      setup();
      render();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setRate(rps);
  }, [rps]);

  const clearTuning = useCallback(() => {
    tuneTimers.current.forEach((id) => window.clearTimeout(id));
    tuneTimers.current = [];
    setTuning(false);
  }, []);

  useEffect(() => clearTuning, [clearTuning]);

  /* switch the running engine in place, so the change is visible mid-stream */
  const apply = useCallback((next: Policy, label: string) => {
    const engine = engineRef.current;
    if (engine) {
      engine.setPolicy(next);
      markersRef.current = [...markersRef.current, { t: engine.clock, label }];
    }
    setPolicy(next);
    const m = measure(next, rps);
    setAnnouncement(
      `${label}. Capacity ${fmtTokens(m.capacity)} tokens per second, ${m.capacityX.toFixed(2)} times baseline. P99 time to first token ${fmtMs(m.ttftP99)}.`,
    );
    redrawRef.current();
  }, [rps]);

  const toggle = (control: Control, on: boolean) => {
    clearTuning();
    const engine = engineRef.current;
    const current = engine?.policy ?? policy;
    if (current[control.key] === on) return;
    apply({ ...current, [control.key]: on }, `${on ? "+" : "−"} ${control.marker}`);
  };

  const tuneIt = () => {
    clearTuning();
    const pending = CONTROLS.filter((c) => !(engineRef.current?.policy ?? policy)[c.key]);
    if (pending.length === 0) return;
    setTuning(true);
    const delay = prefersReducedMotion() ? 0 : TUNE_STEP_MS;
    pending.forEach((control, i) => {
      const id = window.setTimeout(() => {
        const current = engineRef.current?.policy ?? BASELINE_POLICY;
        apply({ ...current, [control.key]: true }, `+ ${control.marker}`);
        if (i === pending.length - 1) setTuning(false);
      }, i * delay);
      tuneTimers.current.push(id);
    });
  };

  const backToBaseline = () => {
    clearTuning();
    apply(BASELINE_POLICY, "baseline");
  };

  const sendBurst = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.inject(BURST);
    markersRef.current = [...markersRef.current, { t: engine.clock, label: `burst +${BURST}` }];
    redrawRef.current();
  };

  const segment = (active: boolean) =>
    `rounded-[5px] px-3 py-1.5 text-[0.85rem] transition-colors duration-300 ${
      active ? "bg-[var(--ink)] text-[var(--on-ink)]" : "text-dim hover:text-ink"
    }`;

  const itlSmooth = metrics.itlP99 <= SMOOTH_ITL_MS;

  return (
    <section
      id="serving-lab"
      aria-labelledby="serving-lab-heading"
      data-nav="dark"
      className="theme-dark relative bg-black pb-[var(--section)] pt-[calc(var(--section)*0.4)]"
    >
      <SectionIntro
        id="serving-lab-heading"
        eyebrow="Serving lab · interactive"
        lines={["Run the server yourself."]}
        lead="A toy LLM server simulated one forward pass at a time: twelve batch slots, requests arriving at random. Flip the same levers I tune in production and watch the batch fill, stall and recover."
        className="gutter mb-12 max-w-3xl"
      />

      <div className="frame-x">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-[var(--card)]">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
            <span className="font-mono-ui text-dim">Toy LLM server · {SLOTS} batch slots · simulated</span>
            <span className="font-mono-ui flex items-center gap-2.5 tabular-nums text-dim">
              <span className="status-dot" aria-hidden="true" />
              step <span ref={stepRef}>0</span> · batch <span ref={batchRef}>0/{SLOTS}</span> · queue{" "}
              <span ref={queueRef}>0</span>
            </span>
          </div>

          {/* timeline */}
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Live timeline of twelve batch slots. Green bars are prefill, white ticks are decoded tokens, amber lines are stalled slots and dotted lines are slots left empty while requests wait."
            className="block h-[244px] w-full sm:h-[292px]"
          />

          {/* legend */}
          <ul className="font-mono-ui flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-5 py-3 text-faint">
            <li className="flex items-center gap-2"><span className="h-[2px] w-5 bg-signal" />Prefill</li>
            <li className="flex items-center gap-2"><span className="flex gap-[2px]"><span className="h-3 w-[1.5px] bg-white" /><span className="h-3 w-[1.5px] bg-white" /></span>Decoded tokens</li>
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 border border-white" />First token</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rotate-45 bg-signal" />Prefix-cache hit</li>
            <li className="flex items-center gap-2"><span className="h-[2px] w-5 bg-[#e8a25c]" />Stalled</li>
            <li className="flex items-center gap-2"><span className="w-5 border-t border-dotted border-white/50" />Empty while requests wait</li>
          </ul>

          {/* metrics */}
          <dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
            <div className="border-line p-5 sm:p-6">
              <dt className="eyebrow">Capacity</dt>
              <dd className="mt-3 text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] leading-none tabular-nums tracking-[-0.02em]">
                <Readout value={metrics.capacity} format={fmtTokens} />
                <span className="ml-1.5 text-[0.95rem] text-dim">tok/s</span>
              </dd>
              <p className="mt-2 text-sm text-dim">
                {isBaseline ? "Baseline" : <><Readout value={metrics.capacityX} format={fmtTimes} /> baseline</>}
              </p>
            </div>
            <div className="border-l border-line p-5 sm:p-6">
              <dt className="eyebrow">P99 time to first token</dt>
              <dd className="mt-3 text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] leading-none tabular-nums tracking-[-0.02em]">
                <Readout value={metrics.ttftP99} format={fmtMs} />
              </dd>
              <p className="mt-2 text-sm text-dim">
                {isBaseline ? "Baseline" : <>−<Readout value={metrics.ttftCut} format={fmtPct} /> vs baseline</>}
              </p>
            </div>
            <div className="border-t border-line p-5 sm:p-6 lg:border-l lg:border-t-0">
              <dt className="eyebrow">P99 inter-token latency</dt>
              <dd className="mt-3 text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] leading-none tabular-nums tracking-[-0.02em]">
                <Readout value={metrics.itlP99} format={fmtMs} />
              </dd>
              <p className={`mt-2 text-sm ${itlSmooth ? "text-dim" : "text-[#e8a25c]"}`}>
                {itlSmooth ? "Smooth stream" : "Stream stutters behind prefill"}
              </p>
            </div>
            <div className="border-l border-t border-line p-5 sm:p-6 lg:border-t-0">
              <dt className="eyebrow">Cost per token</dt>
              <dd className="mt-3 text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] leading-none tabular-nums tracking-[-0.02em]">
                {isBaseline ? "1.00×" : <>−<Readout value={metrics.costCut} format={fmtPct} /></>}
              </dd>
              <p className="mt-2 text-sm text-dim">vs baseline, at saturation</p>
            </div>
          </dl>

          {/* controls */}
          <div className="grid gap-x-8 gap-y-6 border-t border-line px-5 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-6">
            {CONTROLS.map((control) => (
              <fieldset key={control.key} className="min-w-0">
                <legend className="eyebrow mb-3">{control.label}</legend>
                <div className="inline-flex rounded-[7px] border border-line p-0.5">
                  <button type="button" aria-pressed={!policy[control.key]} onClick={() => toggle(control, false)} className={segment(!policy[control.key])}>
                    {control.off}
                  </button>
                  <button type="button" aria-pressed={policy[control.key]} onClick={() => toggle(control, true)} className={segment(policy[control.key])}>
                    {control.on}
                  </button>
                </div>
                <p className="mt-2 text-[0.8rem] leading-snug text-faint">{control.hint}</p>
              </fieldset>
            ))}
            <fieldset className="min-w-0">
              <legend className="eyebrow mb-3">Load</legend>
              <div className="inline-flex rounded-[7px] border border-line p-0.5">
                {LOADS.map((load) => (
                  <button key={load.id} type="button" aria-pressed={loadId === load.id} onClick={() => setLoadId(load.id)} className={segment(loadId === load.id)}>
                    {load.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[0.8rem] leading-snug text-faint">{rps} requests per second.</p>
            </fieldset>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4 sm:px-6">
            <button type="button" onClick={tuneIt} disabled={tuning} className="btn btn-forest btn-sm disabled:opacity-60">
              <span className="btn-label">{tuning ? "Tuning…" : "Tune it for me"}</span>
            </button>
            <button type="button" onClick={backToBaseline} className="btn btn-ghost btn-sm">
              <span className="btn-label">Back to baseline</span>
            </button>
            <button type="button" onClick={sendBurst} className="btn btn-ghost btn-sm">
              <span className="btn-label">Send a burst of {BURST}</span>
            </button>
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-[1280px] px-1 text-[0.85rem] leading-relaxed text-faint">
          Toy discrete-time model with illustrative costs: decode is memory-bound and cheap per sequence, prefill is
          compute-bound per prompt token, weights stream once per pass. Capacity is measured at saturation and latencies
          at the selected load; the baseline is static batching with whole-prompt prefill, no prefix cache, no
          speculation and FP16 weights. These are not my production numbers — those are in the green card below.
        </p>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </section>
  );
}
