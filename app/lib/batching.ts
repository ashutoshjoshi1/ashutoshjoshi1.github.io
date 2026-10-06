import { mulberry32 } from "./motion";

/*
 * BATCHING — a toy continuous-batching LLM server, simulated one forward
 * pass at a time. It drives the hero visual: each lane is a batch slot and
 * each tick is a decoded token. The cost model has the right shape (decode
 * is memory-bound and cheap per sequence, prefill is compute-bound per
 * prompt token), but the numbers are illustrative, not measurements.
 */

export const CELL_IDLE = 0;
export const CELL_PREFILL = 1;
export const CELL_DECODE = 2;

export const MARK_FIRST = 1; /* first output token, i.e. time to first token */
export const MARK_DONE = 2; /* request finished on this pass */
export const MARK_HIT = 4; /* prompt prefix served from the KV cache */

export interface Step {
  /* simulated milliseconds */
  t0: number;
  t1: number;
  /* one entry per batch slot */
  kind: Uint8Array;
  mark: Uint8Array;
  /* per-request brightness, 0–255 */
  shade: Uint8Array;
}

export interface EngineStats {
  tokensPerSec: number;
  ttftP50: number;
  busy: number;
  slots: number;
  hitRate: number;
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
}

const SHARED_PREFIX = 512; /* a system prompt most requests reuse */
const SHARED_SHARE = 0.7;
const TOKEN_BUDGET = 512; /* chunked prefill: tokens per forward pass */
const PASS_BASE_MS = 14; /* weights stream through once per pass */
const DECODE_MS = 0.4; /* per sequence in the batch */
const PREFILL_MS = 0.045; /* per prompt token */
const IDLE_MS = 12;
const MAX_QUEUE = 64;
const STATS_WINDOW_MS = 4000;
const TTFT_SAMPLES = 64;

export class BatchEngine {
  readonly slots: number;
  clock = 0;

  private readonly rng: () => number;
  private readonly meanGapMs: number;
  private nextArrival: number;
  private readonly queue: Request[] = [];
  private readonly running: (Sequence | null)[];
  private prefixWarm = false;
  private hits = 0;
  private sharedSeen = 0;
  private readonly ttfts: number[] = [];
  private readonly recent: { t: number; tokens: number }[] = [];

  constructor(slots: number, requestsPerSec: number, seed: number) {
    this.slots = slots;
    this.rng = mulberry32(seed);
    this.meanGapMs = 1000 / requestsPerSec;
    this.running = new Array<Sequence | null>(slots).fill(null);
    this.nextArrival = this.gap();
  }

  /* exponential inter-arrival times: a Poisson request stream */
  private gap(): number {
    return -Math.log(1 - this.rng()) * this.meanGapMs;
  }

  private pullArrivals(): void {
    while (this.nextArrival <= this.clock) {
      const shared = this.rng() < SHARED_SHARE;
      const prompt = shared
        ? SHARED_PREFIX + 48 + Math.floor(this.rng() * 520)
        : 160 + Math.floor(this.rng() * 1100);
      const output = 16 + Math.floor(Math.pow(this.rng(), 1.7) * 240);
      const shade = 90 + Math.floor(this.rng() * 165);
      if (this.queue.length < MAX_QUEUE) {
        this.queue.push({ arrival: this.nextArrival, prompt, output, shared, shade });
      }
      this.nextArrival += this.gap();
    }
  }

  private admit(req: Request): Sequence {
    const hit = req.shared && this.prefixWarm;
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
    };
  }

  /* one forward pass over the whole batch */
  step(): Step {
    this.pullArrivals();
    const n = this.slots;

    /* continuous batching: a freed slot is refilled on the very next pass */
    for (let s = 0; s < n; s++) {
      const next = this.running[s] ? undefined : this.queue.shift();
      if (next) this.running[s] = this.admit(next);
    }

    const kind = new Uint8Array(n);
    const mark = new Uint8Array(n);
    const shade = new Uint8Array(n);
    let budget = TOKEN_BUDGET;
    let decodes = 0;
    let prefillTokens = 0;
    const firsts: number[] = [];

    /* decode first: every sequence past prefill emits one token */
    for (let s = 0; s < n; s++) {
      const seq = this.running[s];
      if (!seq || seq.prefillLeft > 0) continue;
      kind[s] = CELL_DECODE;
      shade[s] = seq.req.shade;
      seq.outLeft--;
      decodes++;
      budget--;
    }

    /* chunked prefill spends whatever is left of the token budget */
    for (let s = 0; s < n; s++) {
      const seq = this.running[s];
      if (!seq || seq.prefillLeft === 0) continue;
      shade[s] = seq.req.shade;
      const take = Math.min(seq.prefillLeft, budget);
      if (take <= 0) continue;
      kind[s] = CELL_PREFILL;
      if (!seq.started && seq.hit) mark[s] |= MARK_HIT;
      seq.started = true;
      seq.prefillLeft -= take;
      budget -= take;
      prefillTokens += take;
      if (seq.prefillLeft === 0) {
        /* the last prefill chunk produces the first output token */
        seq.outLeft--;
        mark[s] |= MARK_FIRST;
        firsts.push(s);
        if (seq.req.shared) this.prefixWarm = true;
      }
    }

    const working = decodes > 0 || prefillTokens > 0;
    const t0 = this.clock;
    const t1 =
      t0 + (working ? PASS_BASE_MS + DECODE_MS * decodes + PREFILL_MS * prefillTokens : IDLE_MS);

    for (const s of firsts) {
      const seq = this.running[s];
      if (seq) this.recordTtft(t1 - seq.req.arrival);
    }
    for (let s = 0; s < n; s++) {
      const seq = this.running[s];
      if (seq && seq.outLeft <= 0) {
        mark[s] |= MARK_DONE;
        this.running[s] = null;
      }
    }

    this.clock = t1;
    this.recent.push({ t: t1, tokens: decodes + firsts.length });
    while (this.recent.length > 0 && this.recent[0].t < t1 - STATS_WINDOW_MS) this.recent.shift();

    return { t0, t1, kind, mark, shade };
  }

  private recordTtft(ms: number): void {
    this.ttfts.push(ms);
    if (this.ttfts.length > TTFT_SAMPLES) this.ttfts.shift();
  }

  stats(): EngineStats {
    const span = Math.max(1, Math.min(STATS_WINDOW_MS, this.clock));
    const tokens = this.recent.reduce((sum, r) => sum + r.tokens, 0);
    const sorted = [...this.ttfts].sort((a, b) => a - b);
    return {
      tokensPerSec: (tokens / span) * 1000,
      ttftP50: sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0,
      busy: this.running.filter((seq) => seq !== null).length,
      slots: this.slots,
      hitRate: this.sharedSeen > 0 ? this.hits / this.sharedSeen : 0,
    };
  }
}
