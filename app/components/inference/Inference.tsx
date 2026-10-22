"use client";

import { useEffect, useRef, useState } from "react";
import type { Policy } from "../../lib/batching";
import { BENCHMARK_NOTE, BENCHMARK_TITLE, INFERENCE_STEPS, SIMULATION_NOTE, TOOLCHAIN } from "../../lib/data";
import Lines from "../motion/Lines";
import Roll from "../motion/Roll";
import KvField from "./KvField";
import Levers from "./Levers";
import "./inference.css";

const BURST_SIZE = 16;
const FINAL = INFERENCE_STEPS[INFERENCE_STEPS.length - 1];
/* the controls step sits after the story steps */
const CONTROLS_STEP = INFERENCE_STEPS.length;

const FIELD_LABEL =
  "Live map of a simulated GPU's KV-cache memory. Each square is a block of memory: dark squares are free, grey squares hold a request's tokens, green squares hold the shared system prompt.";

export default function Inference() {
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [custom, setCustom] = useState<Policy>({ ...FINAL.levers });
  const [customLoad, setCustomLoad] = useState(FINAL.load);
  const [burst, setBurst] = useState(0);

  /* the step crossing the middle of the screen drives the server */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = stepRefs.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const story = INFERENCE_STEPS[active];
  const policy: Policy = story ? story.levers : custom;
  const load = story ? story.load : customLoad;

  const reset = () => {
    setCustom({ ...INFERENCE_STEPS[0].levers });
    setCustomLoad(INFERENCE_STEPS[0].load);
  };

  return (
    <section id="inference" className="inference" data-ink="light" aria-labelledby="inference-title">
      <div className="inference__grid wrap">
        <Lines id="inference-title" className="inference__title t-head" lines={["LLM", "inference"]} />

        <div className="inference__stage">
          <KvField policy={policy} requestsPerSec={load} burst={burst} burstSize={BURST_SIZE} label={FIELD_LABEL} />
        </div>

        <ol className="inference__steps" aria-label="How the numbers moved">
          {INFERENCE_STEPS.map((step, i) => (
            <li
              key={step.id}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="step"
              data-active={active === i}
            >
              {step.figure ? (
                <>
                  <p className="step__figure t-display">
                    <Roll value={step.figure.value} />
                  </p>
                  <h3 className="step__title t-lead">{step.figure.label}</h3>
                </>
              ) : (
                <h3 className="step__title t-lead">{step.title}</h3>
              )}
              <p className="step__body measure">{step.body}</p>
              {step.also && <p className="step__also t-lead">{step.also}</p>}
            </li>
          ))}

          <li
            ref={(el) => {
              stepRefs.current[CONTROLS_STEP] = el;
            }}
            className="step step--controls"
            data-active={active === CONTROLS_STEP}
          >
            <h3 className="step__title t-lead">Now you run it.</h3>
            <p className="step__body measure">
              Flip the same levers and watch the memory map answer. Send a burst of traffic and see who copes.
            </p>
            <Levers
              policy={custom}
              load={customLoad}
              onPolicy={setCustom}
              onLoad={setCustomLoad}
              onBurst={() => setBurst((n) => n + 1)}
              onReset={reset}
              burstSize={BURST_SIZE}
            />
          </li>
        </ol>
      </div>

      <div className="inference__after wrap">
        <div className="inference__note" data-rise>
          <h3 className="inference__note-title t-lead">{BENCHMARK_TITLE}</h3>
          <p className="measure">{BENCHMARK_NOTE}</p>
        </div>
        <div className="inference__aside">
          <p className="t-small muted">{SIMULATION_NOTE}</p>
          <p className="t-small">
            <span className="muted">Runtimes and tools: </span>
            {TOOLCHAIN.join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
}
