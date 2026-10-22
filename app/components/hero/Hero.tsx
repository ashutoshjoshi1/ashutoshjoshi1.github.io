"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { clockTime, useNow } from "../../hooks/useNow";
import { CONTACT, HERO } from "../../lib/data";
import { prefersReducedMotion } from "../../lib/motion";
import { GODDARD, nextSunrise, sunPosition } from "../../lib/sun";
import Lines from "../motion/Lines";
import Icon from "../ui/Icon";
import { createSkyRenderer, type SkyRenderer } from "./skyRenderer";
import "./hero.css";

/* the visitor can move the sun half a day either way */
const REACH_MIN = 720;
/* dragging across the whole width moves it this far */
const DRAG_MIN = 720;
/* on load the sky runs up to now: from this morning's sunrise while the sun
   is up, from three hours back (dusk) once it has set */
const AFTER_DARK_MIN = 180;
const SWEEP_MS = 2600;
const DAY_MS = 86_400_000;

const at = (now: Date, offsetMin: number) => new Date(now.getTime() + offsetMin * 60_000);
const clampReach = (minutes: number) => Math.max(-REACH_MIN, Math.min(REACH_MIN, minutes));

function sunWords(elevation: number): string {
  const degrees = Math.round(Math.abs(elevation));
  return elevation >= 0 ? `Sun ${degrees}° above the horizon` : `Sun ${degrees}° below the horizon`;
}

/* minutes before now the opening starts from */
function sweepStart(now: Date): number {
  const { lat, lon } = GODDARD;
  if (sunPosition(now, lat, lon).elevation <= 0) return -AFTER_DARK_MIN;
  const sunrise = nextSunrise(new Date(now.getTime() - DAY_MS * 0.75), lat, lon);
  if (!sunrise || sunrise > now) return -AFTER_DARK_MIN;
  return clampReach((sunrise.getTime() - now.getTime()) / 60_000);
}

/* a flat stand-in for the rendered sky, where WebGL is missing */
function flatSky(elevation: number): string {
  if (elevation > 6) return "#284a7e";
  if (elevation > -6) return "#2b3a5c";
  return "#0b1020";
}

/* reads a unitless number set on the hero by its stylesheet */
function cssNumber(el: HTMLElement, name: string, fallback: number): number {
  const value = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

/*
 * The first screen: the sky over NASA Goddard as it is right now, lit by
 * the same physics a Pandora spectrometer measures, with the name over it.
 * Drag across the sky, or use the slider, to move the sun through the day.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SkyRenderer | null>(null);
  const sweepRef = useRef(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; offset: number } | null>(null);
  const now = useNow(60_000);
  const [offset, setOffset] = useState(0);
  const [moved, setMoved] = useState(false);
  const [rendered, setRendered] = useState(true);

  const time = now ? at(now, offset) : null;
  const elevation = time ? sunPosition(time, GODDARD.lat, GODDARD.lon).elevation : 30;

  /* the shader's framing, read from the stylesheet once per resize */
  const framingRef = useRef({ horizon: 0.17, sunX: 0.72 });

  const draw = useCallback(() => {
    rendererRef.current?.render({ ...framingRef.current, sunElevation: elevation });
  }, [elevation]);

  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const renderer = createSkyRenderer(canvas, () => drawRef.current());
    rendererRef.current = renderer;
    if (!renderer) {
      setRendered(false);
      return;
    }
    const ro = new ResizeObserver(() => {
      framingRef.current = {
        horizon: cssNumber(hero, "--horizon", 0.17),
        sunX: cssNumber(hero, "--sun-x", 0.72),
      };
      renderer.resize();
      drawRef.current();
    });
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(draw, [draw]);

  /* the opening: the day so far runs up to now */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const from = sweepStart(new Date());
    const start = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / SWEEP_MS);
      /* in-out, so the sun is seen leaving the horizon before it climbs */
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      setOffset(from * (1 - eased));
      sweepRef.current = k < 1 ? requestAnimationFrame(tick) : 0;
    };
    sweepRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(sweepRef.current);
  }, []);

  const stopSweep = () => {
    cancelAnimationFrame(sweepRef.current);
    sweepRef.current = 0;
  };

  const moveTo = (minutes: number) => {
    stopSweep();
    setOffset(clampReach(minutes));
    setMoved(true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !e.isPrimary || (e.target as HTMLElement).closest("a, button, input, label")) return;
    dragRef.current = { x: e.clientX, offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const width = e.currentTarget.getBoundingClientRect().width;
    moveTo(drag.offset + ((e.clientX - drag.x) / width) * DRAG_MIN);
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  /* the button hides itself, so focus moves on to the slider it belongs to */
  const backToNow = () => {
    stopSweep();
    setOffset(0);
    setMoved(false);
    sliderRef.current?.focus();
  };

  const style = rendered ? undefined : ({ background: flatSky(elevation) } as CSSProperties);

  return (
    <section
      ref={heroRef}
      id="top"
      className="hero"
      data-theme="sky"
      aria-labelledby="hero-title"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="hero__ground" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero__sky" aria-hidden="true" />

      <div className="hero__content wrap">
        <div className="hero__head">
          <Lines as="h1" id="hero-title" className="hero__name t-display" lines={HERO.name} delay={250} />
          <p className="hero__role t-lead sans" data-rise style={{ "--d": "520ms" } as CSSProperties}>
            {HERO.role}
          </p>
        </div>

        <div className="hero__foot">
          <div className="hero__pitch" data-rise style={{ "--d": "640ms" } as CSSProperties}>
            <p className="hero__lede t-lead">{HERO.lede}</p>
            <div className="hero__actions">
              <a className="button" href={`mailto:${CONTACT.email}`}>
                Email Ashutosh
                <Icon name="arrow-right" className="button__arrow" />
              </a>
              <a className="link sans" href={CONTACT.resume} target="_blank" rel="noopener">
                Résumé, PDF
              </a>
            </div>
          </div>

          <div className="hero__readout t-small">
            <p className="hero__where">
              The sky over {GODDARD.name}
              {time && <span className="figures">, {clockTime(time, GODDARD.timeZone)}</span>}
            </p>
            <label className="hero__scrub">
              <span>Move the sun</span>
              <input
                ref={sliderRef}
                type="range"
                min={-REACH_MIN}
                max={REACH_MIN}
                step={5}
                value={Math.round(offset)}
                onChange={(e) => moveTo(Number(e.target.value))}
                aria-valuetext={time ? clockTime(time, GODDARD.timeZone) : undefined}
              />
            </label>
            <button type="button" className="hero__now" onClick={backToNow} hidden={!moved}>
              Back to now
            </button>
            <p className="hero__sun figures">{sunWords(elevation)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
