import type { ReactNode } from "react";
import { mulberry32 } from "../lib/motion";

/* Small "instrument readings" drawn for the floating tiles in the NASA
   section — each one hints at a real system in the Pandora pipeline. */

export type GlyphKind =
  | "spectrum"
  | "gauge"
  | "cloudmask"
  | "anomaly"
  | "globe"
  | "pipeline"
  | "sunscan"
  | "cpp"
  | "heat"
  | "wave";

const INK = "rgba(255,255,255,0.86)";
const DIM = "rgba(255,255,255,0.28)";
const GREEN = "#72ce7b";
const MONO = { fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" };

function Caption({ children }: { children: ReactNode }) {
  return (
    <text x={10} y={112} fill={DIM} fontSize={8} style={MONO}>
      {children}
    </text>
  );
}

const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

const GLYPHS: Record<GlyphKind, () => ReactNode> = {
  spectrum: () => {
    const r = mulberry32(5);
    const pts: [number, number][] = [];
    for (let x = 6; x <= 154; x += 2) {
      const body = 34 * Math.exp(-Math.pow((x - 74) / 52, 2));
      const dips = [38, 66, 101, 122].reduce((sum, c) => sum + 16 * Math.exp(-Math.pow((x - c) / 2.6, 2)), 0);
      pts.push([x, 84 - body + dips + (r() - 0.5) * 2]);
    }
    return (
      <>
        <path d="M6 88H154" stroke={DIM} strokeDasharray="1 4" />
        <path d={poly(pts)} stroke={INK} strokeWidth={1.2} />
        <Caption>L1 SPECTRA · NO2 / O3</Caption>
      </>
    );
  },
  gauge: () => {
    const arc = (from: number, to: number) => {
      const a0 = (from * Math.PI) / 180;
      const a1 = (to * Math.PI) / 180;
      const p = (a: number) => `${(80 + 38 * Math.cos(a)).toFixed(1)} ${(66 - 38 * Math.sin(a)).toFixed(1)}`;
      return `M${p(a0)} A38 38 0 ${Math.abs(to - from) > 180 ? 1 : 0} 1 ${p(a1)}`;
    };
    return (
      <>
        <path d={arc(205, -25)} stroke={DIM} strokeWidth={5} />
        <path d={arc(205, -11)} stroke={GREEN} strokeWidth={5} />
        <text x={80} y={74} textAnchor="middle" fill={INK} fontSize={22}>
          94
        </text>
        <Caption>INSTRUMENT HEALTH · 0–100</Caption>
      </>
    );
  },
  cloudmask: () => {
    const cells: ReactNode[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        const dx = col - 7.5;
        const dy = row - 3;
        const cloud = dx * dx * 0.5 + dy * dy < 7 || (col - 2) ** 2 + (row - 5.5) ** 2 < 2.5;
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={11 + col * 11.6}
            y={8 + row * 11.6}
            width={9.6}
            height={9.6}
            rx={1.5}
            fill={cloud ? "rgba(255,255,255,0.62)" : "none"}
            stroke={cloud ? "none" : DIM}
          />,
        );
      }
    }
    return (
      <>
        {cells}
        <Caption>CNN CLOUD MASK</Caption>
      </>
    );
  },
  anomaly: () => {
    const r = mulberry32(17);
    const pts: [number, number][] = [];
    for (let x = 6; x <= 154; x += 4) {
      const spike = 40 * Math.exp(-Math.pow((x - 112) / 3.2, 2));
      pts.push([x, 70 - spike + (r() - 0.5) * 10]);
    }
    return (
      <>
        <path d={poly(pts)} stroke={INK} strokeWidth={1.1} />
        <circle cx={112} cy={30} r={9} stroke={GREEN} strokeWidth={1.4} />
        <Caption>ANOMALY · SCORE 0.97</Caption>
      </>
    );
  },
  globe: () => (
    <>
      <circle cx={80} cy={56} r={42} stroke={DIM} />
      <ellipse cx={80} cy={56} rx={42} ry={14} stroke={DIM} />
      <ellipse cx={80} cy={56} rx={16} ry={42} stroke={DIM} />
      {[
        [62, 40],
        [96, 36],
        [104, 62],
        [70, 72],
        [88, 84],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} fill={GREEN} />
      ))}
      <Caption>PANDONIA · 5 CONTINENTS</Caption>
    </>
  ),
  pipeline: () => (
    <>
      {["L0", "L1", "L2"].map((level, i) => (
        <g key={level}>
          <rect x={10 + i * 50} y={36} width={38} height={30} rx={5} stroke={i === 2 ? GREEN : INK} />
          <text x={29 + i * 50} y={55} textAnchor="middle" fill={INK} fontSize={10} style={MONO}>
            {level}
          </text>
          {i < 2 && <path d={`M${50 + i * 50} 51h8m-3-3l3 3-3 3`} stroke={DIM} />}
        </g>
      ))}
      <Caption>RAW STREAM → DATA PRODUCT</Caption>
    </>
  ),
  sunscan: () => {
    const pts = Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      return [14 + t * 132, 86 - Math.sin(t * Math.PI) * 58] as const;
    });
    return (
      <>
        <path d="M14 86Q80 -30 146 86" stroke={DIM} strokeDasharray="1 4" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 4 ? 6 : 2} stroke={i === 4 ? GREEN : INK} fill={i === 4 ? "none" : INK} />
        ))}
        <Caption>SUN SCAN · AZ / EL</Caption>
      </>
    );
  },
  cpp: () => (
    <>
      <text x={12} y={66} fill={INK} fontSize={34} style={MONO}>
        {"{ }"}
      </text>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={84 + (i % 3) * 22} y={30 + Math.floor(i / 3) * 24} width={16} height={16} rx={3} stroke={i === 4 ? GREEN : INK} />
      ))}
      <Caption>C++17 · 14 LIBRARIES</Caption>
    </>
  ),
  heat: () => {
    const r = mulberry32(29);
    const cells: ReactNode[] = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 14; col++) {
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={10 + col * 10.2}
            y={14 + row * 13}
            width={8.4}
            height={10}
            rx={1.5}
            fill={GREEN}
            opacity={0.12 + r() * 0.8}
          />,
        );
      }
    }
    return (
      <>
        {cells}
        <Caption>FLEET HEALTH · 30 DAYS</Caption>
      </>
    );
  },
  wave: () => {
    const r = mulberry32(41);
    return (
      <>
        {Array.from({ length: 6 }, (_, row) => {
          const f = 0.05 + r() * 0.08;
          const p = r() * 6;
          const pts: [number, number][] = [];
          for (let x = 6; x <= 154; x += 3) {
            const env = Math.exp(-Math.pow((x - 80) / 46, 2));
            pts.push([x, 22 + row * 14 - Math.abs(Math.sin(x * f + p)) * 10 * env]);
          }
          return <path key={row} d={poly(pts)} stroke={row === 3 ? GREEN : DIM} strokeWidth={1.1} />;
        })}
        <Caption>SIGNAL · 300+ INSTRUMENTS</Caption>
      </>
    );
  },
};

export default function FleetGlyph({ kind }: { kind: GlyphKind }) {
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full" fill="none" strokeLinecap="round" aria-hidden="true">
      {GLYPHS[kind]()}
    </svg>
  );
}
