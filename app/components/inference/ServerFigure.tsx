"use client";

import { useRef } from "react";
import type { Policy } from "../../lib/batching";
import type { Placement } from "../hero/PortraitFigure";
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

interface ServerFigureProps {
  placement: Placement;
  on?: boolean;
}

export default function ServerFigure({ placement, on = true }: ServerFigureProps) {
  const { settings } = useServer();
  const statsRef = useRef<HTMLSpanElement>(null);
  return (
    <figure className={`figure figure--server figure--${placement}`} data-on={on} data-ui>
      <div className="figure__body server">
        <div className="server__head">
          <p className="server__title t-lead sans">A simulated server, live</p>
          <p className="server__config t-small">{describePolicy(settings.policy)}</p>
        </div>
        <ServerView
          policy={settings.policy}
          load={settings.load}
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
        left={`12 slots · ${settings.load} requests a second`}
        right="Warming up"
        rightRef={statsRef}
      />
    </figure>
  );
}
