import type { ReactNode, Ref } from "react";

interface ReadoutProps {
  left: ReactNode;
  right: ReactNode;
  /* for a value a canvas writes straight into, without a React render */
  rightRef?: Ref<HTMLSpanElement>;
}

/* the strip along the foot of every held picture: where, and what it reads now */
export default function Readout({ left, right, rightRef }: ReadoutProps) {
  return (
    <figcaption className="readout t-small">
      <span className="readout__left">{left}</span>
      <span ref={rightRef} className="readout__right figures">
        {right}
      </span>
    </figcaption>
  );
}
