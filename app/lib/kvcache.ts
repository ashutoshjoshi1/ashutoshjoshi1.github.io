import { MARK_DONE } from "./batching";

/*
 * KVCACHE — GPU memory as a grid of fixed-size KV-cache blocks, the way
 * PagedAttention manages it. Each running request owns blocks in proportion
 * to the tokens it holds; blocks come off a free list, so a request's memory
 * is scattered in runs rather than one contiguous slab, and a finished
 * request hands its blocks straight back. The shared system prompt, when
 * prefix caching is on, lives in one set of blocks every request reads.
 *
 * It only does bookkeeping: the renderer reads `owner`, `lastOwner` and
 * `changedAt` to flash new blocks and fade freed ones.
 */

export const FREE = -1;
export const SHARED = 0;

/* the per-slot fields of a batching Step this map needs */
export interface KvFrame {
  rid: Uint32Array;
  kv: Uint16Array;
  sharedKv: Uint8Array;
  mark: Uint8Array;
}

export class KvBlockMap {
  readonly size: number;
  readonly tokensPerBlock: number;
  /* FREE, SHARED, or the id of the request holding the block */
  readonly owner: Int32Array;
  /* the owner before the latest change, so a freed block can fade out */
  readonly lastOwner: Int32Array;
  /* when (in simulated ms) each block last changed hands */
  readonly changedAt: Float64Array;

  private readonly sharedTokens: number;
  private readonly rng: () => number;
  private readonly blocks = new Map<number, number[]>();
  private readonly cursors = new Map<number, number>();
  private shared: number[] | null = null;
  private usedCount = 0;

  constructor(size: number, tokensPerBlock: number, sharedTokens: number, rng: () => number) {
    this.size = size;
    this.tokensPerBlock = tokensPerBlock;
    this.sharedTokens = sharedTokens;
    this.rng = rng;
    this.owner = new Int32Array(size).fill(FREE);
    this.lastOwner = new Int32Array(size).fill(FREE);
    this.changedAt = new Float64Array(size).fill(Number.NEGATIVE_INFINITY);
  }

  /* share of blocks holding anything, 0–1 */
  used(): number {
    return this.usedCount / this.size;
  }

  /* bring the map in line with one forward pass of the batch */
  apply(frame: KvFrame, now: number, keepShared: boolean): void {
    const running = new Set<number>();
    let readsShared = false;

    for (let s = 0; s < frame.rid.length; s++) {
      const rid = frame.rid[s];
      if (rid === 0) continue;
      if (frame.mark[s] & MARK_DONE) {
        this.release(rid, now);
        continue;
      }
      running.add(rid);
      if (frame.sharedKv[s]) {
        readsShared = true;
        this.ensureShared(now);
      }
      this.grow(rid, Math.ceil(frame.kv[s] / this.tokensPerBlock), now);
    }

    const gone = [...this.blocks.keys()].filter((rid) => !running.has(rid));
    gone.forEach((rid) => this.release(rid, now));

    if (!keepShared && !readsShared) this.releaseShared(now);
  }

  private take(index: number, owner: number, now: number): void {
    this.lastOwner[index] = this.owner[index];
    this.owner[index] = owner;
    this.changedAt[index] = now;
    this.usedCount++;
  }

  private free(index: number, now: number): void {
    this.lastOwner[index] = this.owner[index];
    this.owner[index] = FREE;
    this.changedAt[index] = now;
    this.usedCount--;
  }

  /* claim up to `count` free blocks scanning forward from `start`; returns
     them in order (fewer when memory is full) */
  private claim(count: number, start: number, owner: number, now: number): number[] {
    const taken: number[] = [];
    for (let k = 0; k < this.size && taken.length < count; k++) {
      const index = (start + k) % this.size;
      if (this.owner[index] !== FREE) continue;
      this.take(index, owner, now);
      taken.push(index);
    }
    return taken;
  }

  private grow(rid: number, target: number, now: number): void {
    const held = this.blocks.get(rid) ?? [];
    const need = target - held.length;
    if (need <= 0) {
      if (!this.blocks.has(rid)) this.blocks.set(rid, held);
      return;
    }
    const start = this.cursors.get(rid) ?? Math.floor(this.rng() * this.size);
    const taken = this.claim(need, start, rid, now);
    this.blocks.set(rid, [...held, ...taken]);
    if (taken.length > 0) this.cursors.set(rid, (taken[taken.length - 1] + 1) % this.size);
  }

  private release(rid: number, now: number): void {
    this.blocks.get(rid)?.forEach((index) => this.free(index, now));
    this.blocks.delete(rid);
    this.cursors.delete(rid);
  }

  private ensureShared(now: number): void {
    if (this.shared) return;
    const count = Math.ceil(this.sharedTokens / this.tokensPerBlock);
    this.shared = this.claim(count, Math.floor(this.rng() * this.size), SHARED, now);
  }

  private releaseShared(now: number): void {
    if (!this.shared) return;
    this.shared.forEach((index) => this.free(index, now));
    this.shared = null;
  }
}
