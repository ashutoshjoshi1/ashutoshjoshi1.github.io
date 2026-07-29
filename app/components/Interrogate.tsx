"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ask, CORPUS, type Doc } from "../lib/retrieval";
import { getLenis, prefersReducedMotion } from "../lib/motion";

const TYPE_INTERVAL_MS = 24;
const TYPE_CHUNK = 5;

const SUGGESTIONS = [
  "experience with RAG?",
  "c++ or python?",
  "the NASA work",
  "why hire ashu?",
  "how was this site built?",
];

interface Entry {
  id: number;
  role: "user" | "sys";
  text: string;
  sources?: Doc[];
  meta?: string;
}

let entryId = 0;
const nextId = () => ++entryId;

const BOOT: Entry[] = [
  {
    id: nextId(),
    role: "sys",
    text: `retrieval core online — ${CORPUS.length} docs indexed · tf-idf / cosine · 0 dependencies · 0 api calls`,
  },
  { id: nextId(), role: "sys", text: "ask about the work, or type `help`. answers are retrieved, never generated." },
];

export default function Interrogate() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollbackRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef<{ timer: number; full: string; entryId: number } | null>(null);

  const [entries, setEntries] = useState<Entry[]>(BOOT);
  const [value, setValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  /* completed answers land here once, for screen readers — the streaming
     scrollback itself is NOT a live region, so the typewriter can't spam */
  const [announcement, setAnnouncement] = useState("");

  /* pin the scrollback to its newest line — but never fight the user:
     only while they were already reading the bottom */
  const stickRef = useRef(true);
  const onScrollbackScroll = () => {
    const el = scrollbackRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };
  useEffect(() => {
    const el = scrollbackRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [entries]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-query-reveal]", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* flush any in-flight typewriter instantly */
  const flushTyping = useCallback(() => {
    const typing = typingRef.current;
    if (!typing) return;
    window.clearInterval(typing.timer);
    setEntries((prev) =>
      prev.map((e) => (e.id === typing.entryId ? { ...e, text: typing.full } : e)),
    );
    setAnnouncement(typing.full);
    typingRef.current = null;
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typingRef.current) window.clearInterval(typingRef.current.timer);
    };
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const query = raw.trim();
      if (!query) return;
      flushTyping();
      setValue("");

      if (/^clear$/i.test(query)) {
        setEntries([]);
        return;
      }

      const result = ask(query);
      const meta =
        result.kind === "retrieval"
          ? `retrieved ${result.sources.length} doc${result.sources.length === 1 ? "" : "s"} · cosine ${result.score.toFixed(2)} · ${result.ms.toFixed(1)}ms`
          : result.kind === "intent"
            ? `intent match · ${result.ms.toFixed(1)}ms`
            : `0 hits · ${result.ms.toFixed(1)}ms`;

      const userEntry: Entry = { id: nextId(), role: "user", text: query };
      const sysEntry: Entry = {
        id: nextId(),
        role: "sys",
        text: "",
        sources: result.sources,
        meta,
      };

      if (result.sources.some((s) => s.id === "resume")) {
        window.open("/resume.pdf", "_blank", "noopener");
      }

      /* a fresh submission implies the user wants to see the new answer */
      stickRef.current = true;

      if (prefersReducedMotion()) {
        setEntries((prev) => [...prev, userEntry, { ...sysEntry, text: result.answer }]);
        setAnnouncement(result.answer);
        return;
      }

      setEntries((prev) => [...prev, userEntry, sysEntry]);
      setIsTyping(true);
      let cursor = 0;
      const timer = window.setInterval(() => {
        cursor = Math.min(result.answer.length, cursor + TYPE_CHUNK);
        const slice = result.answer.slice(0, cursor);
        setEntries((prev) => prev.map((e) => (e.id === sysEntry.id ? { ...e, text: slice } : e)));
        if (cursor >= result.answer.length) {
          window.clearInterval(timer);
          typingRef.current = null;
          setIsTyping(false);
          setAnnouncement(result.answer);
        }
      }, TYPE_INTERVAL_MS);
      typingRef.current = { timer, full: result.answer, entryId: sysEntry.id };
    },
    [flushTyping],
  );

  const onSourceClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    if (link.startsWith("#")) {
      e.preventDefault();
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(link, { duration: 1.4 });
      else document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="query" ref={sectionRef} aria-labelledby="query-heading" className="py-[var(--section)]">
      <div className="gutter mb-14">
        <p data-query-reveal className="font-mono-ui text-dim mb-6">
          <span className="text-accent">(07)</span> — Query / Retrieval console
        </p>
        <h2
          id="query-heading"
          data-query-reveal
          className="leading-[0.92] tracking-tight"
          style={{ fontSize: "var(--text-title)" }}
        >
          <span className="font-sans font-medium uppercase">Ask the</span>{" "}
          <span className="font-display italic text-accent">archive.</span>
        </h2>
        <p data-query-reveal className="mt-8 max-w-xl text-base leading-relaxed text-dim sm:text-lg">
          The retrieval pattern I ship in production, scaled down to one page —{" "}
          <em className="font-display italic text-ink">TF-IDF vectors and cosine similarity</em> over
          everything on this site. It only answers from indexed documents. No API, no hallucinations.
        </p>
      </div>

      <div className="gutter" data-query-reveal>
        <div
          className="mx-auto max-w-4xl border border-[var(--line)]"
          onClick={() => {
            /* don't yank focus while the user is selecting answer text */
            if (window.getSelection()?.isCollapsed !== false) inputRef.current?.focus();
          }}
        >
          {/* title bar */}
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
            <span className="font-mono-ui text-dim">guest@signal — retrieval console</span>
            <span className="font-mono-ui text-dim hidden items-center gap-3 sm:flex">
              <span className="status-dot" aria-hidden="true" />
              <span>index hot</span>
            </span>
          </div>

          {/* scrollback */}
          <div
            ref={scrollbackRef}
            data-lenis-prevent
            onScroll={onScrollbackScroll}
            className="term-text h-[22rem] overflow-y-auto px-4 py-4 sm:h-[24rem] sm:px-5"
          >
            {entries.map((entry) => (
              <div key={entry.id} className="mb-4">
                {entry.role === "user" ? (
                  <p className="text-accent">
                    <span aria-hidden="true">❯ </span>
                    {entry.text}
                  </p>
                ) : (
                  <div>
                    <p className="whitespace-pre-wrap text-ink">
                      {entry.text}
                      {isTyping && typingRef.current?.entryId === entry.id && (
                        <span className="term-caret" aria-hidden="true" />
                      )}
                    </p>
                    {entry.sources && entry.sources.length > 0 && entry.text.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.sources.map((source) =>
                          source.link ? (
                            <a
                              key={source.id}
                              href={source.link}
                              onClick={(e) => onSourceClick(e, source.link ?? "")}
                              target={source.link.startsWith("http") || source.link.endsWith(".pdf") ? "_blank" : undefined}
                              rel="noopener noreferrer"
                              data-cursor="hover"
                              className="font-mono-ui border border-[var(--line)] px-2 py-1 text-dim transition-colors duration-300 hover:border-[var(--accent)] hover:text-accent"
                            >
                              [{source.tag}]
                            </a>
                          ) : (
                            <span
                              key={source.id}
                              className="font-mono-ui border border-[var(--line)] px-2 py-1 text-dim"
                            >
                              [{source.tag}]
                            </span>
                          ),
                        )}
                      </div>
                    )}
                    {entry.meta &&
                      entry.text.length > 0 &&
                      !(isTyping && typingRef.current?.entryId === entry.id) && (
                        <p className="font-mono-ui text-dim mt-2">— {entry.meta}</p>
                      )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* prompt */}
          <form
            className="flex items-center gap-3 border-t border-[var(--line)] px-4 py-3 sm:px-5"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <span className="term-text text-accent" aria-hidden="true">
              ❯
            </span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ask about rag, c++, nasa, hiring…"
              aria-label="Ask the retrieval console a question"
              autoComplete="off"
              spellCheck={false}
              className="term-text w-full bg-transparent text-ink placeholder:text-[var(--ink-dim)] focus:outline-none"
              style={{ caretColor: "var(--accent)" }}
            />
            <button
              type="submit"
              data-cursor="hover"
              className="font-mono-ui border border-[var(--line)] px-3 py-1.5 transition-colors duration-300 hover:border-[var(--accent)] hover:text-accent"
            >
              SEND
            </button>
          </form>
        </div>

        {/* completed answers announced once, out of the visual flow */}
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {/* recruiter-grade openers */}
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              data-cursor="hover"
              className="font-mono-ui border border-[var(--line)] px-3 py-2 text-dim transition-colors duration-300 hover:border-[var(--accent)] hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
