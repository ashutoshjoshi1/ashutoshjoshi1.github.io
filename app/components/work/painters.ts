import { Cells, Tone } from "./cells";

/*
 * One small drawing per project, each made from what the project does,
 * on a 40 × 50 grid (4:5). They are drawings, not screenshots: the shapes
 * are the mechanism (a policy gate, forgetting curves, a forecast fan).
 */

export const ART_COLS = 40;
export const ART_ROWS = 50;

type Painter = (c: Cells, rng: () => number) => void;

const gauss = (rng: () => number) => (rng() + rng() + rng() - 1.5) / 1.5;

/* tool calls meet a policy gate: allowed ones pass, denied ones stop,
   the rest wait for a human; every decision lands in the audit column */
const phulax: Painter = (c, rng) => {
  const gate = 20;
  c.rect(gate, 3, 2, 44, Tone.Light);
  for (let lane = 0; lane < 10; lane++) {
    const y = 5 + lane * 4;
    const start = 2 + Math.floor(rng() * 7);
    const verdict = rng();
    c.rect(start, y, gate - start - 2, 1, Tone.Mid);
    if (verdict < 0.5) {
      c.rect(gate - 2, y, 1, 1, Tone.Mid);
      c.rect(gate, y, 2, 1, Tone.Accent);
      c.rect(gate + 3, y, 9 + Math.floor(rng() * 4), 1, Tone.Accent);
    } else if (verdict < 0.8) {
      c.rect(gate - 3, y - 1, 2, 3, Tone.Ink);
    } else {
      for (let x = gate + 3; x < 33; x += 2) c.set(x, y, Tone.Dim);
      c.rect(gate - 2, y, 1, 1, Tone.Light);
    }
    c.rect(36, y, 2, 1, verdict < 0.5 ? Tone.Accent : Tone.Dim);
  }
};

/* documents become chunks in a vector space; the answer cites its sources */
const commonground: Painter = (c, rng) => {
  [0, 1, 2].forEach((k) => {
    const x = 2 + k * 2;
    const y = 3 + k * 3;
    c.rect(x, y, 12, 15, k === 2 ? Tone.Light : Tone.Mid);
    if (k === 2) for (let r = 0; r < 6; r++) c.rect(x + 2, y + 3 + r * 2, 8 - (r % 3) * 2, 1, Tone.Dim);
  });
  const clusters: [number, number][] = [
    [6, 31],
    [13, 38],
    [6, 43],
  ];
  clusters.forEach(([cx, cy]) => {
    for (let i = 0; i < 12; i++) c.set(cx + gauss(rng) * 3, cy + gauss(rng) * 3, rng() < 0.4 ? Tone.Light : Tone.Mid);
  });
  c.disc(13, 38, 1, Tone.Accent);
  c.line(15, 37, 23, 30, Tone.Dim);
  c.rect(22, 18, 16, 24, Tone.Dim);
  for (let r = 0; r < 7; r++) {
    const w = 11 - (r % 3) * 2;
    c.rect(24, 21 + r * 3, w, 1, Tone.Light);
    if (r % 2 === 0) c.rect(24 + w + 1, 21 + r * 3, 1, 1, Tone.Accent);
  }
};

/* memories fade along forgetting curves until a recall lifts them again */
const incortex: Painter = (c, rng) => {
  c.rect(3, 5, 1, 40, Tone.Dim);
  c.rect(3, 44, 35, 1, Tone.Dim);
  for (let k = 0; k < 4; k++) {
    let x0 = 4 + k * 3;
    let tau = 4 + rng() * 3;
    let refreshed = false;
    for (let x = x0; x < 38; x++) {
      const y = 43 - 33 * Math.exp(-(x - x0) / tau) - k;
      c.set(x, y, refreshed ? Tone.Light : Tone.Mid);
      if (!refreshed && x - x0 > 6 + k * 2 && rng() < 0.18) {
        c.rect(x, Math.round(y) - 1, 1, Math.round(y) - 8, Tone.Accent);
        x0 = x;
        tau *= 2.2;
        refreshed = true;
      }
    }
  }
};

/* eight agent desks in one office, a human gate at the door */
const office: Painter = (c) => {
  c.rect(2, 7, 36, 1, Tone.Dim);
  c.rect(2, 41, 36, 1, Tone.Dim);
  c.rect(2, 7, 1, 35, Tone.Dim);
  c.rect(37, 7, 1, 35, Tone.Dim);
  for (let i = 0; i < 8; i++) {
    const x = 5 + (i % 4) * 8;
    const y = i < 4 ? 13 : 29;
    c.rect(x, y, 5, 3, Tone.Mid);
    c.rect(x + 1, y - 1, 3, 1, Tone.Light);
    c.set(x + 2, y + 4, Tone.Ink);
  }
  for (let x = 6; x < 34; x += 2) c.set(x, 22, Tone.Dim);
  c.rect(17, 41, 6, 1, Tone.Ground);
  c.rect(17, 42, 6, 2, Tone.Accent);
};

