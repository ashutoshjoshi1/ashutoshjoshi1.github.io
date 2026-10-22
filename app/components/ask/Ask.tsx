"use client";

import { useState } from "react";
import { ask, CORPUS, type Doc } from "../../lib/retrieval";
import { CONTACT } from "../../lib/data";
import Lines from "../motion/Lines";
import "./ask.css";

const SUGGESTIONS = ["LLM inference experience?", "vLLM or SGLang?", "The NASA work", "Why hire Ashutosh?", "How was this site built?"];
const KEEP = 4;

interface Answer {
  id: number;
  question: string;
  text: string;
  sources: Doc[];
  meta: string;
}

let answerId = 0;

function describe(result: ReturnType<typeof ask>): string {
  const ms = `${result.ms.toFixed(1)} ms`;
  if (result.kind === "retrieval") {
    const n = result.sources.length;
    return `${n} source${n === 1 ? "" : "s"}, best match ${result.score.toFixed(2)}, ${ms}`;
  }
  return result.kind === "intent" ? `Matched a command, ${ms}` : `No match, ${ms}`;
}

/* TF-IDF retrieval over the page's own text. Answers are retrieved, never
   generated, and arrive whole. */
export default function Ask() {
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);

  const submit = (raw: string) => {
    const question = raw.trim();
    if (!question) return;
    setValue("");
    if (/^clear$/i.test(question)) {
      setAnswers([]);
      return;
    }
    const result = ask(question);
    if (result.sources.some((s) => s.id === "resume")) window.open(CONTACT.resume, "_blank", "noopener");
    const answer: Answer = { id: ++answerId, question, text: result.answer, sources: result.sources, meta: describe(result) };
    setAnswers((previous) => [answer, ...previous].slice(0, KEEP));
  };

  return (
    <section id="ask" className="ask section" aria-labelledby="ask-title">
      <div className="ask__grid wrap">
        <header className="ask__head">
          <Lines id="ask-title" className="t-head" lines={["Ask about", "my work"]} />
          <p className="ask__intro" data-rise>
            Retrieval over the {CORPUS.length} passages on this page, running in your browser: TF-IDF vectors and cosine
            similarity. It only answers from what is written here, so it cannot make anything up.
          </p>
        </header>

        <div className="ask__console">
          <form
            className="ask__form"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <label htmlFor="ask-input" className="sr-only">
              Ask a question about Ashutosh’s work
            </label>
            <input
              id="ask-input"
              className="ask__input t-lead"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about inference, GPUs, NASA…"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" className="button">
              Ask
            </button>
          </form>

          <div className="ask__suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="segment ask__suggestion" onClick={() => submit(s)}>
                {s}
              </button>
            ))}
          </div>

          <ol className="ask__answers" aria-live="polite">
            {answers.map((answer) => (
              <li key={answer.id} className="answer">
                <p className="answer__question t-small">{answer.question}</p>
                <p className="answer__text">{answer.text}</p>
                {answer.sources.length > 0 && (
                  <p className="answer__sources t-small">
                    <span className="soft">From </span>
                    {answer.sources.map((source, i) => (
                      <span key={source.id}>
                        {i > 0 && ", "}
                        {source.link ? (
                          <a
                            className="link"
                            href={source.link}
                            target={source.link.startsWith("http") || source.link.endsWith(".pdf") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                          >
                            {source.tag}
                          </a>
                        ) : (
                          source.tag
                        )}
                      </span>
                    ))}
                  </p>
                )}
                <p className="answer__meta t-small">{answer.meta}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
