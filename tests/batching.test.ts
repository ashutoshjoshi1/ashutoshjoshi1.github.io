import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BASELINE_POLICY,
  BatchEngine,
  CELL_BLOCKED,
  CELL_STALL,
  MARK_HIT,
  TUNED_POLICY,
  type Policy,
  type Step,
} from "../app/lib/batching";

const SLOTS = 12;
const RATE = 6;
const SEED = 21;
const RUN_MS = 30_000;

/* every pass a policy runs over the same stream of requests */
function run(policy: Policy, rate = RATE): { steps: Step[]; tokensPerSec: number } {
  const engine = new BatchEngine(SLOTS, rate, SEED, policy);
  const steps: Step[] = [];
  while (engine.clock < RUN_MS) steps.push(engine.step());
  return { steps, tokensPerSec: engine.stats().tokensPerSec };
}

function count(steps: Step[], test: (step: Step, slot: number) => boolean): number {
  let n = 0;
  for (const step of steps) for (let s = 0; s < step.kind.length; s++) if (test(step, s)) n++;
  return n;
}

test("static batching leaves slots empty while requests wait; continuous never does", () => {
  const blocked = (policy: Policy) => count(run(policy).steps, (step, s) => step.kind[s] === CELL_BLOCKED);
  assert.ok(blocked(BASELINE_POLICY) > 0);
  assert.equal(blocked({ ...BASELINE_POLICY, continuous: true }), 0);
});

test("continuous batching serves more tokens per second than static batching", () => {
  const heavy = 9;
  assert.ok(run({ ...BASELINE_POLICY, continuous: true }, heavy).tokensPerSec > run(BASELINE_POLICY, heavy).tokensPerSec);
});

test("chunked prefill stops long prompts stalling everyone else's decode", () => {
  const stalls = (policy: Policy) => count(run(policy).steps, (step, s) => step.kind[s] === CELL_STALL);
  const whole = stalls({ ...TUNED_POLICY, chunkedPrefill: false });
  const chunked = stalls(TUNED_POLICY);
  assert.ok(chunked < whole / 2, `chunked ${chunked}, whole ${whole}`);
});

test("only a server with prefix caching serves prompts from the cache", () => {
  const hits = (policy: Policy) => count(run(policy).steps, (step, s) => (step.mark[s] & MARK_HIT) !== 0);
  assert.ok(hits(TUNED_POLICY) > 0);
  assert.equal(hits({ ...TUNED_POLICY, prefixCache: false }), 0);
});

test("speculative decoding sometimes lands several tokens in one pass", () => {
  const most = (policy: Policy) => Math.max(...run(policy).steps.flatMap((step) => [...step.tokens]));
  assert.equal(most(TUNED_POLICY), 1);
  assert.ok(most({ ...TUNED_POLICY, speculative: true }) > 1);
});

test("FP8 weights make every pass shorter", () => {
  const meanPass = (policy: Policy) => {
    const { steps } = run(policy);
    return steps.reduce((sum, step) => sum + (step.t1 - step.t0), 0) / steps.length;
  };
  assert.ok(meanPass({ ...TUNED_POLICY, fp8: true }) < meanPass(TUNED_POLICY));
});
