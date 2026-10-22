/*
 * SPECTRUM — the sunlight a Pandora spectrometer reads, 300 to 530 nm, as
 * a smooth illustrative curve: ozone cuts it off in the ultraviolet, the
 * continuum climbs toward the visible, and the Fraunhofer lines bite out of
 * it. The bands are the windows the gases are fitted in.
 */

export const NM_MIN = 300;
export const NM_MAX = 530;

/* Fraunhofer lines inside the range: [nm, depth 0–1, width in nm] */
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

export interface Band {
  gas: string;
  from: number;
  to: number;
}

/* the fitting windows Pandora's Blick processing uses for each gas */
export const BANDS: Band[] = [
  { gas: "O₃", from: 310, to: 330 },
  { gas: "HCHO", from: 325, to: 360 },
  { gas: "NO₂", from: 400, to: 470 },
];

/* relative irradiance at the ground, about 0 to 1 */
export function irradiance(nm: number): number {
  const ozone = 1 / (1 + Math.exp(-(nm - 318) / 5));
  const continuum = 0.45 + 0.55 * Math.min(1, (nm - NM_MIN) / 170);
  let absorbed = 0;
  for (const [center, depth, width] of LINES) {
    absorbed = Math.max(absorbed, depth * Math.exp(-((nm - center) ** 2) / (2 * width * width)));
  }
  const ripple = 0.04 * Math.sin(nm * 1.7) * Math.sin(nm * 0.31);
  return Math.max(0, ozone * continuum * (1 - absorbed) + ripple * ozone);
}

/* x of a wavelength across a box `width` wide */
export function nmToX(nm: number, width: number): number {
  return ((nm - NM_MIN) / (NM_MAX - NM_MIN)) * width;
}

/* the curve as an SVG path through `samples` points, filling a width × height box */
export function spectrumPath(width: number, height: number, samples: number): string {
  const parts: string[] = [];
  for (let i = 0; i < samples; i++) {
    const nm = NM_MIN + (i / (samples - 1)) * (NM_MAX - NM_MIN);
    const x = (i / (samples - 1)) * width;
    const y = height * (1 - Math.min(1, irradiance(nm)));
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1).replace(/\.0$/, "")},${y.toFixed(1)}`);
  }
  return parts.join(" ");
}
