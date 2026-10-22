import { LAYER_SIZES, type MLP, type Sample } from "../../lib/neural";

/*
 * The lab's two drawings: the network's decision field as chunky cells
 * with the training points on top, and its live weights as a graph.
 */

export type Rgb = [number, number, number];

export interface LabColors {
  accent: Rgb;
  ink: Rgb;
  dim: Rgb;
}

/* the boundary field's resolution: chunky cells on purpose */
export const FIELD_GRID = 56;

const rgba = (c: Rgb, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

export function parseHex(raw: string): Rgb | null {
  const hex = raw.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
}

export function drawField(
  canvas: HTMLCanvasElement,
  offscreen: HTMLCanvasElement,
  net: MLP,
  samples: Sample[],
  colors: LabColors,
): void {
  const ctx = canvas.getContext("2d");
  const off = offscreen.getContext("2d");
  const { width: w, height: h } = canvas;
  if (!ctx || !off || w === 0 || h === 0) return;

  const image = off.createImageData(FIELD_GRID, FIELD_GRID);
  const data = image.data;
  for (let j = 0; j < FIELD_GRID; j++) {
    const ny = 1 - (2 * (j + 0.5)) / FIELD_GRID;
    for (let i = 0; i < FIELD_GRID; i++) {
      const nx = (2 * (i + 0.5)) / FIELD_GRID - 1;
      const p = net.forward(nx, ny);
      const k = (j * FIELD_GRID + i) * 4;
      /* p is p(label 1); class A (label 0) owns the accent region */
      const tone = p < 0.5 ? colors.accent : colors.ink;
      data[k] = tone[0];
      data[k + 1] = tone[1];
      data[k + 2] = tone[2];
      data[k + 3] = Math.round(Math.abs(p - 0.5) * 2 * (p < 0.5 ? 150 : 70));
    }
  }
  off.putImageData(image, 0, 0);

  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, w, h);

  /* the cell gaps: thin cuts in the page colour, so the field reads as cells */
  const cell = w / FIELD_GRID;
  const gap = Math.max(1, Math.round(cell * 0.1));
  ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
  for (let i = 1; i < FIELD_GRID; i++) {
    const at = Math.round(i * cell) - gap;
    ctx.fillRect(at, 0, gap, h);
    ctx.fillRect(0, at, w, gap);
  }

  /* points: class A filled, class B hollow, both square like the cells */
  const r = Math.max(3, Math.round(w / 130));
  ctx.fillStyle = rgba(colors.accent, 1);
  for (const s of samples) {
    if (s.label !== 0) continue;
    ctx.fillRect(((s.x + 1) / 2) * w - r, ((1 - s.y) / 2) * h - r, r * 2, r * 2);
  }
  ctx.strokeStyle = rgba(colors.ink, 0.95);
  ctx.lineWidth = Math.max(1.5, r / 2.2);
  for (const s of samples) {
    if (s.label !== 1) continue;
    ctx.strokeRect(((s.x + 1) / 2) * w - r, ((1 - s.y) / 2) * h - r, r * 2, r * 2);
  }
}

export function drawGraph(canvas: HTMLCanvasElement, net: MLP, probe: Sample | undefined, colors: LabColors): void {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  if (!ctx || w === 0 || h === 0) return;
  if (probe) net.forward(probe.x, probe.y);

  ctx.clearRect(0, 0, w, h);
  const padX = w * 0.06;
  const padY = h * 0.12;
  const xs = LAYER_SIZES.map((_, l) => padX + (l / (LAYER_SIZES.length - 1)) * (w - padX * 2));
  const nodeY = (l: number, i: number): number => {
    const n = LAYER_SIZES[l];
    return n === 1 ? h / 2 : padY + (i / (n - 1)) * (h - padY * 2);
  };

  /* edges: width tracks |weight|, colour tracks its sign */
  for (let l = 0; l < net.weights.length; l++) {
    for (let j = 0; j < net.weights[l].length; j++) {
      for (let i = 0; i < net.weights[l][j].length; i++) {
        const weight = net.weights[l][j][i];
        const mag = Math.min(1, Math.abs(weight) / 2.2);
        if (mag < 0.03) continue;
        ctx.strokeStyle = weight > 0 ? rgba(colors.accent, 0.2 + mag * 0.7) : rgba(colors.dim, 0.15 + mag * 0.5);
        ctx.lineWidth = 0.5 + mag * 2.6;
        ctx.beginPath();
        ctx.moveTo(xs[l], nodeY(l, i));
        ctx.lineTo(xs[l + 1], nodeY(l + 1, j));
        ctx.stroke();
      }
    }
  }

  /* nodes: square, brightness tracks the latest activation */
  const size = Math.max(5, Math.round(w / 60));
  for (let l = 0; l < LAYER_SIZES.length; l++) {
    for (let i = 0; i < LAYER_SIZES[l]; i++) {
      const a = Math.min(1, Math.abs(net.activations[l]?.[i] ?? 0));
      ctx.fillStyle = rgba(colors.ink, 0.3 + a * 0.7);
      ctx.fillRect(xs[l] - size / 2, nodeY(l, i) - size / 2, size, size);
    }
  }
}
