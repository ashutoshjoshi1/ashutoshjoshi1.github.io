"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionIntro from "./SectionIntro";
import { SKILLS } from "../lib/data";
import { prefersReducedMotion } from "../lib/motion";

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-skill-group]").forEach((group) => {
        gsap.from(group.querySelectorAll(".tag"), {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.025,
          scrollTrigger: { trigger: group, start: "top 88%" },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      aria-labelledby="skills-heading"
      data-nav="light"
      className="gutter py-[var(--section)]"
    >
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            id="skills-heading"
            align="left"
            eyebrow="Capabilities"
            lines={["The toolbox."]}
            lead="What I reach for, from CUDA and NCCL up through Kubernetes, PyTorch and the product layer."
          />
        </div>
        <dl className="space-y-10">
          {SKILLS.map((group) => (
            <div key={group.label} data-skill-group>
              <dt className="eyebrow">
                <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
                {group.label}
              </dt>
              <dd className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
