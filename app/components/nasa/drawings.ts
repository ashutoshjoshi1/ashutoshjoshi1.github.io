import { mulberry32 } from "../../lib/motion";

/*
 * The pictures the NASA frame draws: instrument traces with anomalies
 * flagged, an all-sky camera frame with its clouds marked, a fleet scored
 * instrument by instrument, and a solar spectrum. All are cells, the same
 * material as the rest of the page, and all are captioned as drawings.
 */

const GROUND = "#1c1c1c";
const TRACK = "#242424";
const BAND = "#323231";
const DIM = "#4a4a48";
const LIGHT = "#b4b4b0";
const INK = "#f1f1ef";
const FLAG = "#8fa68e";

/* a square cell at grid position (c, r) from an origin */
function cellAt(ctx: CanvasRenderingContext2D, x0: number, y0: number, cell: number, gap: number, c: number, r: number): void {
  ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - gap, cell - gap);
}

const TRACE_COLS = 44;
const TRACES = 3;
/* where each instrument's readings leave the expected band: [column, offset] */
const ANOMALIES: [number, number][][] = [[[13, -5], [31, 4]], [], [[22, 6]]];

/* a day of readings from three instruments: the expected band, the signal,
   and the few readings the models flag */
export function drawTrace(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const rng = mulberry32(17);
  const cell = width / (TRACE_COLS + 2);
  const gap = Math.max(1, Math.round(cell * 0.14));
  const rows = Math.floor(height / cell) - 2;
  const bandRows = Math.floor(rows / TRACES) - 1;
  const x0 = cell;
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, width, height);

  for (let t = 0; t < TRACES; t++) {
    const top = cell + t * (bandRows + 1) * cell;
    const mid = Math.floor(bandRows / 2);
    const flags = new Map(ANOMALIES[t]);
    let drift = 0;
    for (let c = 0; c < TRACE_COLS; c++) {
      for (let r = 0; r < bandRows; r++) {
        ctx.fillStyle = Math.abs(r - mid) <= 2 ? BAND : TRACK;
        cellAt(ctx, x0, top, cell, gap, c, r);
      }
      drift = Math.max(-2, Math.min(2, drift + (rng() - 0.5) * 1.2));
      const offset = flags.get(c);
      const row = Math.max(0, Math.min(bandRows - 1, mid + Math.round(offset ?? drift)));
      ctx.fillStyle = offset === undefined ? LIGHT : FLAG;
      cellAt(ctx, x0, top, cell, gap, c, row);
    }
  }
}

const SKY_CELLS = 26;

/* an all-sky camera frame: a disc of cells, the sun near the top, and the
   cloud cells a classifier marks */
export function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const rng = mulberry32(42);
  const size = Math.min(width, height);
  const cell = size / SKY_CELLS;
  const gap = Math.max(1, Math.round(cell * 0.14));
  const x0 = (width - size) / 2;
  const y0 = (height - size) / 2;
  const centre = (SKY_CELLS - 1) / 2;
  const radius = SKY_CELLS * 0.46;
  const sun = { c: centre + 3, r: centre - 6 };
  /* a few small clouds, kept off the sun so the frame reads as mostly sky */
  const clouds = Array.from({ length: 3 }, (_, i) => ({
    c: centre - 7 + i * 6 + rng() * 3,
    r: centre + 1 + rng() * 6,
    s: 1.4 + rng() * 1.2,
  }));
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, width, height);

  for (let r = 0; r < SKY_CELLS; r++) {
    for (let c = 0; c < SKY_CELLS; c++) {
      const fromCentre = Math.hypot(c - centre, r - centre);
      if (fromCentre > radius) continue;
      const fromSun = Math.hypot(c - sun.c, r - sun.r);
      const cloud = clouds.reduce((sum, b) => sum + Math.exp(-((c - b.c) ** 2 + (r - b.r) ** 2) / (2 * b.s * b.s)), 0);
      if (fromSun < 1.5) ctx.fillStyle = INK;
      else if (cloud > 0.6) ctx.fillStyle = FLAG;
      else if (fromSun < 3) ctx.fillStyle = LIGHT;
      else ctx.fillStyle = fromCentre > radius * 0.75 ? DIM : BAND;
      cellAt(ctx, x0, y0, cell, gap, c, r);
    }
  }
}

const FLEET_COLS = 15;
const FLEET_ROWS = 20; /* 300 instruments */
const FLEET_SEED = 300;

/* health score to tone: the fleet is mostly healthy, a few need a look */
function healthTone(score: number): string {
  if (score < 0.035) return FLAG;
  if (score < 0.12) return DIM;
  if (score < 0.55) return "#7c7c78";
  return LIGHT;
}

/* three hundred instruments as a grid of cells, each shaded by its score */
export function drawFleet(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const rng = mulberry32(FLEET_SEED);
  const cell = Math.min(width / (FLEET_COLS + 2), height / (FLEET_ROWS + 2));
  const gap = Math.max(1, Math.round(cell * 0.16));
  const x0 = (width - FLEET_COLS * cell) / 2;
  const y0 = (height - FLEET_ROWS * cell) / 2;
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, width, height);
  for (let r = 0; r < FLEET_ROWS; r++) {
    for (let c = 0; c < FLEET_COLS; c++) {
      ctx.fillStyle = healthTone(rng());
      ctx.fillRect(x0 + c * cell, y0 + r * cell, cell - gap, cell - gap);
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
