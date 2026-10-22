"use client";

import { useEffect, useRef } from "react";
import { FLEET_PICTURES, type FleetPicture } from "../../lib/data";
import { mulberry32, prefersReducedMotion } from "../../lib/motion";
import { coverCrop, drawPixelated, fitCanvas } from "../../lib/pixels";
import { classifySky, drawSkyMask, drawSpectrum } from "./drawings";

const DEVELOP_MS = 650;
const SWEEP_MS = 1100;
const FIRST_BLOCK = 30;
/* cells across the frame for the sky classifier */
const MASK_COLS = 28;

type Drawable = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

function naturalSize(el: Drawable): { w: number; h: number } | null {
  if (el instanceof HTMLImageElement) return el.naturalWidth ? { w: el.naturalWidth, h: el.naturalHeight } : null;
  if (el instanceof HTMLVideoElement) return el.readyState >= 2 ? { w: el.videoWidth, h: el.videoHeight } : null;
  return el.width ? { w: el.width, h: el.height } : null;
}

interface NasaFrameProps {
  active: FleetPicture;
}

/* The held picture beside the list of NASA systems. A change of picture
   develops: the new one arrives as coarse cells and resolves. */
export default function NasaFrame({ active }: NasaFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const roofRef = useRef<HTMLImageElement>(null);
  const globeRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const developRef = useRef<HTMLCanvasElement>(null);
  const skyRef = useRef<{ mask: Uint8Array; cols: number; rows: number } | null>(null);
  const inViewRef = useRef(false);

  /* draw what is drawn rather than loaded, and keep it sized */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const paint = () => {
      const spectrum = spectrumRef.current;
      const sctx = spectrum?.getContext("2d");
      if (spectrum && sctx) {
        const { width, height, dpr } = fitCanvas(spectrum);
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const font = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif";
        drawSpectrum(sctx, width, height, font);
      }
      const roof = roofRef.current;
      if (roof?.naturalWidth) {
        const rect = frame.getBoundingClientRect();
        const cols = MASK_COLS;
        const rows = Math.round(cols * (rect.height / rect.width));
        skyRef.current = { mask: classifySky(roof, cols, rows, rect.width / rect.height), cols, rows };
      }
    };
    const ro = new ResizeObserver(paint);
    ro.observe(frame);
    roofRef.current?.decode().then(paint, () => undefined);
    const io = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry?.isIntersecting ?? false;
      const video = videoRef.current;
      if (!video) return;
      if (inViewRef.current && video.dataset.on === "true" && !prefersReducedMotion()) video.play().catch(() => undefined);
      else video.pause();
    });
    io.observe(frame);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  /* a new picture: switch underneath, develop over it, then sweep the mask */
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const video = videoRef.current;
    if (video) {
      if (active === "video" && inViewRef.current && !reduced) video.play().catch(() => undefined);
      else video.pause();
    }

    const overlay = developRef.current;
    const octx = overlay?.getContext("2d");
    const sources: Record<FleetPicture, Drawable | null> = {
      video: videoRef.current,
      sky: roofRef.current,
      roof: roofRef.current,
      globe: globeRef.current,
      spectrum: spectrumRef.current,
    };
    const source = sources[active];
    const size = source ? naturalSize(source) : null;
    let raf = 0;
    let alive = true;

    const sweepMask = () => {
      const canvas = maskRef.current;
      const mctx = canvas?.getContext("2d");
      const sky = skyRef.current;
      if (!canvas || !mctx || !sky) return;
      const { width, height, dpr } = fitCanvas(canvas);
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) {
        drawSkyMask(mctx, sky.mask, sky.cols, sky.rows, width, height, 1);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        if (!alive) return;
        const t = Math.min(1, (now - t0) / SWEEP_MS);
        drawSkyMask(mctx, sky.mask, sky.cols, sky.rows, width, height, t);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (reduced || !overlay || !octx || !source || !size) {
      if (active === "sky") sweepMask();
      return () => {
        alive = false;
        cancelAnimationFrame(raf);
      };
    }

    const { width, height, dpr } = fitCanvas(overlay);
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const crop = coverCrop(size.w, size.h, width / height);
    const scratch = document.createElement("canvas");
    const rng = mulberry32(11);
    const t0 = performance.now();
    const develop = (now: number) => {
      if (!alive) return;
      const t = Math.min(1, (now - t0) / DEVELOP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const block = Math.pow(FIRST_BLOCK, 1 - eased);
      octx.clearRect(0, 0, width, height);
      if (t < 1) {
        drawPixelated(octx, source, crop, { x: 0, y: 0, w: width, h: height }, {
          block,
          gap: block >= 7 ? Math.max(1, block * 0.08) : 0,
          exposure: 0.55 + 0.45 * eased,
          rng,
          scratch,
        });
        raf = requestAnimationFrame(develop);
      } else if (active === "sky") {
        sweepMask();
      }
    };
    raf = requestAnimationFrame(develop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      octx.clearRect(0, 0, width, height);
    };
  }, [active]);

  const on = (key: FleetPicture | FleetPicture[]) => String(Array.isArray(key) ? key.includes(active) : key === active);

  return (
    <figure className="nasa__figure">
      <div ref={frameRef} className="nasa__frame">
        <video
          ref={videoRef}
          className="nasa__layer"
          data-on={on("video")}
          src={FLEET_PICTURES.video.src}
          poster={FLEET_PICTURES.video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={FLEET_PICTURES.video.alt}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, read by canvas */}
        <img
          ref={roofRef}
          className="nasa__layer"
          data-on={on(["sky", "roof"])}
          src={FLEET_PICTURES.roof.src}
          alt={FLEET_PICTURES.roof.alt}
          width={568}
          height={710}
          loading="lazy"
          decoding="async"
        />
        <canvas ref={maskRef} className="nasa__layer nasa__mask" data-on={on("sky")} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, read by canvas */}
        <img
          ref={globeRef}
          className="nasa__layer nasa__layer--globe"
          data-on={on("globe")}
          src={FLEET_PICTURES.globe.src}
          alt={FLEET_PICTURES.globe.alt}
          width={1024}
          height={576}
          loading="lazy"
          decoding="async"
        />
        <canvas
          ref={spectrumRef}
          className="nasa__layer"
          data-on={on("spectrum")}
          role="img"
          aria-label={FLEET_PICTURES.spectrum.alt}
        />
        <canvas ref={developRef} className="nasa__develop" aria-hidden="true" />
      </div>
      <figcaption className="nasa__caption t-small">{FLEET_PICTURES[active].caption}</figcaption>
    </figure>
  );
}
