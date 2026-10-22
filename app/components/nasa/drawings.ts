import { coverCrop } from "../../lib/pixels";

/*
 * The two pictures the NASA frame draws instead of loading: a cloud-free
 * sky classified cell by cell, and a solar spectrum.
 */

const ACCENT = "143,166,142";

/* normalized red–blue ratio: clear sky scatters blue, clouds and objects
   scatter red and blue alike, so high values mean open sky */
export function nrbr(red: number, blue: number): number {
  return blue + red === 0 ? 0 : (blue - red) / (blue + red);
}

const CLEAR_SKY_NRBR = 0.2;

/* classify the photo in square cells; returns 1 for clear sky, row-major */
export function classifySky(img: HTMLImageElement, cols: number, rows: number, aspect: number): Uint8Array {
  const crop = coverCrop(img.naturalWidth, img.naturalHeight, aspect);
  const probe = document.createElement("canvas");
  probe.width = cols;
  probe.height = rows;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  const mask = new Uint8Array(cols * rows);
  if (!ctx) return mask;
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  for (let i = 0; i < cols * rows; i++) {
    mask[i] = nrbr(data[i * 4], data[i * 4 + 2]) > CLEAR_SKY_NRBR ? 1 : 0;
  }
  return mask;
}

/* draw the mask over the photo, revealed row by row up to `sweep` (0–1) */
export function drawSkyMask(
  ctx: CanvasRenderingContext2D,
  mask: Uint8Array,
  cols: number,
  rows: number,
  width: number,
  height: number,
  sweep: number,
): void {
  const cw = width / cols;
  const ch = height / rows;
  const gap = Math.max(1, cw * 0.14);
  const shown = Math.floor(rows * sweep);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = `rgba(${ACCENT},0.62)`;
  for (let r = 0; r < shown; r++) {
    for (let c = 0; c < cols; c++) {
      if (mask[r * cols + c]) ctx.fillRect(c * cw, r * ch, cw - gap, ch - gap);
    }
  }
}

/* Fraunhofer lines inside 300–530 nm: [nm, depth 0–1, width in nm] */
const LINES: [number, number, number][] = [
  [336.1, 0.45, 1.6],
  [358.1, 0.55, 1.4],
  [382.0, 0.5, 1.8],
  [393.4, 0.85, 2.2],
  [396.8, 0.8, 2.0],
  [410.2, 0.45, 1.0],
  [430.8, 0.55, 1.3],
  [434.0, 0.5, 1.0],
  [438.4, 0.4, 0.8],
  [486.1, 0.55, 1.2],
  [516.7, 0.4, 0.9],
  [517.3, 0.45, 0.9],
  [518.4, 0.5, 0.9],
];
const NM_MIN = 300;
const NM_MAX = 530;

/* relative solar irradiance: the atmosphere cuts in below ~320 nm (ozone),
   the continuum climbs toward the visible, the lines bite out of it */
export function irradiance(nm: number, seed = 0): number {
  const ozone = 1 / (1 + Math.exp(-(nm - 318) / 5));
  const continuum = 0.45 + 0.55 * Math.min(1, (nm - NM_MIN) / 170);
  let absorbed = 0;
  for (const [center, depth, width] of LINES) {
    absorbed = Math.max(absorbed, depth * Math.exp(-((nm - center) ** 2) / (2 * width * width)));
  }
  const ripple = 0.04 * Math.sin(nm * 1.7 + seed) * Math.sin(nm * 0.31);
  return Math.max(0, ozone * continuum * (1 - absorbed) + ripple * ozone);
}

/* the spectrum as columns of square cells, like a detector readout */
export function drawSpectrum(ctx: CanvasRenderingContext2D, width: number, height: number, fontFamily: string): void {
  const cell = Math.max(5, Math.round(width / 64));
  const gap = Math.max(1, Math.round(cell * 0.14));
  const cols = Math.floor(width / cell);
  const rows = Math.floor((height * 0.72) / cell);
  const baseY = height * 0.86;
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(0, 0, width, height);
  for (let c = 0; c < cols; c++) {
    const nm = NM_MIN + ((c + 0.5) / cols) * (NM_MAX - NM_MIN);
    const level = irradiance(nm) * rows;
    for (let r = 0; r < rows; r++) {
      const lit = r < level;
      const edge = lit && r + 1 >= level;
      ctx.fillStyle = edge ? "#f1f1ef" : lit ? "#8a8a86" : "#262626";
      ctx.fillRect(c * cell, baseY - (r + 1) * cell, cell - gap, cell - gap);
    }
  }
  /* the wavelength scale, in the text face */
  ctx.fillStyle = "#a3a49f";
  ctx.font = `500 ${Math.max(12, Math.round(width / 38))}px ${fontFamily}`;
  ctx.textBaseline = "top";
  for (const nm of [300, 350, 400, 450, 500]) {
    const x = ((nm - NM_MIN) / (NM_MAX - NM_MIN)) * cols * cell;
    ctx.fillText(`${nm} nm`, x, baseY + cell * 0.8);
  }
}
