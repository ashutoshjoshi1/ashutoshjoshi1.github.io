"use client";

import { useEffect, useRef } from "react";
import {
  mountWireRenderer,
  icosahedron,
  dish,
  torus,
  waveGrid,
  type WireModel,
} from "../lib/wire3d";
import { prefersReducedMotion } from "../lib/motion";

const MODELS: Record<string, () => WireModel> = {
  icosahedron,
  dish,
  torus,
  waveGrid,
};

interface Wire3DProps {
  model: keyof typeof MODELS;
  className?: string;
  speed?: { x: number; y: number; z: number };
  zoom?: number;
  mouseInfluence?: number;
  /* rotation speed multiplier while a parent is hovered */
  boosted?: boolean;
}

/* reads the live CSS custom properties so models follow theme inversion */
function cssColor(name: string, alpha: number): () => string {
  let cached = "";
  let lastRead = 0;
  return () => {
    const now = performance.now();
    if (now - lastRead > 120 || !cached) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      lastRead = now;
      if (raw.startsWith("#")) {
        const r = parseInt(raw.slice(1, 3), 16);
        const g = parseInt(raw.slice(3, 5), 16);
        const b = parseInt(raw.slice(5, 7), 16);
        cached = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        cached = raw || `rgba(234, 230, 221, ${alpha})`;
      }
    }
    return cached;
  };
}

export default function Wire3D({
  model,
  className,
  speed,
  zoom,
  mouseInfluence,
  boosted = false,
}: Wire3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef<((b: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = mountWireRenderer(
      canvas,
      {
        model: MODELS[model](),
        speed,
        zoom,
        mouseInfluence,
        ink: cssColor("--ink", 1),
        accent: cssColor("--accent", 1),
      },
      prefersReducedMotion(),
    );
    boostRef.current = handle.setBoost;
    return () => handle.destroy();
  }, [model, speed, zoom, mouseInfluence]);

  useEffect(() => {
    boostRef.current?.(boosted ? 1 : 0);
  }, [boosted]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
