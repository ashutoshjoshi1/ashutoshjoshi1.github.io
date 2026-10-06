"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

interface SectionIntroProps {
  id: string;
  eyebrow?: string;
  /* one entry per visual line — each slides up out of its own mask */
  lines: ReactNode[];
  lead?: ReactNode;
  align?: "center" | "left";
  size?: "display" | "h2";
  children?: ReactNode;
  className?: string;
}

export default function SectionIntro({
  id,
  eyebrow,
  lines,
  lead,
  align = "center",
  size = "h2",
  children,
  className = "",
}: SectionIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: root, start: "top 84%" },
      });
      tl.from("[data-intro-fade]", { opacity: 0, y: 14, duration: 0.9 }, 0)
        .from(".line-inner", { yPercent: 108, duration: 1.15, stagger: 0.09 }, 0.05)
        .from("[data-intro-rise]", { opacity: 0, y: 22, duration: 1, stagger: 0.08 }, 0.3);
    }, root);
    return () => ctx.revert();
  }, []);

  const centered = align === "center";

  return (
    <div
      ref={rootRef}
      className={`${centered ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <p data-intro-fade className="eyebrow mb-5">
          <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 id={id} className={size === "display" ? "display" : "h2"}>
        {lines.map((line, i) => (
          <span key={i} className="line-mask">
            <span className="line-inner">{line}</span>
          </span>
        ))}
      </h2>
      {lead && (
        <p
          data-intro-rise
          className={`lead mt-6 ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}
        >
          {lead}
        </p>
      )}
      {children && (
        <div
          data-intro-rise
          className={`mt-8 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
