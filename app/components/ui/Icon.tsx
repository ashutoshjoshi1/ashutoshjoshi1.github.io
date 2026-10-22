/* The site's few icons, drawn once in one stroke weight. */

type IconName = "arrow-right" | "arrow-up-right" | "arrow-down";

const PATHS: Record<IconName, string> = {
  "arrow-right": "M3 8h10M9 4l4 4-4 4",
  "arrow-up-right": "M4.5 11.5l7-7M5.5 4.5h6v6",
  "arrow-down": "M8 3v10M4 9l4 4 4-4",
};

interface IconProps {
  name: IconName;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
