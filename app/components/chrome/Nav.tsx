"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT } from "../../lib/data";
import { getLenis } from "../../lib/motion";
import "./nav.css";

const LINKS = [
  { href: "#inference", label: "Inference" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

/* past this much scroll, scrolling down tucks the bar away */
const HIDE_AFTER = 120;

/* scroll to a section and move keyboard focus with it, so the next Tab
   continues from there rather than from the link that was pressed */
export function scrollToHash(hash: string): void {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else target.scrollIntoView({ behavior: "auto" });
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  history.replaceState(null, "", hash);
}

/* A plain bar: wordmark, four links, one action. Once the page moves it
   stands on the ground of the section under it (so it never sits on text),
   takes that section's ink, and steps aside while the visitor reads down. */
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [ink, setInk] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-ink]")].filter((el) => el !== navRef.current);
    /* the band the bar sits in: the top few dozen pixels of the screen */
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setInk((entry.target as HTMLElement).dataset.ink === "dark" ? "dark" : "light");
        }
      },
      { rootMargin: "0px 0px -94% 0px" },
    );
    sections.forEach((el) => io.observe(el));

    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setSolid(y > 8);
        if (Math.abs(y - lastY) < 6) return;
        setHidden(y > lastY && y > HIDE_AFTER);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  /* the open menu owns the page: Escape closes it and hands focus back to
     the toggle, and everything behind it is inert meanwhile */
  useEffect(() => {
    const behind = [...document.querySelectorAll<HTMLElement>("main, footer")];
    behind.forEach((el) => (el.inert = menuOpen));
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      behind.forEach((el) => (el.inert = false));
    };
  }, [menuOpen]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToHash(href);
  };

  return (
    <header
      ref={navRef}
      className="nav wrap"
      data-ink-now={ink}
      data-hidden={hidden && !menuOpen}
      data-solid={solid}
      data-menu={menuOpen}
    >
      <a className="nav__mark" href="#top" onClick={(e) => go(e, "#top")}>
        Ashutosh Joshi
      </a>
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map((link) => (
          <a key={link.href} className="nav__link" href={link.href} onClick={(e) => go(e, link.href)}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="nav__action button button--quiet" href={CONTACT.resume} target="_blank" rel="noopener">
        Résumé
      </a>
      <button
        ref={toggleRef}
        type="button"
        className="nav__toggle"
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? "Close" : "Menu"}
      </button>
      <div id="nav-menu" className="nav__menu" inert={!menuOpen}>
        {LINKS.map((link) => (
          <a key={link.href} className="nav__menu-link t-head" href={link.href} onClick={(e) => go(e, link.href)}>
            {link.label}
          </a>
        ))}
        <a className="button nav__menu-action" href={CONTACT.resume} target="_blank" rel="noopener">
          Résumé, PDF
        </a>
      </div>
    </header>
  );
}
