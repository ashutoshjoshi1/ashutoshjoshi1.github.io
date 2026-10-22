"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT, HERO } from "../../lib/data";
import { prefersReducedMotion, mulberry32 } from "../../lib/motion";
import { clamp01, drawPixelated, fitCanvas } from "../../lib/pixels";
import Icon from "../ui/Icon";
import Lines from "../motion/Lines";
import { blockAt, cropAt, insetAt, windowInset, type Inset, type Photo } from "./exposure";
import "./hero.css";

const PHOTO: Photo = { width: 1370, height: 1954, focus: { x: 1010, y: 1330 }, landscapeY: 0.69 };
const ZOOM = 1.5;
/* the cells across the first window: few enough to read as a detector */
const CELLS_ACROSS = 15;
const EXPOSURE_MS = 1000;
/* scroll, in viewport heights, over which the window opens */
const OPEN_DESKTOP = 1;
const OPEN_PHONE = 0.7;

const delay = (ms: number): CSSProperties => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const picture = pictureRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !stage || !picture || !img || !canvas || !ctx || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);
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

    const render = () => {
      frame = 0;
      const inset = insetAt(start, progress);
      picture.style.clipPath = `inset(${inset.top}px ${inset.right}px ${inset.bottom}px ${inset.left}px)`;
      if (copyRef.current) {
        const fade = clamp01(progress / 0.4);
        copyRef.current.style.opacity = String(1 - fade);
        copyRef.current.style.transform = `translate3d(0, ${(-fade * 48).toFixed(1)}px, 0)`;
      }
      if (captionRef.current) captionRef.current.style.opacity = String(clamp01((progress - 0.92) / 0.08));
      if (!ready) return;

      const block = blockAt(startBlock, progress);
      const crop = cropAt(PHOTO, vw, vh, ZOOM, progress);
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
        img,
        { x: crop.x + x0 * sx, y: crop.y + y0 * sy, w: (x1 - x0) * sx, h: (y1 - y0) * sy },
        { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
        { block, gap: block >= 7 ? Math.max(1, block * 0.07) : 0, exposure, rng, scratch },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const measure = () => {
      const { width, height, dpr } = fitCanvas(canvas);
      vw = width;
      vh = height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start = windowInset(vw, vh);
      startBlock = Math.max(10, (vw - start.left - start.right) / CELLS_ACROSS);
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

    const openDistance = () => window.innerHeight * (window.innerWidth < 700 ? OPEN_PHONE : OPEN_DESKTOP);
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${openDistance()}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress = self.progress;
        schedule();
      },
    });

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
        expose();
      });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      trigger.kill();
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
          <Lines as="h1" id="hero-title" className="hero__title t-head" lines={HERO.name} delay={100} />
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

        <p ref={captionRef} className="hero__caption wrap t-small">
          {HERO.caption}
        </p>
      </div>
    </section>
  );
}
