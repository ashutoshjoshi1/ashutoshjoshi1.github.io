import {
  CELL_BLOCKED,
  CELL_DECODE,
  CELL_PREFILL,
  CELL_STALL,
  MARK_DONE,
  MARK_FIRST,
  MARK_HIT,
  type Step,
} from "./batching";

/*
 * Draws a batch timeline: lanes are batch slots, time runs right to left
 * with "now" at the right edge. Shared by the hero footage and the lab.
 */

export interface TimelineMarker {
  t: number;
  label: string;
}

export interface TimelineView {
  left: number; /* x where lanes begin (after any label gutter) */
  right: number; /* x of "now" */
  top: number; /* y of lane 0's centre line */
  lanePx: number;
  lanes: number;
  nowMs: number;
  pxPerMs: number;
  /* older passes fade out toward the left */
  fade: boolean;
  /* draw stalled and blocked slots (the lab) or hide them (the hero) */
  showWaste: boolean;
  markers?: TimelineMarker[];
  /* canvas can't resolve CSS variables — pass a concrete font string */
  markerFont?: string;
}

const SIGNAL = "#72ce7b";
const STALL = "#e8a25c";
const INK = "#ffffff";

export function drawTimeline(ctx: CanvasRenderingContext2D, steps: readonly Step[], v: TimelineView): void {
  const span = Math.max(1, v.right - v.left);
  const xAt = (t: number) => v.right - (v.nowMs - t) * v.pxPerMs;
  const alphaAt = (x: number) => {
    if (!v.fade) return 1;
    const a = Math.min(1, Math.max(0, (x - v.left) / span));
    return 0.12 + 0.88 * Math.pow(a, 1.4);
  };
  const visible = (x0: number, x1: number) => x1 >= v.left - 8 && x0 <= v.right + 8;
  const tick = Math.max(5, v.lanePx * 0.32);

  ctx.save();
  ctx.beginPath();
  ctx.rect(v.left, 0, span, v.top + v.lanes * v.lanePx);
  ctx.clip();

  /* decode ticks — one per emitted token, so speculation reads as clusters */
  ctx.fillStyle = INK;
  for (const st of steps) {
    const x1 = xAt(st.t1);
    if (!visible(x1, x1)) continue;
    const age = alphaAt(x1);
    for (let s = 0; s < v.lanes; s++) {
      if (st.kind[s] !== CELL_DECODE) continue;
      const y = v.top + s * v.lanePx;
      ctx.globalAlpha = (st.shade[s] / 255) * age * 0.92;
      for (let k = 0; k < st.tokens[s]; k++) ctx.fillRect(x1 - 1.5 - k * 2.6, y - tick / 2, 1.5, tick);
    }
  }

  /* prefill bars + prefix-cache hit diamonds */
  ctx.fillStyle = SIGNAL;
  for (const st of steps) {
    const x0 = xAt(st.t0);
    const x1 = xAt(st.t1);
    if (!visible(x0, x1)) continue;
    const age = alphaAt(x1);
    for (let s = 0; s < v.lanes; s++) {
      if (st.kind[s] !== CELL_PREFILL) continue;
      const y = v.top + s * v.lanePx;
      ctx.globalAlpha = 0.85 * age;
      ctx.fillRect(x0, y - 1, Math.max(1, x1 - x0 - 1), 2);
      if (st.mark[s] & MARK_HIT) {
        ctx.beginPath();
        ctx.moveTo(x0, y - 4);
        ctx.lineTo(x0 + 4, y);
        ctx.lineTo(x0, y + 4);
        ctx.lineTo(x0 - 4, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  /* waste: stalled slots (amber) and slots blocked by static batching */
  if (v.showWaste) {
    for (const st of steps) {
      const x0 = xAt(st.t0);
      const x1 = xAt(st.t1);
      if (!visible(x0, x1)) continue;
      const age = alphaAt(x1);
      for (let s = 0; s < v.lanes; s++) {
        const k = st.kind[s];
        if (k !== CELL_STALL && k !== CELL_BLOCKED) continue;
        const y = v.top + s * v.lanePx;
        if (k === CELL_STALL) {
          ctx.fillStyle = STALL;
          ctx.globalAlpha = 0.75 * age;
          ctx.fillRect(x0, y - 0.75, Math.max(1, x1 - x0 - 1), 1.5);
        } else {
          ctx.fillStyle = INK;
          ctx.globalAlpha = 0.28 * age;
          for (let x = x0; x < x1 - 1; x += 4) ctx.fillRect(x, y - 0.5, 1.5, 1);
        }
      }
    }
  }

  /* keypoints: first token (hollow square) and request done (ring) */
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  for (const st of steps) {
    const x1 = xAt(st.t1);
    if (!visible(x1, x1)) continue;
    const age = alphaAt(x1);
    for (let s = 0; s < v.lanes; s++) {
      const m = st.mark[s];
      if (!(m & (MARK_FIRST | MARK_DONE))) continue;
      const y = v.top + s * v.lanePx;
      ctx.globalAlpha = age;
      if (m & MARK_FIRST) ctx.strokeRect(x1 - 3.5, y - 3.5, 7, 7);
      if (m & MARK_DONE) {
        ctx.beginPath();
        ctx.arc(x1 + 4, y, 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  /* policy-change markers; a label that would collide with the previous
     one is dropped (its dashed line still marks the moment) */
  if (v.markers) {
    ctx.font = v.markerFont ?? "10px ui-monospace, monospace";
    let labelEnd = -Infinity;
    for (const marker of v.markers) {
      const x = xAt(marker.t);
      if (x < v.left || x > v.right) continue;
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = INK;
      for (let y = v.top - v.lanePx / 2; y < v.top + (v.lanes - 0.5) * v.lanePx; y += 6) ctx.fillRect(x, y, 1, 3);
      const label = marker.label.toUpperCase();
      const width = ctx.measureText(label).width;
      if (x + 6 < labelEnd + 8 || x + 6 + width > v.right) continue;
      ctx.globalAlpha = 0.9;
      ctx.fillText(label, x + 6, v.top - v.lanePx / 2 + 9);
      labelEnd = x + 6 + width;
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}
