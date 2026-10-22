"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CONTACT, HERO } from "../../lib/data";
import { prefersReducedMotion, mulberry32 } from "../../lib/motion";
import { clamp01, drawPixelated, fitCanvas } from "../../lib/pixels";
import Icon from "../ui/Icon";
import Lines from "../motion/Lines";
import { blockAt, cropAt, insetAt, openCrop, windowInset, STACKED_BELOW, type Inset, type Photo } from "./exposure";
import "./hero.css";

/* the black-and-white studio portrait: face centred, on a near-black ground */
const PHOTO: Photo = { width: 1024, height: 1536, focus: { x: 512, y: 620 }, openHeight: 0.78 };
const ZOOM = 1.3;
/* the cells across the first window: few enough to read as a detector */
const CELLS_ACROSS = 15;
const EXPOSURE_MS = 1000;
/* scroll, in viewport heights, over which the window opens */
const OPEN_DESKTOP = 1;
const OPEN_PHONE = 0.7;

const delay = (ms: number): CSSProperties => ({ "--d": `${ms}ms` }) as CSSProperties;

/* The open view is wider than the photo on landscape screens. Rather than
   let a flat black meet the photo's own (slightly lifted) black at a visible
   seam, extend the photo sideways by stretching its outermost columns. */
function extendSideways(img: HTMLImageElement, pad: number): HTMLCanvasElement {
  const { naturalWidth: w, naturalHeight: h } = img;
  const canvas = document.createElement("canvas");
  canvas.width = w + pad * 2;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(img, 0, 0, 1, h, 0, 0, pad, h);
  ctx.drawImage(img, w - 1, 0, 1, h, pad + w, 0, pad, h);
  ctx.drawImage(img, pad, 0);
  return canvas;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const picture = pictureRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !stage || !picture || !img || !canvas || !ctx || prefersReducedMotion()) return;

    const scratch = document.createElement("canvas");
    const rng = mulberry32(5);
    let ready = false;
    let alive = true;
    let progress = 0;
    let exposure = 0;
    let vw = 0;
    let vh = 0;
    let start: Inset = { top: 0, right: 0, bottom: 0, left: 0 };
    let startBlock = 24;
    let frame = 0;
    /* what the canvas reads: the photo, or the photo extended sideways */
    let source: CanvasImageSource = img;
    let pad = 0;

    const render = () => {
      frame = 0;
      const inset = insetAt(start, progress);
      picture.style.clipPath = `inset(${inset.top}px ${inset.right}px ${inset.bottom}px ${inset.left}px)`;
      if (copyRef.current) {
        const fade = clamp01(progress / 0.4);
        copyRef.current.style.opacity = String(1 - fade);
        copyRef.current.style.transform = `translate3d(0, ${(-fade * 48).toFixed(1)}px, 0)`;
        /* gone, not just transparent, once the picture has the screen */
        copyRef.current.style.visibility = fade >= 1 ? "hidden" : "visible";
      }
      if (!ready) return;

      const block = blockAt(startBlock, progress);
      const at = cropAt(PHOTO, vw, vh, ZOOM, progress);
      const crop = { ...at, x: at.x + pad };
      /* only the cells inside the window, snapped to the cell grid so they hold still */
      const cell = Math.max(1, block);
      const x0 = Math.floor(inset.left / cell) * cell;
      const y0 = Math.floor(inset.top / cell) * cell;
      const x1 = Math.min(vw, Math.ceil((vw - inset.right) / cell) * cell);
      const y1 = Math.min(vh, Math.ceil((vh - inset.bottom) / cell) * cell);
      const sx = crop.w / vw;
      const sy = crop.h / vh;
      ctx.clearRect(0, 0, vw, vh);
      drawPixelated(
        ctx,
        source,
        { x: crop.x + x0 * sx, y: crop.y + y0 * sy, w: (x1 - x0) * sx, h: (y1 - y0) * sy },
        { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
        { block, gap: block >= 7 ? Math.max(1, block * 0.07) : 0, exposure, rng, scratch },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    /* only as much extension as this screen's open view needs */
    const prepareSource = () => {
      if (!ready) return;
      const needed = Math.ceil(Math.max(0, -openCrop(PHOTO, vw, vh).x)) + 2;
      if (needed <= 2) {
        source = img;
        pad = 0;
      } else if (needed > pad) {
        pad = needed;
        source = extendSideways(img, pad);
      }
    };

    const measure = () => {
      const { width, height, dpr } = fitCanvas(canvas);
      vw = width;
      vh = height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start = windowInset(vw, vh);
      startBlock = Math.max(10, (vw - start.left - start.right) / CELLS_ACROSS);
      prepareSource();
      render();
    };


    /* the first light: cells integrate from dark noise to the true picture */
    const expose = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        if (!alive) return;
        const t = Math.min(1, (now - t0) / EXPOSURE_MS);
        exposure = 1 - Math.pow(1 - t, 3);
        render();
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    /* scroll-linked and linear: the scrollbar is the easing */
    const openDistance = () => window.innerHeight * (window.innerWidth < STACKED_BELOW ? OPEN_PHONE : OPEN_DESKTOP);
    const onScroll = () => {
      const next = clamp01(-section.getBoundingClientRect().top / openDistance());
      /* past the opening (or before it) nothing changes: don't repaint */
      if (next === progress) return;
      progress = next;
      schedule();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    img
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (!alive) return;
        if (!img.naturalWidth) {
          stage.dataset.exposed = "failed";
          return;
        }
        ready = true;
        stage.dataset.exposed = "true";
        prepareSource();
        expose();
      });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} id="top" className="hero" data-ink="light" aria-labelledby="hero-title">
      <div ref={stageRef} className="hero__stage">
        <div ref={pictureRef} className="hero__picture">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export; the canvas reads this element */}
          <img
            ref={imgRef}
            className="hero__img"
            src={HERO.photo}
            alt={HERO.photoAlt}
            width={PHOTO.width}
            height={PHOTO.height}
            fetchPriority="high"
            decoding="async"
          />
          <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
        </div>

        <div ref={copyRef} className="hero__copy wrap">
          <div className="hero__name">
            <Lines as="h1" id="hero-title" className="hero__title t-head" lines={HERO.name} delay={100} />
            <p className="hero__role t-lead" data-rise style={delay(300)}>
              {HERO.role}
            </p>
          </div>
          <div className="hero__side">
            <p className="hero__lede" data-rise style={delay(420)}>
              {HERO.lede}
            </p>
            <a className="button" href={`mailto:${CONTACT.email}`} data-rise style={delay(500)}>
              Email me
              <Icon name="arrow-right" className="button__arrow" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
