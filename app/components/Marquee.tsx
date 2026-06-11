"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

const ITEMS = [
  "Signal from noise",
  "NASA Pandora network",
  "AI systems",
  "Multi-agent",
  "C++ / Python / TypeScript",
  "Full-stack",
];

const BASE_SPEED = 2.6; /* %/s of track width */
const VELOCITY_GAIN = 6.5;

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  /* scroll-coupled marquee: speed surges with scroll velocity and the
     belt reverses direction when you scroll back up */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const track = trackRef.current;
    if (!track) return;

    if (prefersReducedMotion()) return;

    let xp = 0;
    let direction = -1;
    const surge = { v: 0 };
    const setX = gsap.quickSetter(track, "xPercent");
    const wrap = gsap.utils.wrap(-50, 0);

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (v > 30) direction = -1;
        else if (v < -30) direction = 1;
        surge.v = gsap.utils.clamp(0, 9, Math.abs(v) / 240);
        gsap.to(surge, { v: 0, duration: 0.9, ease: "power3", overwrite: true });
      },
    });

    const tick = (_time: number, deltaMs: number) => {
      xp = wrap(xp + direction * (BASE_SPEED + surge.v * VELOCITY_GAIN) * (deltaMs / 1000));
      setX(xp);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`whitespace-nowrap px-6 text-2xl sm:text-3xl ${
              i % 2 === 0 ? "font-display italic" : "font-sans uppercase tracking-tight"
            }`}
          >
            {item}
          </span>
          <span className="text-accent" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="hairline-t hairline-b overflow-hidden py-5" role="presentation">
      <div ref={trackRef} className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