/* one YAML facade over fourteen devices, each with a simulated twin */
const sciglobLibrary: Painter = (c) => {
  c.rect(5, 3, 30, 3, Tone.Light);
  for (let i = 0; i < 14; i++) {
    const x = i % 2 === 0 ? 3 : 21;
    const y = 10 + Math.floor(i / 2) * 5.5;
    c.set(x + 3, y - 2, Tone.Dim);
    c.rect(x, y, 7, 3, Tone.Mid);
    c.rect(x + 8, y, 7, 3, Tone.Dim);
    c.set(x + 11, y + 1, Tone.Accent);
  }
};

const solar = (x: number) => {
  const nm = 300 + (x / 40) * 230;
  const dips = [393, 397, 431, 486, 517].reduce((d, l) => Math.max(d, 0.75 * Math.exp(-((nm - l) ** 2) / 8)), 0);
  return (0.35 + 0.65 * Math.min(1, (nm - 300) / 160)) * (1 - dips) / (1 + Math.exp(-(nm - 318) / 5));
};

/* raw counts, a calibrated spectrum, and the trace-gas columns behind them */
const blicko: Painter = (c, rng) => {
  for (let x = 3; x < 37; x++) {
    const raw = Math.max(1, Math.round(solar(x) * 10 + gauss(rng) * 2));
    c.rect(x, 16 - raw, 1, raw, Tone.Mid);
    c.set(x, 16 - raw, Tone.Light);
    const smooth = Math.max(1, Math.round(solar(x) * 10));
    c.rect(x, 32 - smooth, 1, smooth, Tone.Dim);
    c.set(x, 32 - smooth, Tone.Ink);
  }
  c.rect(19, 18, 2, 2, Tone.Dim);
  c.rect(19, 34, 2, 2, Tone.Dim);
  [7, 4, 9, 5].forEach((h, i) => c.rect(6 + i * 8, 47 - h, 5, h, i === 2 ? Tone.Accent : Tone.Light));
};

/* the fleet scored 0–100, instrument by instrument, and the daily summary */
const pandoraSummarizer: Painter = (c, rng) => {
  for (let i = 0; i < 120; i++) {
    const x = 3 + (i % 12) * 3;
    const y = 4 + Math.floor(i / 12) * 3;
    const health = rng();
    const tone = health < 0.07 ? Tone.Accent : health > 0.55 ? Tone.Light : health > 0.25 ? Tone.Mid : Tone.Dim;
    c.rect(x, y, 2, 2, tone);
  }
  for (let d = 0; d < 12; d++) {
    const h = 3 + Math.round(rng() * 4);
    c.rect(3 + d * 3, 46 - h, 2, h, d === 11 ? Tone.Ink : Tone.Mid);
  }
};

/* six specialist agents reason over their data and converge on one call */
const moneyball: Painter = (c, rng) => {
  const cx = 20;
  const cy = 25;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * 14;
    const y = cy + Math.sin(a) * 16;
    c.line(x, y, cx, cy, Tone.Dim);
    for (let k = 0; k < 6; k++) c.set(x + gauss(rng) * 3.5, y + gauss(rng) * 3.5, Tone.Mid);
    c.disc(x, y, 1, Tone.Light);
  }
  c.disc(cx, cy, 2, Tone.Accent);
};

/* history, then a widening forecast fan with a challenger beside it */
const harborline: Painter = (c, rng) => {
  c.rect(2, 44, 36, 1, Tone.Dim);
  let y = 30;
  const path: number[] = [];
  for (let x = 2; x < 38; x++) {
    y += gauss(rng) * 1.4 - (x > 20 ? 0.35 : 0.05);
    path[x] = y;
  }
  for (let x = 20; x < 38; x++) {
    const spread = (x - 20) * 0.55;
    c.rect(x, Math.round(path[x] - spread), 1, Math.round(spread * 2) + 1, Tone.Dim);
    c.rect(x, Math.round(path[x] - spread / 2), 1, Math.round(spread) + 1, Tone.Mid);
  }
  for (let x = 3; x < 38; x++) c.line(x - 1, path[x - 1], x, path[x], x <= 20 ? Tone.Ink : Tone.Light);
  for (let x = 21; x < 38; x++) c.set(x, path[x] + 3 + Math.sin(x * 0.7), Tone.Accent);
};

/* a field scanned in bands of light, residue risk mapped low to high */
const fasal: Painter = (c, rng) => {
  const blobs = Array.from({ length: 4 }, () => ({ x: 4 + rng() * 32, y: 6 + rng() * 38, r: 5 + rng() * 6 }));
  for (let y = 3; y < 47; y++) {
    for (let x = 2; x < 38; x++) {
      if ((x + y) % 5 === 0) continue;
      const risk = blobs.reduce((s, b) => s + Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.r * b.r)), 0);
      const tone = risk > 0.85 ? Tone.Accent : risk > 0.5 ? Tone.Light : risk > 0.22 ? Tone.Mid : Tone.Dim;
      c.set(x, y, tone);
    }
  }
};

