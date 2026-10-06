"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionIntro from "./SectionIntro";
import { Icon } from "./Icons";
import { EDUCATION, EXPERIENCE, MORE_WORK, PROJECTS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

const PROJECT_COUNT = PROJECTS.length + MORE_WORK.reduce((sum, group) => sum + group.items.length, 0);

/* the previous site's telemetry band, kept (with "since 2020" for accuracy) */
const STATS: { value: number; suffix?: string; label: string; count: boolean }[] = [
  { value: 2020, label: "Shipping production software since", count: false },
  { value: 300, suffix: "+", label: "Instruments running my ML", count: true },
  { value: 5, label: "Continents of instruments", count: true },
  { value: PROJECT_COUNT, label: "Projects on this page", count: true },
];

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      section.querySelectorAll<HTMLElement>("[data-stat-count]").forEach((el, i) => {
        const target = Number(el.dataset.statCount);
        const proxy = { v: 0 };
        el.textContent = "0";
        gsap.to(proxy, {
          v: target,
          duration: 1.5,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-stats]", start: "top 85%" },
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.v));
          },
        });
      });
      gsap.from("[data-stat]", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-stats]", start: "top 85%" },
      });
      gsap.set("[data-xp], [data-edu]", { opacity: 0, y: 56 });
      ScrollTrigger.batch("[data-xp], [data-edu]", {
        start: "top 88%",
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, overwrite: true }),
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
        className="mb-12 px-[calc(var(--gutter)-var(--frame-inset))]"
      />

      <dl data-stats className="mb-12 grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            data-stat
            className={`flex flex-col-reverse px-[calc(var(--gutter)-var(--frame-inset))] py-8 ${
              i % 2 === 1 ? "border-l border-line" : ""
            } ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="eyebrow mt-3">{stat.label}</dt>
            <dd className="text-[clamp(2.4rem,1.6rem+2.6vw,4rem)] leading-none tabular-nums tracking-[-0.03em]">
              {stat.count ? <span data-stat-count={stat.value}>{stat.value}</span> : stat.value}
              {stat.suffix && <span className="text-taupe">{stat.suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-2 lg:grid-cols-2">
        {EXPERIENCE.map((role) => (
          <article key={`${role.company}-${role.role}`} data-xp className="card flex flex-col p-7 sm:p-9">
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

      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        {EDUCATION.map((degree, i) => (
          <article key={degree.school} data-edu className="card flex min-h-[13rem] overflow-hidden">
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
              {degree.note && <p className="font-mono-ui mt-3 text-faint">{degree.note}</p>}
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
