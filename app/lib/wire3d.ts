/*
 * Tiny zero-dependency 3D wireframe engine.
 * Procedural point/edge models of "instrument" objects, perspective-projected
 * onto 2D canvas with depth-faded strokes. ~2kb instead of three.js.
 */

export type Vec3 = [number, number, number];
export type Edge = [number, number];

export interface WireModel {
  points: Vec3[];
  edges: Edge[];
  /* edge indices drawn in accent color */
  accents: Set<number>;
  /* optional time-based displacement, applied before rotation */
  morph?: (p: Vec3, t: number) => Vec3;
}

/* ---- models ------------------------------------------------------------ */

/* Icosahedron — pure structure. */
export function icosahedron(): WireModel {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const scale = 1 / Math.sqrt(1 + phi * phi);
  const points = raw.map((p) => p.map((v) => v * scale) as Vec3);

  const edges: Edge[] = [];
  const threshold = 2.1 * scale;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(
        points[i][0] - points[j][0],
        points[i][1] - points[j][1],
        points[i][2] - points[j][2],
      );
      if (d < threshold) edges.push([i, j]);
    }
  }
  return { points, edges, accents: new Set([0, 7, 14, 21, 28]) };
}

/* Parabolic dish + feed mast — the Pandora spectrometer made of lines. */
export function dish(): WireModel {
  const points: Vec3[] = [];
  const edges: Edge[] = [];
  const RINGS = 5;
  const SPOKES = 12;

  /* concentric rings on a paraboloid z = 0.55 r^2 */
  for (let r = 1; r <= RINGS; r++) {
    const radius = r / RINGS;
    const z = 0.55 * radius * radius - 0.35;
    for (let s = 0; s < SPOKES; s++) {
      const a = (s / SPOKES) * Math.PI * 2;
      points.push([Math.cos(a) * radius, Math.sin(a) * radius, z]);
    }
  }
  /* ring edges */
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SPOKES; s++) {
      edges.push([r * SPOKES + s, r * SPOKES + ((s + 1) % SPOKES)]);
    }
  }
  /* radial spokes */
  const center = points.length;
  points.push([0, 0, -0.35]);
  for (let s = 0; s < SPOKES; s++) {
    edges.push([center, s]);
    for (let r = 0; r < RINGS - 1; r++) {
      edges.push([r * SPOKES + s, (r + 1) * SPOKES + s]);
    }
  }
  /* feed mast rising from the center to the focal point */
  const mastBase = center;
  const focal = points.length;
  points.push([0, 0, 0.55]);
  edges.push([mastBase, focal]);
  /* tripod legs from focal point to inner ring */
  for (let s = 0; s < 3; s++) {
    edges.push([focal, s * 4]);
  }

  const accents = new Set<number>();
  /* outermost ring + mast in accent */
  for (let s = 0; s < SPOKES; s++) accents.add((RINGS - 1) * SPOKES + s);
  accents.add(edges.length - 4);
  return { points, edges, accents };
}

/* Torus — the feedback loop. */
export function torus(): WireModel {
  const points: Vec3[] = [];
  const edges: Edge[] = [];
  const U = 16;
  const V = 8;
  const R = 0.72;
  const r = 0.3;

  for (let u = 0; u < U; u++) {
    const a = (u / U) * Math.PI * 2;
    for (let v = 0; v < V; v++) {
      const b = (v / V) * Math.PI * 2;
      points.push([
        (R + r * Math.cos(b)) * Math.cos(a),
        (R + r * Math.cos(b)) * Math.sin(a),
        r * Math.sin(b),
      ]);
    }
  }
  const accents = new Set<number>();
  for (let u = 0; u < U; u++) {
    for (let v = 0; v < V; v++) {
      const i = u * V + v;
      edges.push([i, u * V + ((v + 1) % V)]);
      const j = ((u + 1) % U) * V + v;
      if (v === 0) accents.add(edges.length);
      edges.push([i, j]);
    }
  }
  return { points, edges, accents };
}

/* Wave grid — the signal itself, rippling in time. */
export function waveGrid(): WireModel {
  const points: Vec3[] = [];
  const edges: Edge[] = [];
  const N = 11;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      points.push([(i / (N - 1)) * 2 - 1, (j / (N - 1)) * 2 - 1, 0]);
    }
  }
  const accents = new Set<number>();
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const idx = i * N + j;
      if (j < N - 1) {
        if (i === Math.floor(N / 2)) accents.add(edges.length);
        edges.push([idx, idx + 1]);
      }
      if (i < N - 1) edges.push([idx, idx + N]);
    }
  }
  return {
    points,
    edges,
    accents,
    morph: ([x, y]: Vec3, t: number): Vec3 => [
      x,
      y,
      Math.sin(x * 3.2 + t * 1.6) * 0.16 + Math.sin(y * 2.4 - t * 1.1) * 0.12,
    ],
  };
}

