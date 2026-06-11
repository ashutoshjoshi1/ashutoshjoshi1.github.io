import gsap from "gsap";
import type Lenis from "lenis";

/* module-level Lenis store so Nav/Footer can drive scrollTo */
let lenisInstance: Lenis | null = null;
export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}
export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/*
 * Wraps each char of an element in an overflow-hidden mask + inner span,
 * so chars can slide up from below. Returns the inner spans.
 * Keeps the original text accessible via aria-label.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const chars: HTMLElement[] = [];
  for (const word of text.split(" ")) {
    /* keeps words unbreakable without clipping — only char masks clip */
    const wordWrap = document.createElement("span");
    wordWrap.setAttribute("aria-hidden", "true");
    wordWrap.style.display = "inline-block";
    wordWrap.style.whiteSpace = "nowrap";
    for (const ch of word) {
      const mask = document.createElement("span");
      mask.className = "split-mask";
      const inner = document.createElement("span");
      inner.className = "split-char";
      inner.textContent = ch;
      mask.appendChild(inner);
      wordWrap.appendChild(mask);
      chars.push(inner);
    }
    el.appendChild(wordWrap);
    el.appendChild(document.createTextNode(" "));
  }
  return chars;
}

/* Wraps each word in a span for scroll-scrubbed reveals. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  const text = el.textContent ?? "";
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const words: HTMLElement[] = [];
  for (const word of text.split(" ")) {
    const span = document.createElement("span");
    span.className = "split-word";
    span.setAttribute("aria-hidden", "true");
    span.textContent = word;
    el.appendChild(span);
    el.appendChild(document.createTextNode(" "));
    words.push(span);
  }
  return words;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/\\_";

/* Decode/scramble a string into an element over `duration` ms. */
export function scrambleTo(el: HTMLElement, target: string, duration = 600): () => void {
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const settled = Math.floor(p * target.length);
    let out = target.slice(0, settled);
    for (let i = settled; i < target.length; i++) {
      out += target[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    el.textContent = out;
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/*
 * Kinetic type: chars push away from the cursor and spring back.
 * Returns a cleanup function. Call only after intro tweens settle.
 */
export function attachRepel(
  chars: HTMLElement[],
  { radius = 130, strength = 30 }: { radius?: number; strength?: number } = {},
): () => void {
  if (prefersReducedMotion()) return () => undefined;
  if (window.matchMedia("(pointer: coarse)").matches) return () => undefined;

  const setters = chars.map((ch) => ({
    x: gsap.quickTo(ch, "x", { duration: 0.5, ease: "power3.out" }),
    y: gsap.quickTo(ch, "y", { duration: 0.5, ease: "power3.out" }),
  }));

  let raf = 0;
  const onMove = (e: MouseEvent) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      for (let i = 0; i < chars.length; i++) {
        const rect = chars[i].getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - e.clientX;
        const dy = cy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius && dist > 0.01) {
          const force = (1 - dist / radius) * strength;
          setters[i].x((dx / dist) * force);
          setters[i].y((dy / dist) * force);
        } else {
          setters[i].x(0);
          setters[i].y(0);
        }
      }
    });
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMove);
  };
}

/* Deterministic PRNG so generative visuals are stable across renders. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
