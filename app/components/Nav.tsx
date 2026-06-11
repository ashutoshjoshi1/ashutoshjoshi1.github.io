"use client";

import { useEffect, useState } from "react";
import { getLenis } from "../lib/motion";

const LINKS = [
  { label: "Work", target: "#work" },
  { label: "Log", target: "#log" },
  { label: "Stack", target: "#stack" },
  { label: "Contact", target: "#contact" },
];

export default function Nav() {
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

  const scrollTo = (target: string) => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6 });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[90] mix-blend-difference text-white">
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

        <ul className="flex items-center gap-5 sm:gap-7">
          {LINKS.map((link) => (
            <li key={link.label}>
              <button
                onClick={() => scrollTo(link.target)}
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
