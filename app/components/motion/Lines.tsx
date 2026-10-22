import { Fragment, type CSSProperties } from "react";

interface LinesProps {
  as?: "h1" | "h2" | "h3" | "p";
  /* the authored line breaks: two lines at most for a heading */
  lines: readonly string[];
  id?: string;
  className?: string;
  /* ms before the first line starts to rise */
  delay?: number;
}

/* A heading whose lines rise from behind their own baselines, once, as it
   enters the screen. The breaks are authored, so nothing is measured. */
export default function Lines({ as: Tag = "h2", lines, id, className = "", delay = 0 }: LinesProps) {
  return (
    <Tag id={id} className={`lines ${className}`} data-lines style={{ "--d": `${delay}ms` } as CSSProperties}>
      {lines.map((text, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="line">
            <span style={{ "--i": i } as CSSProperties}>{text}</span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
