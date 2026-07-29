"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../lib/motion";

const ROW_GAP = 34;
const X_STEP = 7;
const BASE_AMP = 52;
const MOUSE_RADIUS = 230;
const MOUSE_AMP = 70;

/*
 * Ridgeline "signal field": stacked waveform rows occluding the rows
 * behind them, amplified near the cursor — raw noise resolving to signal.
 */
export default function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const reduced = prefersReducedMotion();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const wave = (x: number, row: number, t: number): number => {
      return (
        Math.sin(x * 0.004 + t * 0.55 + row * 1.7) * 0.5 +
        Math.sin(x * 0.011 - t * 0.85 + row * 0.4) * 0.32 +
        Math.sin(x * 0.027 + t * 1.6 + row * 2.3) * 0.18
      );
    };

    /* asymmetric twin-peak envelope — a massif left of center, a foothill right */
    const envelope = (x: number): number => {
      const main = Math.exp(-Math.pow((x - width * 0.38) / (width * 0.21), 2));
      const minor = Math.exp(-Math.pow((x - width * 0.78) / (width * 0.13), 2)) * 0.45;
      return main + minor;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      const rows = Math.ceil(height / ROW_GAP) + 2;

      for (let j = 0; j < rows; j++) {
        const baseY = j * ROW_GAP + ROW_GAP * 0.5;
        const isAccent = j % 9 === 4;

        ctx.beginPath();
        ctx.moveTo(-X_STEP, baseY + 2);
        for (let x = -X_STEP; x <= width + X_STEP; x += X_STEP) {
          const env = envelope(x);
          /* cursor boost */
          const dx = x - mouse.x;
          const dy = baseY - mouse.y;
          const md = Math.sqrt(dx * dx + dy * dy);
          const boost = Math.exp(-Math.pow(md / MOUSE_RADIUS, 2)) * MOUSE_AMP;
          const n = wave(x, j, t);
          const amp = BASE_AMP * env + boost;
          ctx.lineTo(x, baseY - (n * 0.5 + 0.5) * amp);
        }
        /* occlude rows behind this one */
        ctx.lineTo(width + X_STEP, baseY + ROW_GAP);
        ctx.lineTo(-X_STEP, baseY + ROW_GAP);
        ctx.closePath();
        ctx.fillStyle = "#06070b";
        ctx.fill();

        ctx.beginPath();
        for (let x = -X_STEP; x <= width + X_STEP; x += X_STEP) {
          const env = envelope(x);
          const dx = x - mouse.x;
          const dy = baseY - mouse.y;
          const md = Math.sqrt(dx * dx + dy * dy);
          const boost = Math.exp(-Math.pow(md / MOUSE_RADIUS, 2)) * MOUSE_AMP;
          const n = wave(x, j, t);
          const amp = BASE_AMP * env + boost;
          const y = baseY - (n * 0.5 + 0.5) * amp;
          if (x === -X_STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        if (isAccent) {
          const pulse = 0.55 + Math.sin(t * 1.4 + j) * 0.3;
          ctx.strokeStyle = `rgba(0, 230, 93, ${pulse})`;
        } else {
          ctx.strokeStyle = "rgba(242, 244, 250, 0.3)";
        }
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      if (running) draw(now * 0.001);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      draw(12);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    observer.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
