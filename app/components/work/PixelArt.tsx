"use client";

import { useEffect, useRef } from "react";
import { mulberry32, prefersReducedMotion } from "../../lib/motion";
import { drawPixelated, fitCanvas } from "../../lib/pixels";
import { Cells, toBitmap } from "./cells";
import { ART_COLS, ART_ROWS, PAINTERS } from "./painters";

const DEVELOP_MS = 600;
/* the coarsest pass merges this many cells per side */
const FIRST_MERGE = 6;

interface PixelArtProps {
  slug: string;
  seed: number;
  label: string;
  className?: string;
}

/* A project's drawing, shown as cells; a new drawing develops from coarse
   merged cells down to its own grid. */
export default function PixelArt({ slug, seed, label, className = "" }: PixelArtProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const paint = PAINTERS[slug];
    if (!canvas || !ctx || !paint) return;

    const cells = new Cells(ART_COLS, ART_ROWS);
    paint(cells, mulberry32(seed));
    const bitmap = toBitmap(cells);
    const scratch = document.createElement("canvas");
    const source = { x: 0, y: 0, w: ART_COLS, h: ART_ROWS };
    let raf = 0;
    let merge = 1;

    const draw = () => {
      const { width, height, dpr } = fitCanvas(canvas);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cell = width / ART_COLS;
      const block = cell * merge;
      drawPixelated(ctx, bitmap, source, { x: 0, y: 0, w: width, h: height }, {
        block,
        gap: Math.max(1, cell * 0.12),
        scratch,
      });
    };

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);

    if (prefersReducedMotion()) {
      draw();
    } else {
      const t0 = performance.now();
      const develop = (now: number) => {
        const t = Math.min(1, (now - t0) / DEVELOP_MS);
        merge = Math.max(1, Math.round(Math.pow(FIRST_MERGE, 1 - (1 - Math.pow(1 - t, 3)))));
        draw();
        if (t < 1) raf = requestAnimationFrame(develop);
      };
      raf = requestAnimationFrame(develop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [slug, seed]);

  return <canvas ref={canvasRef} className={`pixel-art ${className}`} role="img" aria-label={label} />;
}
