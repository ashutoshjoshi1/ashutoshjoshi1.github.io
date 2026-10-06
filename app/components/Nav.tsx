"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button, { scrollToHash } from "./Button";
import { Icon, Mark } from "./Icons";
import { CONTACT } from "../lib/data";
import { getLenis, prefersReducedMotion } from "../lib/motion";

const LINKS = [
  { label: "Serving", href: "#serving" },
  { label: "NASA", href: "#systems" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Lab", href: "#lab" },
];

type Theme = "light" | "dark";

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pendingHashRef = useRef<string | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [menuOpen, setMenuOpen] = useState(false);

  /* a link tapped inside the menu scrolls only once the menu has unmounted:
     its cleanup restarts Lenis, which would cancel a scroll already running */
  useEffect(() => {
    if (menuOpen || !pendingHashRef.current) return;
    const hash = pendingHashRef.current;
    pendingHashRef.current = null;
    scrollToHash(hash);
  }, [menuOpen]);

  /* match the section underneath: probe what sits below the bar */
  useEffect(() => {
    let raf = 0;
    let current: Theme = "light";
    const probe = () => {
      raf = 0;
      const header = headerRef.current;
      if (!header) return;
      const y = Math.max(1, header.getBoundingClientRect().bottom - 8);
      const below = document
        .elementsFromPoint(window.innerWidth / 2, y)
        .find((el) => !header.contains(el));
      const host = below?.closest<HTMLElement>("[data-nav]");
      const next: Theme = host?.dataset.nav === "dark" ? "dark" : "light";
      if (next !== current) {
        current = next;
        setTheme(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* the bar slides away on the way down and returns the moment you reverse */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const header = headerRef.current;
    if (!header || prefersReducedMotion()) return;

    let hidden = false;
    const show = (visible: boolean) => {
      if (hidden === !visible) return;
      hidden = !visible;
      gsap.to(header, { yPercent: visible ? 0 : -100, duration: 0.6, ease: "expo.out", overwrite: "auto" });
    };
    const st = ScrollTrigger.create({
      start: 160,
      end: "max",
      onUpdate: (self) => show(self.direction !== 1),
      onLeaveBack: () => show(true),
    });
    return () => st.kill();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (menuOpen) {
      pendingHashRef.current = href;
      setMenuOpen(false);
      return;
    }
    scrollToHash(href);
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const dark = theme === "dark";

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-[90] backdrop-blur-md transition-colors duration-500 ${
          dark ? "theme-dark bg-black/70" : "bg-white/85"
        }`}
      >
        <nav aria-label="Main navigation" className="gutter flex h-[4.5rem] items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <a href="#top" onClick={(e) => go(e, "#top")} className="flex items-center gap-2.5 text-[1.05rem] text-ink">
              <Mark size={20} />
              ashutosh joshi
            </a>
            <ul className="hidden items-center gap-7 lg:flex">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className="text-[0.95rem] text-ink transition-opacity duration-300 hover:opacity-55"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-2">
            <Button href={CONTACT.resume} variant="ghost" size="sm" icon={null} reveal={false} className="hidden sm:inline-flex">
              Résumé
            </Button>
            <Button href="#contact" variant="solid" size="sm" icon={null} reveal={false}>
              Contact
            </Button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid h-10 w-10 place-items-center rounded-[var(--radius-button)] border border-line text-ink lg:hidden"
            >
              <Icon name="menu" />
            </button>
          </div>
        </nav>
      </header>
      {menuOpen && <MobileMenu onClose={closeMenu} onNavigate={go} />}
    </>
  );
}

interface MobileMenuProps {
  onClose: () => void;
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function MobileMenu({ onClose, onNavigate }: MobileMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    getLenis()?.stop();
    root.querySelector<HTMLAnchorElement>("a")?.focus();

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7 })
        .from("[data-menu-item]", { yPercent: 60, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.12);
    }, root);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      getLenis()?.start();
      ctx.revert();
    };
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="theme-dark fixed inset-0 z-[95] flex flex-col bg-black px-[var(--gutter)] pb-10 lg:hidden"
    >
      <div className="flex h-[4.5rem] items-center justify-between">
        <span className="flex items-center gap-2.5 text-[1.05rem]">
          <Mark size={20} />
          ashutosh joshi
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid h-10 w-10 place-items-center rounded-[var(--radius-button)] border border-line"
        >
          <Icon name="close" />
        </button>
      </div>
      <ul className="mt-10 space-y-3">
        {[...LINKS, { label: "Contact", href: "#contact" }].map((link) => (
          <li key={link.href} data-menu-item>
            <a href={link.href} onClick={(e) => onNavigate(e, link.href)} className="text-[2.6rem] leading-tight tracking-[-0.012em]">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div data-menu-item className="mt-auto flex gap-2">
        <Button href={CONTACT.resume} variant="ghost" reveal={false} icon="arrow">
          Résumé
        </Button>
        <Button href={`mailto:${CONTACT.email}`} variant="solid" reveal={false} icon="arrow">
          Email
        </Button>
      </div>
    </div>
  );
}
