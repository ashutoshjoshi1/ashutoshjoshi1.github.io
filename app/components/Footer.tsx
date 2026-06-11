"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT } from "../lib/data";
import { splitChars, prefersReducedMotion } from "../lib/motion";

const LINKS = [
  { label: "GitHub", href: CONTACT.github },
  { label: "LinkedIn", href: CONTACT.linkedin },
  { label: "Resume", href: CONTACT.resume },
  { label: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const magnetRef = useRef<HTMLAnchorElement>(null);
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/New_York",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const footer = footerRef.current;
    const title = titleRef.current;
    if (!footer || !title) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const lines = title.querySelectorAll<HTMLElement>("[data-line]");
      const chars: HTMLElement[] = [];
      lines.forEach((line) => chars.push(...splitChars(line)));
      gsap.set(chars, { yPercent: 130 });
      gsap.to(chars, {
        yPercent: 0,
        duration: 1.15,
        ease: "expo.out",
        stagger: 0.03,
        scrollTrigger: { trigger: title, start: "top 88%" },
      });
    }, footer);

    return () => ctx.revert();
  }, []);

  /* magnetic email button */
  useEffect(() => {
    const magnet = magnetRef.current;
    if (!magnet) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(magnet, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(magnet, "y", { duration: 0.4, ease: "power3.out" });
    const onMove = (e: MouseEvent) => {
      const rect = magnet.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        xTo(dx * 0.28);
        yTo(dy * 0.28);
      } else {
        xTo(0);
        yTo(0);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <footer id="contact" ref={footerRef} className="hairline-t relative overflow-hidden">
      <div className="gutter pb-12 pt-[var(--section)]">
        <p className="font-mono-ui text-dim mb-10">
          <span className="text-accent">(04)</span> — Contact / Transmission open
        </p>

        <h2
          ref={titleRef}
          aria-label="Let's make signal."
          className="leading-[0.9] tracking-[-0.03em]"
          style={{ fontSize: "var(--text-hero)" }}
        >
          <span data-line className="block font-sans font-medium uppercase">
            Let&apos;s make
          </span>
          <span data-line className="block font-display italic lowercase text-accent">
            signal.
          </span>
        </h2>

        <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <a
            ref={magnetRef}
            href={`mailto:${CONTACT.email}`}
            data-cursor="hover"
            className="inline-flex w-fit items-center gap-4 border border-[var(--line)] px-7 py-4 font-mono-ui transition-colors duration-300 hover:border-[var(--accent)] hover:text-accent"
          >
            <span className="status-dot" aria-hidden="true" />
            {CONTACT.email}
          </a>

          <ul className="flex flex-wrap items-center gap-7">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") || link.href.endsWith(".pdf") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="font-mono-ui u-sweep"
                  data-cursor="hover"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gutter hairline-t flex flex-wrap items-center justify-between gap-3 py-5">
        <span className="font-mono-ui text-dim">© 2026 Ashutosh Joshi</span>
        <span className="font-mono-ui text-dim hidden sm:inline">
          {CONTACT.location} — {CONTACT.coords}
        </span>
        <span className="font-mono-ui text-dim tabular-nums">{time} EST</span>
        <span className="font-mono-ui text-dim">Signal from noise</span>
      </div>
    </footer>
  );
}
