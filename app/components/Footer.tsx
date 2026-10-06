"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Mark } from "./Icons";
import WebVitals from "./WebVitals";
import { scrollToHash } from "./Button";
import { CONTACT, PROFILE } from "../lib/data";

const SECTIONS = [
  { label: "Serving", href: "#serving" },
  { label: "Serving lab", href: "#serving-lab" },
  { label: "NASA", href: "#systems" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Lab", href: "#lab" },
  { label: "Ask", href: "#ask" },
];

const ELSEWHERE = [
  { label: "GitHub", href: CONTACT.github },
  { label: "LinkedIn", href: CONTACT.linkedin },
  { label: "Résumé (PDF)", href: CONTACT.resume },
];

const linkClass = "text-dim transition-colors duration-300 hover:text-ink";

export default function Footer() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/New_York",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 15000);
    return () => window.clearInterval(id);
  }, []);

  const onSection = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <footer className="gutter bg-sheet pb-10 pt-20" data-nav="light">
      <div className="grid gap-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <a href="#top" onClick={(e) => onSection(e, "#top")} className="flex items-center gap-2.5 text-lg">
            <Mark />
            ashutosh joshi
          </a>
          <p className="mt-4 max-w-xs text-dim">
            {PROFILE.role}. LLM inference, GPU systems and production ML.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Sections</p>
          <ul className="space-y-2.5">
            {SECTIONS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={(e) => onSection(e, link.href)} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Elsewhere</p>
          <ul className="space-y-2.5">
            {ELSEWHERE.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2.5">
            <li>
              <a href={`mailto:${CONTACT.email}`} className={`${linkClass} break-all`}>
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className={linkClass}>
                {CONTACT.phone}
              </a>
            </li>
            <li className="text-dim">
              {CONTACT.location} · <span className="tabular-nums">{time}</span> ET
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-14 border-t border-line pt-6">
        <WebVitals />
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-4 text-sm text-faint">
        <span>© 2026 {PROFILE.name}</span>
        <span>Built with Next.js, GSAP and Lenis. No templates.</span>
      </div>
    </footer>
  );
}
