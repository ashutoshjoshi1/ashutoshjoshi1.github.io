import { mulberry32 } from "../lib/motion";

const W = 420;
const H = 240;
const ROWS = 9;
const STEP = 6;

interface ProjectVisualProps {
  seed: number;
  /* light cards get dark strokes, coloured cards get light ones */
  tone?: "light" | "dark";
  className?: string;
}

function buildRow(seed: number, row: number): string {
  const rand = mulberry32(seed * 1000 + row * 77);
  const f1 = 0.012 + rand() * 0.02;
  const f2 = 0.03 + rand() * 0.05;
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const baseY = (H / (ROWS + 1)) * (row + 1);
  const cx = W * (0.35 + rand() * 0.3);
  const spread = W * (0.18 + rand() * 0.12);
  const maxAmp = 16 + rand() * 22;

  let d = "";
  for (let x = 0; x <= W; x += STEP) {
    const env = Math.exp(-Math.pow((x - cx) / spread, 2));
    const n =
      Math.sin(x * f1 + p1) * 0.6 + Math.sin(x * f2 + p2) * 0.4 + (rand() - 0.5) * 0.35;
    const y = baseY - (n * 0.5 + 0.5) * maxAmp * env;
    d += `${x === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

/* Deterministic per-project waveform signature — same seed, same trace. */
export default function ProjectVisual({ seed, tone = "dark", className }: ProjectVisualProps) {
  const accentRow = seed % ROWS;
  const stroke = tone === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.22)";
  const accent = tone === "dark" ? "var(--signal)" : "var(--forest)";
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: ROWS }, (_, row) => (
        <path
          key={row}
          d={buildRow(seed, row)}
          fill="none"
          stroke={row === accentRow ? accent : stroke}
          strokeWidth={row === accentRow ? 1.5 : 1}
        />
      ))}
    </svg>
  );
}
