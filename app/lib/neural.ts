import { mulberry32 } from "./motion";

/*
 * NEURAL — a multilayer perceptron with hand-rolled backprop.
 * Zero dependencies, same spirit as wire3d.ts: the demo IS the credential.
 * Coordinates live in [-1, 1]²; labels are 0 | 1.
 */

export interface Sample {
  x: number;
  y: number;
  label: 0 | 1;
}

export type DatasetKind = "spiral" | "moons" | "rings" | "xor";

export const DATASETS: { kind: DatasetKind; label: string }[] = [
  { kind: "spiral", label: "Spiral" },
  { kind: "moons", label: "Moons" },
  { kind: "rings", label: "Rings" },
  { kind: "xor", label: "XOR" },
];

/* ---------------------------------------------------------------- data */

export function makeDataset(kind: DatasetKind, n = 220, seed = 7): Sample[] {
  const rng = mulberry32(seed);
  const noise = () => (rng() - 0.5) * 0.14;
  const samples: Sample[] = [];
  const half = Math.floor(n / 2);

  if (kind === "spiral") {
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < half; i++) {
        const t = (i / half) * 2.4 * Math.PI;
        const r = 0.12 + (i / half) * 0.78;
        const a = t + arm * Math.PI;
        samples.push({
          x: r * Math.cos(a) + noise(),
          y: r * Math.sin(a) + noise(),
          label: arm as 0 | 1,
        });
      }
    }
  } else if (kind === "moons") {
    for (let i = 0; i < half; i++) {
      const t = rng() * Math.PI;
      samples.push({
        x: Math.cos(t) * 0.62 - 0.28 + noise(),
        y: Math.sin(t) * 0.62 - 0.22 + noise(),
        label: 0,
      });
      samples.push({
        x: Math.cos(-t) * 0.62 + 0.28 + noise(),
        y: Math.sin(-t) * 0.62 + 0.22 + noise(),
        label: 1,
      });
    }
  } else if (kind === "rings") {
    for (let i = 0; i < half; i++) {
      const a0 = rng() * Math.PI * 2;
      const r0 = Math.sqrt(rng()) * 0.34;
      samples.push({ x: Math.cos(a0) * r0 + noise() * 0.6, y: Math.sin(a0) * r0 + noise() * 0.6, label: 0 });
      const a1 = rng() * Math.PI * 2;
      const r1 = 0.62 + rng() * 0.24;
      samples.push({ x: Math.cos(a1) * r1 + noise() * 0.6, y: Math.sin(a1) * r1 + noise() * 0.6, label: 1 });
    }
  } else {
    /* xor — four gaussian-ish blobs in opposing quadrants */
    for (let i = 0; i < n; i++) {
      const qx = rng() > 0.5 ? 1 : -1;
      const qy = rng() > 0.5 ? 1 : -1;
      samples.push({
        x: qx * (0.2 + rng() * 0.6),
        y: qy * (0.2 + rng() * 0.6),
        label: (qx * qy > 0 ? 0 : 1) as 0 | 1,
      });
    }
  }
  return samples;
}

/* ----------------------------------------------------------------- mlp */

export const LAYER_SIZES = [2, 8, 8, 1] as const;

/*
 * The training loop mutates weights in place on purpose — this is hot-path
 * numeric code driven at 60fps; the React layer only ever reads snapshots.
 */
export class MLP {
  /* weights[l][j][i]: layer l, output unit j, input unit i */
  weights: number[][][] = [];
  biases: number[][] = [];
  private vWeights: number[][][] = [];
  private vBiases: number[][] = [];
  /* preallocated gradient accumulators — zeroed per step, never reallocated */
  private gWeights: number[][][] = [];
  private gBiases: number[][] = [];
  /* per-unit activations from the latest forward pass, for the graph viz */
  activations: number[][] = [];
  /* SGD minibatch steps taken since the last reset */
  step = 0;

  constructor(seed = 1) {
    this.reset(seed);
  }