/* frames of generated video above the synthesized audio that drives them */
const rebirth: Painter = (c) => {
  c.rect(2, 7, 36, 24, Tone.Dim);
  for (let x = 3; x < 38; x += 3) {
    c.set(x, 8, Tone.Ground);
    c.set(x, 29, Tone.Ground);
  }
  [3, 15, 27].forEach((x, i) => {
    c.rect(x, 11, 10, 16, Tone.Mid);
    c.disc(x + 5, 17, 3, Tone.Light);
    c.rect(x + 3, 21, 5, 5, Tone.Light);
    c.set(x + 4, 16, Tone.Dim);
    c.set(x + 6, 16, Tone.Dim);
    c.rect(x + 4, 19 - (i === 1 ? 1 : 0), 3, 1, Tone.Dim);
  });
  for (let x = 3; x < 37; x++) {
    const amp = Math.round(Math.abs(Math.sin(x * 0.55) * Math.sin(x * 0.17)) * 6) + 1;
    c.rect(x, 41 - amp, 1, amp * 2, Tone.Accent);
  }
};

/* price action above the chain of risk gates every trade must clear */
const topstepx: Painter = (c, rng) => {
  let price = 22;
  for (let i = 0; i < 11; i++) {
    const x = 3 + i * 3;
    const move = gauss(rng) * 5;
    const open = price;
    price += move;
    const top = Math.min(open, price);
    const height = Math.max(1, Math.abs(move));
    c.rect(x + 1, Math.round(top - 2 - rng() * 2), 1, Math.round(height + 4), Tone.Dim);
    c.rect(x, Math.round(top), 2, Math.round(height), move < 0 ? Tone.Ink : Tone.Mid);
  }
  for (let g = 0; g < 7; g++) {
    c.rect(3 + g * 5, 42, 3, 3, g === 6 ? Tone.Accent : Tone.Light);
    if (g < 6) c.rect(6 + g * 5, 43, 2, 1, Tone.Dim);
  }
};

/* a phone: the budget so far, and the transactions under it */
const retrve: Painter = (c, rng) => {
  c.rect(10, 2, 20, 46, Tone.Dim);
  c.rect(12, 6, 16, 37, Tone.Ground);
  c.rect(13, 9, 14, 2, Tone.Mid);
  c.rect(13, 9, 9, 2, Tone.Accent);
  for (let r = 0; r < 7; r++) {
    const y = 15 + r * 4;
    c.rect(13, y, 2, 2, Tone.Light);
    c.rect(16, y, 4 + Math.floor(rng() * 5), 1, Tone.Mid);
    c.rect(24, y, 3, 1, Tone.Light);
  }
  c.rect(17, 45, 6, 1, Tone.Light);
};

/* a sensor's orientation as a cube, its axes, and the raw stream below */
const imu: Painter = (c) => {
  const [cy, sy, cp, sp, cr, sr] = [0.6, 0.45, 0.25].flatMap((a) => [Math.cos(a), Math.sin(a)]);
  const rotate = ([x, y, z]: number[]) => {
    const x1 = x * cy - z * sy;
    const z1 = x * sy + z * cy;
    const y1 = y * cp - z1 * sp;
    return [x1 * cr - y1 * sr, x1 * sr + y1 * cr];
  };
  const project = (p: number[]) => [20 + p[0] * 10, 22 + p[1] * 10];
  const sign = (bit: number) => (bit ? 1 : -1);
  const corners = Array.from({ length: 8 }, (_, n) => project(rotate([sign(n & 4), sign(n & 2), sign(n & 1)])));
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      const flipped = i ^ j;
      if (flipped === 1 || flipped === 2 || flipped === 4) c.line(corners[i][0], corners[i][1], corners[j][0], corners[j][1], Tone.Light);
    }
  }
  const [ox, oy] = project([0, 0]);
  const axes: [number[], Tone][] = [
    [[1.7, 0, 0], Tone.Accent],
    [[0, 1.7, 0], Tone.Mid],
    [[0, 0, 1.7], Tone.Ink],
  ];
  axes.forEach(([axis, tone]) => {
    const [x, y] = project(rotate(axis));
    c.line(ox, oy, x, y, tone);
  });
  for (let x = 3; x < 37; x++) {
    c.set(x, 42 + Math.sin(x * 0.5) * 2, Tone.Mid);
    c.set(x, 42 + Math.sin(x * 0.31 + 1) * 3, Tone.Dim);
  }
};

export const PAINTERS: Record<string, Painter> = {
  phulax,
  commonground,
  incortex,
  office,
  "sciglob-library": sciglobLibrary,
  blicko,
  "pandora-summarizer": pandoraSummarizer,
  moneyball,
  harborline,
  fasal,
  rebirth,
  topstepx,
  retrve,
  imu,
};