/* ---- renderer ----------------------------------------------------------- */

export interface WireRendererOptions {
  model: WireModel;
  /* base radians/second around each axis */
  speed?: { x: number; y: number; z: number };
  /* how much the cursor steers rotation (0 disables) */
  mouseInfluence?: number;
  /* extra world-scale multiplier */
  zoom?: number;
  ink: () => string;
  accent: () => string;
}

interface RendererHandle {
  destroy: () => void;
  /* hover boost — multiplies rotation speed, eased internally */
  setBoost: (b: number) => void;
}

const FOV = 3.4;

export function mountWireRenderer(
  canvas: HTMLCanvasElement,
  opts: WireRendererOptions,
  reducedMotion: boolean,
): RendererHandle {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy: () => undefined, setBoost: () => undefined };

  const { model, speed = { x: 0.18, y: 0.32, z: 0.06 }, mouseInfluence = 0.55, zoom = 1 } = opts;
  let width = 0;
  let height = 0;
  let raf = 0;
  let running = true;
  let boost = 0;
  let boostEased = 0;
  const mouse = { x: 0, y: 0, ex: 0, ey: 0 };
  const rot = { x: 0, y: 0, z: 0 };
  let last = performance.now();

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const projected: [number, number, number][] = model.points.map(() => [0, 0, 0]);

  const draw = (t: number, dt: number) => {
    ctx.clearRect(0, 0, width, height);

    boostEased += (boost - boostEased) * 0.06;
    mouse.ex += (mouse.x - mouse.ex) * 0.05;
    mouse.ey += (mouse.y - mouse.ey) * 0.05;

    const mul = 1 + boostEased * 2.2;
    rot.x += speed.x * dt * mul;
    rot.y += speed.y * dt * mul;
    rot.z += speed.z * dt * mul;

    const rx = rot.x + mouse.ey * mouseInfluence;
    const ry = rot.y + mouse.ex * mouseInfluence;

    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const cosZ = Math.cos(rot.z), sinZ = Math.sin(rot.z);
    const size = Math.min(width, height) * 0.36 * zoom;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < model.points.length; i++) {
      let [x, y, z] = model.morph ? model.morph(model.points[i], t) : model.points[i];
      /* rotate Z, X, Y */
      let nx = x * cosZ - y * sinZ;
      let ny = x * sinZ + y * cosZ;
      x = nx; y = ny;
      ny = y * cosX - z * sinX;
      let nz = y * sinX + z * cosX;
      y = ny; z = nz;
      nx = x * cosY + z * sinY;
      nz = -x * sinY + z * cosY;
      x = nx; z = nz;

      const persp = FOV / (FOV + z);
      projected[i][0] = cx + x * persp * size;
      projected[i][1] = cy + y * persp * size;
      projected[i][2] = z;
    }

    const ink = opts.ink();
    const accent = opts.accent();
    for (let e = 0; e < model.edges.length; e++) {
      const [a, b] = model.edges[e];
      const pa = projected[a];
      const pb = projected[b];
      const depth = (pa[2] + pb[2]) / 2;
      /* depth ∈ roughly [-1, 1] → alpha fade for far edges */
      const alpha = 0.16 + (1 - (depth + 1) / 2) * 0.6;
      const isAccent = model.accents.has(e);
      ctx.strokeStyle = isAccent ? accent : ink;
      ctx.globalAlpha = isAccent ? Math.min(1, alpha + 0.25 + boostEased * 0.4) : alpha;
      ctx.lineWidth = isAccent ? 1.3 : 1;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (running) draw(now * 0.001, dt);
    raf = requestAnimationFrame(loop);
  };

  const onMove = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  resize();
  if (reducedMotion) {
    rot.x = 0.6;
    rot.y = 0.8;
    draw(2, 0);
  } else {
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
  }

  const observer = new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
  });
  observer.observe(canvas);
  window.addEventListener("resize", resize);

  return {
    destroy: () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    },
    setBoost: (b: number) => {
      boost = b;
    },
  };
}
