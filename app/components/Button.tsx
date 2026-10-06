"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { Icon, type IconName } from "./Icons";
import { getLenis, prefersReducedMotion } from "../lib/motion";

type Variant = "solid" | "ghost" | "forest" | "soft";

/* full literals so Tailwind's content scan keeps every variant class */
const VARIANT_CLASS: Record<Variant, string> = {
  solid: "btn-solid",
  ghost: "btn-ghost",
  forest: "btn-forest",
  soft: "btn-soft",
};

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "sm";
  icon?: IconName | null;
  /* slide the label in when the button first scrolls into view */
  reveal?: boolean;
  className?: string;
  ariaLabel?: string;
}

/* in-page anchors glide through Lenis instead of jumping */
export function scrollToHash(hash: string): void {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(hash, { duration: 1.4 });
  else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

export default function Button({
  href,
  children,
  variant = "solid",
  size = "md",
  icon = "chevron",
  reveal = true,
  className = "",
  ariaLabel,
}: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const external = /^https?:|\.pdf$/.test(href);

  useEffect(() => {
    const el = ref.current;
    if (!el || !reveal || prefersReducedMotion()) return;
    /* only buttons that start below the fold get the arrival animation */
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.reveal = "done";
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      className={`btn ${VARIANT_CLASS[variant]} ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      <span className="btn-label">
        {children}
        {icon && <Icon name={icon} size={16} className="btn-icon" />}
      </span>
    </a>
  );
}
