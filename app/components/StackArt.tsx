import type { ReactNode } from "react";
import { mulberry32 } from "../lib/motion";

/*
 * Line-art for the 3D panel stack — annotation-style drawings (dotted
 * guides, keypoints, labels) of LLM-serving concepts. Deterministic: every
 * drawing is seeded, so server and client render the same SVG.
 */

const W = 420;
const H = 270;
const INK = "rgba(255,255,255,0.86)";
const DIM = "rgba(255,255,255,0.32)";
const GREEN = "#72ce7b";
const MONO = { fontFamily: "var(--font-mono), monospace", letterSpacing: "0.04em" };

export type ArtKind =
  | "lanes"
  | "kvGrid"
  | "annotations"
  | "batch"
  | "speedup"
  | "gpus"
  | "pods"
  | "bits"
  | "spec"
  | "latency"
  | "gate";

function Label({ x, y, children, fill = DIM, size = 10 }: { x: number; y: number; children: ReactNode; fill?: string; size?: number }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} style={MONO}>
      {children}
    </text>
  );
}

/* scale-style triangle marker */
function Marker({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y}h7l-3.5 6z`} stroke={INK} strokeWidth={1} />;
}

function lanes(seed: number) {
  const r = mulberry32(seed);
  return Array.from({ length: 7 }, (_, i) => {
    const y = 46 + i * 30;
    const start = 26 + r() * 110;
    const pre = 18 + r() * 48;
    const tokens = 5 + Math.floor(r() * 10);
    return (
      <g key={i}>
        <line x1={18} x2={402} y1={y} y2={y} stroke={DIM} strokeDasharray="1 6" strokeLinecap="round" className="flow-dash" />
        <line x1={start} x2={start + pre} y1={y} y2={y} stroke={GREEN} strokeWidth={2.2} />
        {Array.from({ length: tokens }, (_, k) => (
          <circle key={k} cx={start + pre + 11 + k * 14} cy={y} r={2.3} stroke={INK} />
        ))}
      </g>
    );
  });
}

function kvGrid(seed: number) {
  const r = mulberry32(seed);
  const cols = 15;
  const rows = 8;
  const cell = 16;
  const gap = 6;
  const ox = (W - (cols * (cell + gap) - gap)) / 2;
  const oy = (H - (rows * (cell + gap) - gap)) / 2 + 6;
  const cells: ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const v = r();
      const x = ox + col * (cell + gap);
      const y = oy + row * (cell + gap);
      cells.push(
        <rect
          key={`${row}-${col}`}
          x={x}
          y={y}
          width={cell}
          height={cell}
          rx={3}
          fill={v < 0.12 ? GREEN : v < 0.42 ? "rgba(255,255,255,0.5)" : "none"}
          stroke={v < 0.42 ? "none" : "rgba(255,255,255,0.18)"}
        />,
      );
    }
  }
  return (
    <>
      <Label x={ox} y={oy - 12}>KV CACHE · PAGED BLOCKS</Label>
      {cells}
    </>
  );
}

function annotations(seed: number) {
  const r = mulberry32(seed);
  let d = `M18 ${70 + r() * 130}`;
  for (let x = 78; x <= 402; x += 60) d += ` S${x - 30} ${30 + r() * 210} ${x} ${40 + r() * 190}`;
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => (
        <line
          key={`l${i}`}
          x1={18 + r() * 60}
          y1={30 + r() * 210}
          x2={300 + r() * 100}
          y2={30 + r() * 210}
          stroke={DIM}
          strokeDasharray="1 5"
          strokeLinecap="round"
          className="flow-dash"
        />
      ))}
      <path d={d} stroke={INK} strokeWidth={1.1} />
      {Array.from({ length: 7 }, (_, i) => (
        <Marker key={`m${i}`} x={24 + r() * 370} y={24 + r() * 220} />
      ))}
      <rect x={30 + r() * 200} y={40 + r() * 120} width={70} height={52} rx={6} stroke={INK} strokeDasharray="3 3" />
    </>
  );
}

function batch(seed: number) {
  const r = mulberry32(seed);
  return Array.from({ length: 9 }, (_, lane) => {
    const y = 38 + lane * 24;
    const parts: ReactNode[] = [];
    let x = 18 + r() * 30;
    let k = 0;
    while (x < 390) {
      const pre = 10 + r() * 30;
      parts.push(<line key={k++} x1={x} x2={Math.min(400, x + pre)} y1={y} y2={y} stroke={GREEN} strokeWidth={2.2} />);
      x += pre + 6;
      const tokens = 6 + Math.floor(r() * 14);
      for (let t = 0; t < tokens && x < 400; t++, x += 7) {
        parts.push(<line key={k++} x1={x} x2={x} y1={y - 4} y2={y + 4} stroke={INK} strokeWidth={1.2} />);
      }
      x += 8 + r() * 10;
    }
    return <g key={lane}>{parts}</g>;
  });
}

function speedup() {
  return (
    <>
      <Label x={30} y={58}>THROUGHPUT PER GPU</Label>
      <Label x={30} y={100}>BEFORE</Label>
      <rect x={100} y={91} width={130} height={11} rx={2} fill="rgba(255,255,255,0.28)" />
      <Label x={240} y={100} fill={INK}>1.00×</Label>
      <Label x={30} y={136}>AFTER</Label>
      <rect x={100} y={127} width={243} height={11} rx={2} fill={GREEN} />
      <Label x={352} y={136} fill={INK}>1.87×</Label>
      <text x={28} y={222} fill={INK} fontSize={52} style={{ letterSpacing: "-0.02em" }}>
        +87%
      </text>
    </>
  );
}

function gpus() {
  const node = (ox: number, label: string, mig: boolean) => (
    <g>
      <rect x={ox} y={52} width={176} height={174} rx={12} stroke={DIM} />
      <Label x={ox + 12} y={44}>{label}</Label>
      {[0, 1, 2, 3].map((i) => {
        const x = ox + 16 + (i % 2) * 80;
        const y = 68 + Math.floor(i / 2) * 80;
        return mig && i === 3 ? (
          <g key={i}>
            {Array.from({ length: 7 }, (_, s) => (
              <rect key={s} x={x + s * 9.4} y={y} width={7.4} height={66} rx={2} stroke={GREEN} />
            ))}
          </g>
        ) : (
          <rect key={i} x={x} y={y} width={64} height={66} rx={6} stroke={INK} fill="rgba(255,255,255,0.05)" />
        );
      })}
    </g>
  );
  return (
    <>
      {node(20, "NODE 0 · TP=4", false)}
      {node(224, "NODE 1 · MIG", true)}
      <rect x={30} y={62} width={156} height={154} rx={9} stroke={GREEN} strokeDasharray="4 4" />
      <path d="M196 139h24m-6-5l6 5-6 5" stroke={INK} />
      <Label x={190} y={160} fill={INK}>PP</Label>
      <Label x={20} y={250}>NCCL ALL-REDUCE · GPU-AWARE SCHEDULING</Label>
    </>
  );
}

function pods() {
  const rows: [string, string, string][] = [
    ["llm-large-tp4", "4", "Ready"],
    ["llm-small-mig", "1/7", "Ready"],
    ["embedder-mig", "1/7", "Ready"],
    ["reranker", "1", "Scaling"],
    ["llm-large-canary", "4", "Gated"],
  ];
  return (
    <>
      <Label x={24} y={42} fill={INK} size={11}>$ kubectl get inferenceservices</Label>
      <Label x={24} y={74}>NAME</Label>
      <Label x={236} y={74}>GPUS</Label>
      <Label x={306} y={74}>STATE</Label>
      {rows.map(([name, g, state], i) => (
        <g key={name}>
          <Label x={24} y={104 + i * 28} fill={INK}>{name}</Label>
          <Label x={236} y={104 + i * 28} fill={INK}>{g}</Label>
          <circle cx={310} cy={100 + i * 28} r={3} fill={state === "Ready" ? GREEN : INK} />
          <Label x={320} y={104 + i * 28} fill={INK}>{state}</Label>
        </g>
      ))}
    </>
  );
}

function bits() {
  const rows: [string, number, string][] = [
    ["FP16", 1, "2 B"],
    ["FP8", 0.5, "1 B"],
    ["INT8", 0.5, "1 B"],
    ["AWQ·INT4", 0.25, "0.5 B"],
  ];
  return (
    <>
      <Label x={28} y={48}>BYTES PER PARAMETER</Label>
      {rows.map(([name, frac, bytes], i) => (
        <g key={name}>
          <Label x={28} y={92 + i * 42} fill={INK}>{name}</Label>
          <rect
            x={118}
            y={82 + i * 42}
            width={240 * frac}
            height={13}
            rx={2}
            stroke={INK}
            fill={i === 0 ? "none" : "rgba(114,206,123,0.35)"}
          />
          <Label x={124 + 240 * frac} y={93 + i * 42}>{bytes}</Label>
        </g>
      ))}
    </>
  );
}

function spec() {
  const xs = [52, 112, 172, 232, 292, 352];
  return (
    <>
      <Label x={30} y={50}>DRAFT ×6 → TARGET VERIFIES IN 1 PASS</Label>
      <line x1={40} x2={370} y1={118} y2={118} stroke={DIM} strokeDasharray="1 5" strokeLinecap="round" className="flow-dash" />
      {xs.map((x, i) => (
        <g key={x}>
          <path d={`M${x} 100l18 18-18 18-18-18z`} stroke={i < 4 ? GREEN : INK} fill={i < 4 ? "rgba(114,206,123,0.18)" : "none"} opacity={i === 5 ? 0.35 : 1} />
          {i < 4 && <path d={`M${x - 6} ${172}l4 4 8-9`} stroke={GREEN} strokeWidth={1.6} />}
          {i === 4 && <path d={`M${x - 5} ${166}l10 10m0-10l-10 10`} stroke={INK} strokeWidth={1.4} />}
        </g>
      ))}
      <Label x={30} y={226} fill={INK}>4 TOKENS ACCEPTED · 1 FORWARD PASS</Label>
    </>
  );
}

function latency() {
  const bars = Array.from({ length: 30 }, (_, i) => {
    const t = (i + 0.5) / 30;
    /* right-skewed: a fast body with a long tail */
    const h = 150 * Math.exp(-Math.pow(Math.log(t * 6 + 0.2) - 0.35, 2) / 0.32);
    return <rect key={i} x={30 + i * 12} y={214 - h} width={8} height={h} rx={1.5} fill="rgba(255,255,255,0.55)" />;
  });
  const marks: [string, number][] = [
    ["P50", 104],
    ["P95", 254],
    ["P99", 330],
  ];
  return (
    <>
      {bars}
      <line x1={24} x2={400} y1={214} y2={214} stroke={DIM} />
      {marks.map(([label, x]) => (
        <g key={label}>
          <line x1={x} x2={x} y1={40} y2={214} stroke={label === "P99" ? GREEN : INK} strokeDasharray="3 4" />
          <Label x={x + 5} y={50} fill={label === "P99" ? GREEN : INK}>{label}</Label>
        </g>
      ))}
      <Label x={24} y={240}>TTFT DISTRIBUTION</Label>
    </>
  );
}

function gate() {
  const ys = [150, 142, 146, 132, 128, 88, 124, 118, 112];
  const pts = ys.map((y, i) => [36 + i * 44, y] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <>
      <Label x={28} y={44}>P99 TTFT BY BUILD</Label>
      <line x1={24} x2={400} y1={108} y2={108} stroke={GREEN} strokeDasharray="5 4" />
      <Label x={344} y={100} fill={GREEN}>SLO</Label>
      <path d={d} stroke={INK} strokeWidth={1.3} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 5 ? 7 : 3} stroke={i === 5 ? GREEN : INK} fill={i === 5 ? "none" : "#15171a"} />
      ))}
      <Label x={226} y={72} fill={INK}>BLOCKED · REGRESSION</Label>
      <Label x={28} y={236}>EVERY CHANGE PASSES THE HARNESS</Label>
    </>
  );
}

const ART: Record<ArtKind, (seed: number) => ReactNode> = {
  lanes,
  kvGrid,
  annotations,
  batch,
  speedup,
  gpus,
  pods,
  bits,
  spec,
  latency,
  gate,
};

interface StackArtProps {
  kind: ArtKind;
  seed?: number;
  className?: string;
}

export default function StackArt({ kind, seed = 1, className = "" }: StackArtProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`art-layer ${className}`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ART[kind](seed)}
    </svg>
  );
}
