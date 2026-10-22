import { test } from "node:test";
import assert from "node:assert/strict";
import { KvBlockMap, FREE, SHARED, type KvFrame } from "../app/lib/kvcache";
import { BatchEngine, MARK_DONE, SHARED_PREFIX, TUNED_POLICY, BASELINE_POLICY } from "../app/lib/batching";

const TOKENS_PER_BLOCK = 16;
const SHARED_BLOCKS = Math.ceil(SHARED_PREFIX / TOKENS_PER_BLOCK);

/* a frame for a batch of `slots`, every slot empty */
function frame(slots: number): KvFrame {
  return {
    rid: new Uint32Array(slots),
    kv: new Uint16Array(slots),
    sharedKv: new Uint8Array(slots),
    mark: new Uint8Array(slots),
  };
}

/* always start scanning at block 0, so placement is predictable */
const atStart = () => 0;

function ownedBy(map: KvBlockMap, rid: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < map.size; i++) if (map.owner[i] === rid) out.push(i);
  return out;
}

test("allocates one block per started group of tokens", () => {
  const map = new KvBlockMap(64, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(2);
  f.rid[0] = 7;
  f.kv[0] = 33; /* 2 full blocks + 1 token */

  map.apply(f, 0, true);

  assert.equal(ownedBy(map, 7).length, 3);
  assert.equal(map.used(), 3 / 64);
});

test("a fresh request on an empty map gets one contiguous run", () => {
  const map = new KvBlockMap(64, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(1);
  f.rid[0] = 1;
  f.kv[0] = 16 * 5;

  map.apply(f, 0, true);

  assert.deepEqual(ownedBy(map, 1), [0, 1, 2, 3, 4]);
});

test("grows as the request decodes and never shrinks while it runs", () => {
  const map = new KvBlockMap(64, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(1);
  f.rid[0] = 3;
  f.kv[0] = 16;
  map.apply(f, 0, true);
  f.kv[0] = 40;
  map.apply(f, 10, true);
  assert.equal(ownedBy(map, 3).length, 3);

  f.kv[0] = 20; /* the engine never reports less, but the map must not free mid-run */
  map.apply(f, 20, true);
  assert.equal(ownedBy(map, 3).length, 3);
});

test("frees every block when the request finishes", () => {
  const map = new KvBlockMap(64, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(1);
  f.rid[0] = 9;
  f.kv[0] = 64;
  map.apply(f, 0, true);
  f.mark[0] = MARK_DONE;
  map.apply(f, 12, true);

  assert.equal(ownedBy(map, 9).length, 0);
  assert.equal(map.used(), 0);
  assert.equal(map.lastOwner[0], 9, "the renderer needs the previous owner to fade it out");
  assert.equal(map.changedAt[0], 12);
});

test("frees a request that disappears from the batch", () => {
  const map = new KvBlockMap(64, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(2);
  f.rid[0] = 1;
  f.kv[0] = 32;
  f.rid[1] = 2;
  f.kv[1] = 32;
  map.apply(f, 0, true);

  const next = frame(2);
  next.rid[1] = 2;
  next.kv[1] = 32;
  map.apply(next, 5, true);

  assert.equal(ownedBy(map, 1).length, 0);
  assert.equal(ownedBy(map, 2).length, 2);
});

test("shares the system prompt's blocks between every request that hits it", () => {
  const map = new KvBlockMap(256, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(3);
  for (let s = 0; s < 3; s++) {
    f.rid[s] = s + 1;
    f.kv[s] = 16;
    f.sharedKv[s] = 1;
  }
  map.apply(f, 0, true);

  assert.equal(ownedBy(map, SHARED).length, SHARED_BLOCKS, "allocated once, not once per request");
  assert.equal(map.used(), (SHARED_BLOCKS + 3) / 256);
});

test("keeps the shared prefix warm while caching is on, frees it once off and unread", () => {
  const map = new KvBlockMap(256, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(1);
  f.rid[0] = 1;
  f.kv[0] = 16;
  f.sharedKv[0] = 1;
  map.apply(f, 0, true);

  map.apply(frame(1), 5, true);
  assert.equal(ownedBy(map, SHARED).length, SHARED_BLOCKS);

  map.apply(f, 10, false);
  assert.equal(ownedBy(map, SHARED).length, SHARED_BLOCKS, "still read by a running request");

  map.apply(frame(1), 15, false);
  assert.equal(ownedBy(map, SHARED).length, 0);
});

test("stops allocating when memory is full instead of overrunning it", () => {
  const map = new KvBlockMap(8, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  const f = frame(2);
  f.rid[0] = 1;
  f.kv[0] = 16 * 6;
  f.rid[1] = 2;
  f.kv[1] = 16 * 6;

  map.apply(f, 0, true);

  assert.equal(map.used(), 1);
  assert.equal(ownedBy(map, 1).length + ownedBy(map, 2).length, 8);
});

test("free blocks are marked FREE", () => {
  const map = new KvBlockMap(4, TOKENS_PER_BLOCK, SHARED_PREFIX, atStart);
  assert.deepEqual([...map.owner], [FREE, FREE, FREE, FREE]);
});

test("continuous batching keeps more of the cache working than static batching", () => {
  const usage = (policy: typeof TUNED_POLICY) => {
    const engine = new BatchEngine(12, 4.4, 21, policy);
    const map = new KvBlockMap(1600, TOKENS_PER_BLOCK, SHARED_PREFIX, () => 0.5);
    let sum = 0;
    let n = 0;
    while (engine.clock < 30000) {
      const step = engine.step();
      map.apply(step, engine.clock, policy.prefixCache);
      if (engine.clock > 5000) {
        sum += map.used();
        n++;
      }
    }
    return sum / n;
  };

  assert.ok(usage({ ...BASELINE_POLICY, continuous: true }) > usage(BASELINE_POLICY));
});
