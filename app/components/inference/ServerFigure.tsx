"use client";

import { useRef } from "react";
import type { Policy } from "../../lib/batching";
import { INFERENCE_STEPS } from "../../lib/data";
import type { Placement } from "../split/placement";
import Readout from "../split/Readout";
import { useServer } from "../split/ServerContext";
import ServerView from "./ServerView";

const LABEL =
  "Live strip chart of a simulated LLM server's twelve request slots. Time runs right to left. Solid blocks are prompts being read, ticks are generated tokens, grey bands are slots left empty while requests wait, and gold marks are prompts served from the prefix cache.";

const LEGEND = [
  { key: "prefill", label: "Reading a prompt" },
  { key: "token", label: "A token out" },
  { key: "blocked", label: "Empty slot, requests waiting" },
  { key: "stall", label: "Stalled" },
  { key: "cached", label: "Prompt from cache" },
] as const;

/* the server's configuration, in words */
export function describePolicy(policy: Policy): string {
  return [
    policy.continuous ? "Continuous batching" : "Static batching",
    policy.chunkedPrefill ? "chunked prefill" : "whole prompts",
    policy.prefixCache ? "prefix cache on" : "no prefix cache",
    policy.speculative ? "speculative decoding" : null,
    policy.fp8 ? "FP8 weights" : "FP16 weights",
  ]
    .filter(Boolean)
    .join(" · ");
}

/* the introduction shows the server as it runs in production: every lever
   on, under the heavy load of the story's last step */
const PRODUCTION = INFERENCE_STEPS[INFERENCE_STEPS.length - 1];

interface ServerFigureProps {
  placement: Placement;
  on?: boolean;
  /* production: the tuned server beside the introduction; story: the inference
     chapter's settings, step by step and then the visitor's levers */
  mode: "production" | "story";
}

export default function ServerFigure({ placement, on = true, mode }: ServerFigureProps) {
  const { settings } = useServer();
  const statsRef = useRef<HTMLSpanElement>(null);
  const policy = mode === "production" ? PRODUCTION.levers : settings.policy;
  const load = mode === "production" ? PRODUCTION.load : settings.load;
  const hidden = placement === "stage" && !on;
  return (
    <figure
      className={`figure figure--server figure--${placement}`}
      data-on={on}
      data-ui
      aria-hidden={hidden || undefined}
    >
      <div className="figure__body server">
        <div className="server__head">
          <p className="server__title t-lead sans">A simulated LLM server, live in your browser</p>
          <p className="server__config t-small">{describePolicy(policy)}</p>
        </div>
        <ServerView
          policy={policy}
          load={load}
          burst={settings.burst}
          active={on}
          label={LABEL}
          statsRef={statsRef}
        />
        <ul className="legend t-small" aria-hidden="true">
          {LEGEND.map((item) => (
            <li key={item.key} className="legend__item">
              <span className={`legend__swatch legend__swatch--${item.key}`}>
                {item.key === "token" && (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <Readout
        left={`12 slots · ${load} requests a second`}
        right="Warming up"
        rightRef={statsRef}
      />
    </figure>
  );
}
