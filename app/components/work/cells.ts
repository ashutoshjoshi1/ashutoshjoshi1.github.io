/*
 * CELLS — a tiny raster for the project pictures. Each picture is drawn on
 * a coarse grid in the page's palette and shown as square cells, the same
 * material as the hero and the KV-cache map.
 */

export const Tone = {
  Ground: 0,
  Dim: 1,
  Mid: 2,
  Light: 3,
  Ink: 4,
  Accent: 5,
  AccentDim: 6,
} as const;
export type Tone = (typeof Tone)[keyof typeof Tone];

/* the page's palette, by tone */
export const TONES = ["#242424", "#3b3b3a", "#6f6f6c", "#b4b4b0", "#f1f1ef", "#8fa68e", "#4e5b4e"];

export class Cells {
  readonly cols: number;
  readonly rows: number;
  readonly data: Uint8Array;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.data = new Uint8Array(cols * rows);
  }

  set(x: number, y: number, tone: Tone): void {
    const cx = Math.round(x);
    const cy = Math.round(y);
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return;
    this.data[cy * this.cols + cx] = tone;
  }

  get(x: number, y: number): Tone {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return Tone.Ground;
    return this.data[y * this.cols + x] as Tone;
  }

  rect(x: number, y: number, w: number, h: number, tone: Tone): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, tone);
  }

  /* Bresenham, so diagonals stay one cell wide */
  line(x0: number, y0: number, x1: number, y1: number, tone: Tone): void {
    let x = Math.round(x0);
    let y = Math.round(y0);
    const tx = Math.round(x1);
    const ty = Math.round(y1);
    const dx = Math.abs(tx - x);
    const dy = -Math.abs(ty - y);
    const sx = x < tx ? 1 : -1;
    const sy = y < ty ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x, y, tone);
      if (x === tx && y === ty) return;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
  }

  disc(cx: number, cy: number, r: number, tone: Tone): void {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r) this.set(cx + x, cy + y, tone);
  }
}

/* one source pixel per cell, so the cell art can be resampled coarser */
export function toBitmap(cells: Cells): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cells.cols;
  canvas.height = cells.rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const image = ctx.createImageData(cells.cols, cells.rows);
  const rgb = TONES.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
  for (let i = 0; i < cells.data.length; i++) {
    const [r, g, b] = rgb[cells.data[i]];
    image.data.set([r, g, b, 255], i * 4);
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}
