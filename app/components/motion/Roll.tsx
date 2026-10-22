import type { CSSProperties } from "react";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

interface RollProps {
  value: string;
  className?: string;
}

/* A figure whose digits roll up to their values once, column by column.
   The real value stays in the text for screen readers and search; with no
   script or reduced motion the strips simply rest on the right digit. */
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
              <span className="roll__strip" style={style}>
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
