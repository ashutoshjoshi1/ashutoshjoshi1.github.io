import { mulberry32 } from "./motion";

/*
 * BATCHING — a toy LLM server, simulated one forward pass at a time. It
 * drives the hero visual and the serving lab: each lane is a batch slot,
 * each tick a decoded token. The cost model has the right shape (decode is
 * memory-bound and cheap per sequence, prefill is compute-bound per prompt
 * token, weights stream once per pass), but the numbers are illustrative,
 * not measurements.
 */

export const CELL_IDLE = 0; /* free slot, nothing waiting */
export const CELL_PREFILL = 1;
export const CELL_DECODE = 2;
export const CELL_STALL = 3; /* occupied, but this pass did nothing for it */
export const CELL_BLOCKED = 4; /* free slot while requests wait (static batching) */

export const MARK_FIRST = 1; /* first output token, i.e. time to first token */
export const MARK_DONE = 2; /* request finished on this pass */
export const MARK_HIT = 4; /* prompt prefix served from the KV cache */

export interface Policy {
  /* refill a slot the moment its request finishes (vs. wait for the batch) */
  continuous: boolean;
  /* split prompts across passes alongside decodes (vs. prefill-only passes) */
  chunkedPrefill: boolean;
  /* reuse the KV cache of the shared system prompt */
  prefixCache: boolean;
  /* draft tokens, verify them in one target pass */
  speculative: boolean;
  /* 8-bit weights: half the bytes streamed per pass */
  fp8: boolean;
}

export const TUNED_POLICY: Policy = {
  continuous: true,
  chunkedPrefill: true,
  prefixCache: true,
  speculative: false,
  fp8: false,
};

export const BASELINE_POLICY: Policy = {
  continuous: false,
  chunkedPrefill: false,
  prefixCache: false,
  speculative: false,
  fp8: false,
};

export interface Step {
  /* simulated milliseconds */
  t0: number;
  t1: number;
  /* one entry per batch slot */
  kind: Uint8Array;
  mark: Uint8Array;
  /* tokens emitted this pass (speculative passes can emit several) */
  tokens: Uint8Array;
  /* per-request brightness, 0–255 */
  shade: Uint8Array;
}

export interface EngineStats {
  tokensPerSec: number;
  ttftP50: number;
  ttftP99: number;
  busy: number;
  slots: number;
  queue: number;
  steps: number;
  hitRate: number;
}

export interface RunSummary {
  throughput: number; /* output tokens per simulated second */
  ttftP50: number;
  ttftP99: number;
  itlP99: number; /* inter-token latency: the gap a user sees mid-stream */
  utilization: number; /* share of slot-time spent prefilling or decoding */
  hitRate: number;
  completed: number;
}

interface Request {
  arrival: number;
  prompt: number;
  output: number;
  shared: boolean;
  shade: number;
}

interface Sequence {
  req: Request;
  prefillLeft: number;
  outLeft: number;
  hit: boolean;
  started: boolean;
  lastTokenAt: number;
}

const SHARED_PREFIX = 512; /* a system prompt most requests reuse */
const SHARED_SHARE = 0.7;
const TOKEN_BUDGET = 512; /* chunked prefill: tokens per forward pass */
const IDLE_MS = 12;
const MAX_QUEUE = 64;
const STATS_WINDOW_MS = 4000;
const TTFT_SAMPLES = 128;
const DRAFT_TOKENS = 3;
const DRAFT_ACCEPT = 0.7;

/* per-pass costs: weights stream once per pass (memory-bound), decode adds
   a little per sequence, prefill pays per prompt token (compute-bound) */
