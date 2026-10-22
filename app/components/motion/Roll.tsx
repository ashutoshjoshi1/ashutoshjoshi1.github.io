import type { CSSProperties } from "react";

interface RollProps {
  value: string;
  className?: string;
}

/* A figure whose digits roll up to their values once, column by column.
   The strips of 0–9 are drawn by CSS, so the only text in the document is
   the real value; with no script or reduced motion the strips rest on it. */
export default function Roll({ value, className = "" }: RollProps) {
  let column = 0;
  return (
    <span className={`roll ${className}`} data-reveal>
      <span className="sr-only">{value}</span>
      <span className="roll__digits" aria-hidden="true">
        {[...value].map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i}>{ch}</span>;
          const style = { "--d": ch, "--i": column++ } as CSSProperties;
          return (
            <span key={i} className="roll__col">
              <span className="roll__strip" style={style} />
            </span>
          );
        })}
      </span>
    </span>
  );
}