  reset(seed = 1): void {
    const rng = mulberry32(seed);
    this.weights = [];
    this.biases = [];
    this.vWeights = [];
    this.vBiases = [];
    this.gWeights = [];
    this.gBiases = [];
    this.step = 0;
    for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
      const fanIn = LAYER_SIZES[l];
      const fanOut = LAYER_SIZES[l + 1];
      const scale = Math.sqrt(2 / (fanIn + fanOut));
      const w: number[][] = [];
      const vw: number[][] = [];
      const gw: number[][] = [];
      for (let j = 0; j < fanOut; j++) {
        const row: number[] = [];
        const vRow: number[] = [];
        for (let i = 0; i < fanIn; i++) {
          row.push((rng() * 2 - 1) * scale * 1.6);
          vRow.push(0);
        }
        w.push(row);
        vw.push(vRow);
        gw.push(new Array(fanIn).fill(0));
      }
      this.weights.push(w);
      this.vWeights.push(vw);
      this.gWeights.push(gw);
      this.biases.push(new Array(fanOut).fill(0));
      this.vBiases.push(new Array(fanOut).fill(0));
      this.gBiases.push(new Array(fanOut).fill(0));
    }
    this.activations = LAYER_SIZES.map((size) => new Array(size).fill(0));
  }

  /* forward pass; stores activations per layer, returns p(label=1) */
  forward(x: number, y: number): number {
    let current = [x, y];
    this.activations[0][0] = x;
    this.activations[0][1] = y;
    for (let l = 0; l < this.weights.length; l++) {
      const w = this.weights[l];
      const b = this.biases[l];
      const isLast = l === this.weights.length - 1;
      const next: number[] = new Array(w.length);
      for (let j = 0; j < w.length; j++) {
        let z = b[j];
        const row = w[j];
        for (let i = 0; i < row.length; i++) z += row[i] * current[i];
        next[j] = isLast ? 1 / (1 + Math.exp(-z)) : Math.tanh(z);
        this.activations[l + 1][j] = next[j];
      }
      current = next;
    }
    return current[0];
  }

  /*
   * One SGD-with-momentum step over a random minibatch.
   * Returns mean binary cross-entropy over the batch.
   */
  trainStep(samples: Sample[], lr: number, batchSize: number, rng: () => number): number {
    if (samples.length === 0) return 0;
    const L = this.weights.length;

    /* zero the preallocated gradient accumulators */
    const gW = this.gWeights;
    const gB = this.gBiases;
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < gW[l].length; j++) {
        gW[l][j].fill(0);
        gB[l][j] = 0;
      }
    }

    let loss = 0;
    const batch = Math.min(batchSize, samples.length);

    for (let s = 0; s < batch; s++) {
      const sample = samples[Math.floor(rng() * samples.length)];
      const p = this.forward(sample.x, sample.y);
      const target = sample.label;
      const eps = 1e-7;
      loss += -(target * Math.log(p + eps) + (1 - target) * Math.log(1 - p + eps));

      /* backprop: sigmoid+BCE collapses to (p - target) at the output */
      let delta = [p - target];
      for (let l = L - 1; l >= 0; l--) {
        const prev = this.activations[l];
        const nextDelta: number[] = new Array(prev.length).fill(0);
        for (let j = 0; j < delta.length; j++) {
          gB[l][j] += delta[j];
          const row = this.weights[l][j];
          for (let i = 0; i < row.length; i++) {
            gW[l][j][i] += delta[j] * prev[i];
            nextDelta[i] += delta[j] * row[i];
          }
        }
        if (l > 0) {
          /* through tanh: dact = 1 - a² */
          for (let i = 0; i < nextDelta.length; i++) {
            const a = this.activations[l][i];
            nextDelta[i] *= 1 - a * a;
          }
        }
        delta = nextDelta;
      }
    }

    /* momentum update */
    const momentum = 0.9;
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.vWeights[l][j][i] = momentum * this.vWeights[l][j][i] - (lr * gW[l][j][i]) / batch;
          this.weights[l][j][i] += this.vWeights[l][j][i];
        }
        this.vBiases[l][j] = momentum * this.vBiases[l][j] - (lr * gB[l][j]) / batch;
        this.biases[l][j] += this.vBiases[l][j];
      }
    }

    this.step++;
    return loss / batch;
  }

  accuracy(samples: Sample[]): number {
    if (samples.length === 0) return 0;
    let hit = 0;
    for (const s of samples) {
      if ((this.forward(s.x, s.y) > 0.5 ? 1 : 0) === s.label) hit++;
    }
    return hit / samples.length;
  }
}
