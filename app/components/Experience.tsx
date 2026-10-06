"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionIntro from "./SectionIntro";
import { Icon } from "./Icons";
import { EDUCATION, EXPERIENCE } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-xp]", {
        y: 64,
        opacity: 0,
        duration: 1.15,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-xp-grid]", start: "top 82%" },
      });
      gsap.from("[data-edu]", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-edu-grid]", start: "top 88%" },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-heading"
      data-nav="light"
      className="frame-x py-[var(--section)]"
    >
      <SectionIntro
        id="experience-heading"
        align="left"
        eyebrow="Experience"
        lines={["Shipping production", "systems since 2020."]}
        lead="From enterprise ETL at Tata Consultancy Services to LLM inference for NASA science."
        className="mb-14 px-[calc(var(--gutter)-var(--frame-inset))]"
      />

      <div data-xp-grid className="grid gap-2 lg:grid-cols-3">
        {EXPERIENCE.map((role) => (
          <article key={role.company} data-xp className="card flex flex-col p-7 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <span className="chip-icon">
                <Icon name={role.icon} size={22} />
              </span>
              {role.active && (
                <span className="font-mono-ui flex items-center gap-2 text-dim">
                  <span className="status-dot" aria-hidden="true" />
                  Current
                </span>
              )}
            </div>
            <h3 className="mt-10 text-[length:var(--text-card)] leading-snug tracking-[-0.01em]">
              {role.role}
              <span className="block text-dim">
                {role.company}
                {role.org ? ` · ${role.org}` : ""}
              </span>
            </h3>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-dim">{role.summary}</p>
            <ul className="mt-6 space-y-3 text-[0.925rem] leading-relaxed">
              {role.highlights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="font-mono-ui mt-auto pt-9 text-faint">
              {role.period} · {role.location}
            </p>
          </article>
        ))}
      </div>

      <div data-edu-grid className="mt-2 grid gap-2 lg:grid-cols-2">
        {EDUCATION.map((degree, i) => (
          <article
            key={degree.school}
            data-edu
            className="card flex min-h-[13rem] overflow-hidden"
          >
            <div className="flex flex-1 flex-col p-7 sm:p-9">
              <p className="eyebrow">
                <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
                Education
              </p>
              <h3 className="mt-auto pt-8 text-[length:var(--text-card)] leading-snug tracking-[-0.01em]">
                {degree.degree}
              </h3>
              <p className="mt-2 text-dim">
                {degree.school}
                {degree.period && <span className="whitespace-nowrap"> · {degree.period}</span>}
              </p>
            </div>
            {i === 0 && (
              // eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized asset
              <img
                src="/images/ashu-umbc.jpg"
                alt="Ashutosh at his UMBC graduation"
                width={1000}
                height={666}
                loading="lazy"
                decoding="async"
                className="hidden w-[38%] object-cover object-[50%_30%] sm:block"
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
