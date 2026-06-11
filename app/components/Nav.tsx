"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis, scrambleTo, prefersReducedMotion } from "../lib/motion";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Log", target: "#log" },
  { label: "Rules", target: "#rules" },
  { label: "Stack", target: "#stack" },
  { label: "Contact", target: "#contact" },
];

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* dock hides on the way down, glides back the moment you reverse */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const header = headerRef.current;
    if (!header) return;
    if (prefersReducedMotion()) return;

    let hidden = false;
    const st = ScrollTrigger.create({
      start: 120,
      end: "max",
      onUpdate: (self) => {
        const shouldHide = self.direction === 1;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(header, {
            yPercent: shouldHide ? -110 : 0,
            duration: 0.6,
            ease: "expo.out",
            overwrite: "auto",
          });
        }
      },
      onLeaveBack: () => {
        if (hidden) {
          hidden = false;
          gsap.to(header, { yPercent: 0, duration: 0.6, ease: "expo.out", overwrite: "auto" });
        }
      },
    });

    return () => st.kill();
  }, []);

  const scrollTo = (target: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6 });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onLinkHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion()) return;
    const el = e.currentTarget;
    scrambleTo(el, el.dataset.label ?? el.textContent ?? "", 380);
  };

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-[90] mix-blend-difference text-white">
      <nav
        aria-label="Main navigation"
        className="gutter flex items-center justify-between py-5"
      >
        <button
          onClick={() => scrollTo("#top")}
          className="flex items-baseline gap-2 transition-opacity hover:opacity-60"
          data-cursor="hover"
        >
          <span className="font-mono-ui hidden sm:inline">You can call me</span>
          <span className="font-display italic text-xl leading-none">&ldquo;Ashu&rdquo;</span>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <span className="status-dot" aria-hidden="true" />
          <span className="font-mono-ui">Open to opportunities</span>
          <span className="font-mono-ui opacity-50 ml-4 tabular-nums">{time} LOC</span>
        </div>

        <ul className="flex items-center gap-4 sm:gap-7">
          {LINKS.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => scrollTo(link.target)}
                onMouseEnter={onLinkHover}
                data-label={link.label}
                className="font-mono-ui u-sweep"
                data-cursor="hover"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
