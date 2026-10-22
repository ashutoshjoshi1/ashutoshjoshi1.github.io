import type { Policy } from "../../lib/batching";
import Icon from "../ui/Icon";

interface Lever {
  key: keyof Policy;
  label: string;
  off: string;
  on: string;
}

const LEVERS: Lever[] = [
  { key: "continuous", label: "Batching", off: "Static", on: "Continuous" },
  { key: "chunkedPrefill", label: "Prefill", off: "Whole", on: "Chunked" },
  { key: "prefixCache", label: "Prefix cache", off: "Off", on: "On" },
  { key: "speculative", label: "Speculative decoding", off: "Off", on: "On" },
  { key: "fp8", label: "Weights", off: "FP16", on: "FP8" },
];

const LOADS = [
  { label: "Steady", rps: 6 },
  { label: "Heavy", rps: 9 },
] as const;

interface LeversProps {
  policy: Policy;
  load: number;
  burstSize: number;
  onPolicy: (policy: Policy) => void;
  onLoad: (rps: number) => void;
  onBurst: () => void;
  onReset: () => void;
}

export default function Levers({ policy, load, burstSize, onPolicy, onLoad, onBurst, onReset }: LeversProps) {
  return (
    <div className="levers">
      <div className="levers__grid">
        {LEVERS.map((lever) => (
          <fieldset key={lever.key} className="lever">
            <legend className="lever__label t-small">{lever.label}</legend>
            <div className="segments">
              <button
                type="button"
                className="segment"
                aria-pressed={!policy[lever.key]}
                onClick={() => onPolicy({ ...policy, [lever.key]: false })}
              >
                {lever.off}
              </button>
              <button
                type="button"
                className="segment"
                aria-pressed={policy[lever.key]}
                onClick={() => onPolicy({ ...policy, [lever.key]: true })}
              >
                {lever.on}
              </button>
            </div>
          </fieldset>
        ))}
        <fieldset className="lever">
          <legend className="lever__label t-small">Traffic</legend>
          <div className="segments">
            {LOADS.map((option) => (
              <button
                key={option.label}
                type="button"
                className="segment"
                aria-pressed={load === option.rps}
                onClick={() => onLoad(option.rps)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="levers__actions">
        <button type="button" className="button" onClick={onBurst}>
          Send {burstSize} requests
          <Icon name="arrow-right" className="button__arrow" />
        </button>
        <button type="button" className="button button--quiet" onClick={onReset}>
          Back to the naive server
        </button>
      </div>
    </div>
  );
}
