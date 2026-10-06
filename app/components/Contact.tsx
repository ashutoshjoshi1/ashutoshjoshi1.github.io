"use client";

import { useRef, useState } from "react";
import SectionIntro from "./SectionIntro";
import Button from "./Button";
import { Icon } from "./Icons";
import { CONTACT } from "../lib/data";

const COPIED_MS = 1800;

export default function Contact() {
  const [copyLabel, setCopyLabel] = useState("Copy email");
  const timerRef = useRef<number | undefined>(undefined);

  const copyEmail = async () => {
    window.clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopyLabel("Copied");
    } catch {
      /* clipboard blocked (permissions / insecure context): show the
         address so it can be selected by hand instead */
      setCopyLabel(CONTACT.email);
    }
    timerRef.current = window.setTimeout(() => setCopyLabel("Copy email"), COPIED_MS);
  };

  return (
    <section id="contact" aria-labelledby="contact-heading" data-nav="light" className="frame-x pt-[calc(var(--section)*0.5)]">
      <div data-nav="dark" className="theme-clay relative overflow-hidden rounded-[22px] bg-clay px-6 py-24 sm:py-32">
        <SectionIntro
          id="contact-heading"
          size="display"
          eyebrow="Contact"
          lines={["Let’s make your AI", "fast and affordable."]}
          lead="Open to AI/ML systems, LLM inference and ML platform roles. Email is the fastest way to reach me."
          className="relative z-10 max-w-4xl"
        >
          <Button href={`mailto:${CONTACT.email}`} variant="solid" icon="arrow">
            Email me
          </Button>
          <button type="button" onClick={copyEmail} className="btn btn-ghost" aria-live="polite">
            <span className="btn-label">
              {copyLabel}
              <Icon name="copy" size={16} className="btn-icon" />
            </span>
          </button>
          <Button href={CONTACT.resume} variant="ghost" icon="arrow">
            Résumé
          </Button>
        </SectionIntro>
      </div>
    </section>
  );
}
