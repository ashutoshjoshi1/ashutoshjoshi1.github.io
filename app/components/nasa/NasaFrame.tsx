"use client";

import { useEffect, useRef } from "react";
import { FLEET_PICTURES, type FleetPicture } from "../../lib/data";
import { mulberry32, prefersReducedMotion } from "../../lib/motion";
import { drawPixelated, fitCanvas } from "../../lib/pixels";
import { drawFleet, drawSky, drawSpectrum, drawTrace } from "./drawings";

const DEVELOP_MS = 650;
const FIRST_BLOCK = 30;
const PICTURES: FleetPicture[] = ["trace", "sky", "fleet", "spectrum"];

type Draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

interface NasaFrameProps {
  active: FleetPicture;
}

/* The held picture beside the list of NASA systems: four drawings, one per
   kind of system. A change of picture develops: the new one arrives as
   coarse cells and resolves. */
export default function NasaFrame({ active }: NasaFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Partial<Record<FleetPicture, HTMLCanvasElement | null>>>({});
  const developRef = useRef<HTMLCanvasElement>(null);

  /* draw every picture at the frame's size, and again when it changes */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const paint = () => {
      const font = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif";
      const draws: Record<FleetPicture, Draw> = {
        trace: drawTrace,
        sky: drawSky,
        fleet: drawFleet,
        spectrum: (ctx, w, h) => drawSpectrum(ctx, w, h, font),
      };
      for (const picture of PICTURES) {
        const canvas = layerRefs.current[picture];
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) continue;
        const { width, height, dpr } = fitCanvas(canvas);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draws[picture](ctx, width, height);
      }
    };
    const ro = new ResizeObserver(paint);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  /* a new picture: switch underneath, then develop over it */
  useEffect(() => {
    const overlay = developRef.current;
    const octx = overlay?.getContext("2d");
    const source = layerRefs.current[active];
    if (prefersReducedMotion() || !overlay || !octx || !source?.width) return;

    const { width, height, dpr } = fitCanvas(overlay);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const crop = { x: 0, y: 0, w: source.width, h: source.height };
    const scratch = document.createElement("canvas");
    const rng = mulberry32(11);
    const t0 = performance.now();
    let raf = 0;
    const develop = (now: number) => {
      const t = Math.min(1, (now - t0) / DEVELOP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const block = Math.pow(FIRST_BLOCK, 1 - eased);
      octx.clearRect(0, 0, width, height);
      if (t >= 1) return;
      drawPixelated(octx, source, crop, { x: 0, y: 0, w: width, h: height }, {
        block,
        gap: block >= 7 ? Math.max(1, block * 0.08) : 0,
        exposure: 0.55 + 0.45 * eased,
        rng,
        scratch,
      });
      raf = requestAnimationFrame(develop);
    };
    raf = requestAnimationFrame(develop);
    return () => {
      cancelAnimationFrame(raf);
      octx.clearRect(0, 0, width, height);
    };
  }, [active]);

  return (
    <figure className="nasa__figure">
      <div ref={frameRef} className="nasa__frame">
        {PICTURES.map((picture) => (
          <canvas
            key={picture}
            ref={(el) => {
              layerRefs.current[picture] = el;
            }}
            className="nasa__layer"
            data-on={String(picture === active)}
            role="img"
            aria-label={FLEET_PICTURES[picture].alt}
          />
        ))}
        <canvas ref={developRef} className="nasa__develop" aria-hidden="true" />
      </div>
      <figcaption className="nasa__caption t-small">{FLEET_PICTURES[active].caption}</figcaption>
    </figure>
  );
}
