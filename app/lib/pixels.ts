/*
 * PIXELS — the page's one material. Pictures are drawn the way a detector
 * reads them: a grid of square cells, each the average of the light that
 * fell on it. Large cells with a small gap read as raw sensor output; as
 * the cells shrink to one screen pixel the picture resolves.
 *
 * `exposure` (0–1) is how much light the cells have integrated so far:
 * low exposure is dark and noisy, the way a short integration time looks.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PixelOptions {
  /* the cell size in CSS pixels; 1 or less draws the source directly */
  block: number;
  /* empty space between cells, in CSS pixels */
  gap?: number;
  /* 0–1 integrated light; below 1 the cells are dimmer and noisier */
  exposure?: number;
  /* uniform 0–1 random source for shot noise */
  rng?: () => number;
  /* reused offscreen buffer, so drawing allocates nothing per frame */
  scratch: HTMLCanvasElement;
}

/* below this cell size the gap-and-noise path is too costly and invisible */
const CELL_PATH_MIN_BLOCK = 7;

/* the part of a w×h source that covers a box of the given aspect
   (object-fit: cover), placed by a 0–1 focal position */
export function coverCrop(w: number, h: number, boxAspect: number, fx = 0.5, fy = 0.5): Rect {
  const sourceAspect = w / h;
  if (sourceAspect > boxAspect) {
    const cw = h * boxAspect;
    return { x: (w - cw) * fx, y: 0, w: cw, h };
  }
  const ch = w / boxAspect;
  return { x: 0, y: (h - ch) * fy, w, h: ch };
}

/* a crop of the given size centred on a point, kept inside the source */
export function cropAround(w: number, h: number, cx: number, cy: number, cw: number, ch: number): Rect {
  const x = Math.min(Math.max(cx - cw / 2, 0), Math.max(0, w - cw));
  const y = Math.min(Math.max(cy - ch / 2, 0), Math.max(0, h - ch));
  return { x, y, w: Math.min(cw, w), h: Math.min(ch, h) };
}

export function lerpRect(a: Rect, b: Rect, t: number): Rect {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  };
}

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/* draw `crop` of `source` into `dest` as square cells */
export function drawPixelated(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  crop: Rect,
  dest: Rect,
  options: PixelOptions,
): void {
  const { block, gap = 0, exposure = 1, rng = Math.random, scratch } = options;

  if (block <= 1.01) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, crop.x, crop.y, crop.w, crop.h, dest.x, dest.y, dest.w, dest.h);
    return;
  }

  const cols = Math.max(1, Math.ceil(dest.w / block));
  const rows = Math.max(1, Math.ceil(dest.h / block));
  if (scratch.width !== cols || scratch.height !== rows) {
    scratch.width = cols;
    scratch.height = rows;
  }
  const sctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!sctx) return;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  /* the source span the whole cell grid covers (it overhangs dest a little) */
  const sx = crop.w / dest.w;
  const sy = crop.h / dest.h;
  sctx.drawImage(source, crop.x, crop.y, cols * block * sx, rows * block * sy, 0, 0, cols, rows);

  const plain = gap <= 0 && exposure >= 1;
  if (plain || block < CELL_PATH_MIN_BLOCK) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scratch, 0, 0, cols, rows, dest.x, dest.y, cols * block, rows * block);
    return;
  }

  const data = sctx.getImageData(0, 0, cols, rows).data;
  const size = block - gap;
  const noise = (1 - exposure) * 90;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = (r * cols + c) * 4;
      const shot = noise > 0 ? (rng() - 0.5) * noise : 0;
      const red = Math.max(0, Math.min(255, data[k] * exposure + shot));
      const green = Math.max(0, Math.min(255, data[k + 1] * exposure + shot));
      const blue = Math.max(0, Math.min(255, data[k + 2] * exposure + shot));
      ctx.fillStyle = `rgb(${red | 0},${green | 0},${blue | 0})`;
      ctx.fillRect(dest.x + c * block, dest.y + r * block, size, size);
    }
  }
}

/* size a canvas's backing store to its layout box; returns the CSS size */
export function fitCanvas(canvas: HTMLCanvasElement, maxDpr = 2): { width: number; height: number; dpr: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const bw = Math.round(width * dpr);
  const bh = Math.round(height * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  return { width, height, dpr };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}