const COST = {
  fp16: { pass: 14, decode: 0.4, prefill: 0.045 },
  fp8: { pass: 8.4, decode: 0.26, prefill: 0.03 },
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

export class BatchEngine {
  readonly slots: number;
  clock = 0;
  steps = 0;
  policy: Policy;

  /* separate streams so every policy sees the identical request sequence */
  private readonly arrivalRng: () => number;
  private readonly draftRng: () => number;
  private meanGapMs: number;
  private nextArrival: number;
  private readonly queue: Request[] = [];
  private readonly running: (Sequence | null)[];
  private prefixWarm = false;
  private hits = 0;
  private sharedSeen = 0;
  private readonly ttfts: number[] = [];
  private readonly recent: { t: number; tokens: number }[] = [];

  /* whole-run accumulators for summaries (after warm-up) */
  private measureFrom = 0;
  private totalTokens = 0;
  private usefulSlotMs = 0;
  private completed = 0;
  private readonly allTtfts: number[] = [];
  private readonly allItls: number[] = [];

  constructor(slots: number, requestsPerSec: number, seed: number, policy: Policy = TUNED_POLICY) {
    this.slots = slots;
    this.policy = policy;
    this.arrivalRng = mulberry32(seed);
    this.draftRng = mulberry32(seed * 7 + 3);
    this.meanGapMs = 1000 / requestsPerSec;
    this.running = new Array<Sequence | null>(slots).fill(null);
    this.nextArrival = this.gap();
  }

  setPolicy(policy: Policy): void {
    this.policy = policy;
  }

  setRate(requestsPerSec: number): void {
    this.meanGapMs = 1000 / requestsPerSec;
  }

  /* start the whole-run accumulators from here (skips warm-up) */
  startMeasuring(): void {
    this.measureFrom = this.clock;
    this.totalTokens = 0;
    this.usefulSlotMs = 0;
    this.completed = 0;
    this.allTtfts.length = 0;
    this.allItls.length = 0;
  }

  /* a traffic spike: n requests arrive right now */
  inject(n: number): void {
    for (let i = 0; i < n && this.queue.length < MAX_QUEUE; i++) {
      this.queue.push(this.makeRequest(this.clock));
    }
  }

  /* exponential inter-arrival times: a Poisson request stream */
  private gap(): number {
    return -Math.log(1 - this.arrivalRng()) * this.meanGapMs;
  }

  private makeRequest(arrival: number): Request {
    const r = this.arrivalRng;
    const shared = r() < SHARED_SHARE;
    const prompt = shared ? SHARED_PREFIX + 48 + Math.floor(r() * 520) : 160 + Math.floor(r() * 1100);
    const output = 16 + Math.floor(Math.pow(r(), 1.7) * 240);
    const shade = 90 + Math.floor(r() * 165);
    return { arrival, prompt, output, shared, shade };
  }

  private pullArrivals(): void {
    while (this.nextArrival <= this.clock) {
      const req = this.makeRequest(this.nextArrival);
      if (this.queue.length < MAX_QUEUE) this.queue.push(req);
      this.nextArrival += this.gap();
    }
  }

  private admit(req: Request): Sequence {
    const hit = this.policy.prefixCache && req.shared && this.prefixWarm;
    if (req.shared) {
      this.sharedSeen++;
      if (hit) this.hits++;
    }
    return {
      req,
      prefillLeft: hit ? req.prompt - SHARED_PREFIX : req.prompt,
      outLeft: req.output,
      hit,
      started: false,
      lastTokenAt: 0,
    };
  }

  private admitWaiting(): void {
    const n = this.slots;
    if (this.policy.continuous) {
      for (let s = 0; s < n && this.queue.length > 0; s++) {
        if (!this.running[s]) this.running[s] = this.admit(this.queue.shift() as Request);
      }
      return;
    }
    /* static batching: a new batch forms only once the last one has drained */
    if (this.running.some((seq) => seq !== null)) return;
    for (let s = 0; s < n && this.queue.length > 0; s++) {
      this.running[s] = this.admit(this.queue.shift() as Request);
    }
  }

  /* tokens one decoding sequence emits this pass */
  private decodeTokens(seq: Sequence): number {
    if (!this.policy.speculative) return 1;
    let accepted = 0;
    while (accepted < DRAFT_TOKENS && this.draftRng() < DRAFT_ACCEPT) accepted++;
    return Math.min(seq.outLeft, accepted + 1);
  }

  /* one forward pass over the whole batch */
  step(): Step {
    this.pullArrivals();
    this.admitWaiting();

    const n = this.slots;
    const kind = new Uint8Array(n);
    const mark = new Uint8Array(n);
    const tokens = new Uint8Array(n);
    const shade = new Uint8Array(n);
    const cost = this.policy.fp8 ? COST.fp8 : COST.fp16;
    const firsts: number[] = [];
    let decodes = 0;
    let decodeTokens = 0;
    let prefillTokens = 0;

    const needsPrefill = this.running.some((seq) => seq !== null && seq.prefillLeft > 0);
    const prefillOnly = !this.policy.chunkedPrefill && needsPrefill;

    const finishPrefill = (s: number, seq: Sequence) => {
      /* the last prefill chunk produces the first output token */
      seq.outLeft--;
      tokens[s] = 1;
      mark[s] |= MARK_FIRST;
      firsts.push(s);
      if (seq.req.shared && this.policy.prefixCache) this.prefixWarm = true;
    };

    if (prefillOnly) {
      /* whole-prompt prefill pass: every decoding sequence stalls */
      for (let s = 0; s < n; s++) {
        const seq = this.running[s];
        if (!seq) continue;
        shade[s] = seq.req.shade;
        if (seq.prefillLeft === 0) {
          kind[s] = CELL_STALL;
          continue;
        }
        kind[s] = CELL_PREFILL;
        if (!seq.started && seq.hit) mark[s] |= MARK_HIT;
        seq.started = true;
        prefillTokens += seq.prefillLeft;
        seq.prefillLeft = 0;
        finishPrefill(s, seq);
      }
    } else {
      let budget = TOKEN_BUDGET;
      /* decode first: every sequence past prefill emits its tokens */
      for (let s = 0; s < n; s++) {
        const seq = this.running[s];
        if (!seq || seq.prefillLeft > 0) continue;
        const emitted = this.decodeTokens(seq);
        kind[s] = CELL_DECODE;
        shade[s] = seq.req.shade;
        tokens[s] = emitted;
        seq.outLeft -= emitted;
        decodes++;
        decodeTokens += emitted;
        budget--;
      }
      /* chunked prefill spends whatever is left of the token budget */
      for (let s = 0; s < n; s++) {
        const seq = this.running[s];
        if (!seq || seq.prefillLeft === 0) continue;
        shade[s] = seq.req.shade;
        const take = Math.min(seq.prefillLeft, Math.max(0, budget));
        if (take === 0) {
          kind[s] = CELL_STALL;
          continue;
        }
        kind[s] = CELL_PREFILL;
        if (!seq.started && seq.hit) mark[s] |= MARK_HIT;
        seq.started = true;
        seq.prefillLeft -= take;
        budget -= take;
        prefillTokens += take;
        if (seq.prefillLeft === 0) finishPrefill(s, seq);
      }
    }

    /* free slots: blocked if requests are waiting (only static batching
       leaves them empty), idle otherwise */
    if (this.queue.length > 0) {
      for (let s = 0; s < n; s++) if (!this.running[s]) kind[s] = CELL_BLOCKED;
    }

    const working = decodes > 0 || prefillTokens > 0;
    let passMs = IDLE_MS;
    if (working) {
      passMs = cost.pass + cost.decode * decodes;
      /* speculation: draft passes + verifying k+1 positions per sequence */
      if (this.policy.speculative && decodes > 0) passMs *= 1.2 + 0.04 * decodes;
      passMs += cost.prefill * prefillTokens;
    }
    const t0 = this.clock;
    const t1 = t0 + passMs;

    const measuring = t0 >= this.measureFrom;
    for (let s = 0; s < n; s++) {
      const seq = this.running[s];
      if (!seq) continue;
      if (mark[s] & MARK_FIRST) {
        this.recordTtft(t1 - seq.req.arrival, t1);
        seq.lastTokenAt = t1;
      } else if (kind[s] === CELL_DECODE) {
        /* per-token gap since this sequence's previous emission */
        if (measuring) this.allItls.push((t1 - seq.lastTokenAt) / tokens[s]);
        seq.lastTokenAt = t1;
      }
    }
    let useful = 0;
    for (let s = 0; s < n; s++) {
      if (kind[s] === CELL_PREFILL || kind[s] === CELL_DECODE) useful++;
      const seq = this.running[s];
      if (seq && seq.prefillLeft === 0 && seq.outLeft <= 0) {
        mark[s] |= MARK_DONE;
        this.running[s] = null;
        if (t1 >= this.measureFrom) this.completed++;
      }
    }

    const emitted = decodeTokens + firsts.length;
    this.clock = t1;
    this.steps++;
    if (measuring) {
      this.totalTokens += emitted;
      this.usefulSlotMs += useful * passMs;
    }
    this.recent.push({ t: t1, tokens: emitted });
    while (this.recent.length > 0 && this.recent[0].t < t1 - STATS_WINDOW_MS) this.recent.shift();

    return { t0, t1, kind, mark, tokens, shade };
  }

  private recordTtft(ms: number, at: number): void {
    this.ttfts.push(ms);
    if (this.ttfts.length > TTFT_SAMPLES) this.ttfts.shift();
    if (at >= this.measureFrom) this.allTtfts.push(ms);
  }

  /* rolling stats over the last few simulated seconds */
  stats(): EngineStats {
    const span = Math.max(1, Math.min(STATS_WINDOW_MS, this.clock));
    const tokens = this.recent.reduce((sum, r) => sum + r.tokens, 0);
    const sorted = [...this.ttfts].sort((a, b) => a - b);
    return {
      tokensPerSec: (tokens / span) * 1000,
      ttftP50: percentile(sorted, 0.5),
      ttftP99: percentile(sorted, 0.99),
      busy: this.running.filter((seq) => seq !== null).length,
      slots: this.slots,
      queue: this.queue.length,
      steps: this.steps,
      hitRate: this.sharedSeen > 0 ? this.hits / this.sharedSeen : 0,
    };
  }

  /* whole-run numbers since startMeasuring() */
  summary(): RunSummary {
    const span = Math.max(1, this.clock - this.measureFrom);
    const sorted = [...this.allTtfts].sort((a, b) => a - b);
    const itls = [...this.allItls].sort((a, b) => a - b);
    return {
      throughput: (this.totalTokens / span) * 1000,
      ttftP50: percentile(sorted, 0.5),
      ttftP99: percentile(sorted, 0.99),
      itlP99: percentile(itls, 0.99),
      utilization: this.usefulSlotMs / (span * this.slots),
      hitRate: this.sharedSeen > 0 ? this.hits / this.sharedSeen : 0,
      completed: this.completed,
    };
  }
}

/* run a policy for a fixed stretch of simulated time and summarize it —
   deterministic, so two policies at the same seed see the same traffic */
export function simulate(
  policy: Policy,
  slots: number,
  requestsPerSec: number,
  seed: number,
  horizonMs = 60000,
  warmupMs = 5000,
): RunSummary {
  const engine = new BatchEngine(slots, requestsPerSec, seed, policy);
  while (engine.clock < warmupMs) engine.step();
  engine.startMeasuring();
  while (engine.clock < warmupMs + horizonMs) engine.step();
  return engine.summary();
}
