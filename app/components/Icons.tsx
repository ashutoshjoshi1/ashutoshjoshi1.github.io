import type { ReactNode } from "react";

/* 24px line icons — stroke follows currentColor */
const PATHS: Record<string, ReactNode> = {
  chevron: <path d="M9 6l6 6-6 6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  arrow: <path d="M7 17L17 7M8.5 7H17v8.5" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  menu: <path d="M4 9h16M4 15h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </>
  ),
  pulse: <path d="M3 12h4l2.5-6 5 12 2.5-6H21" />,
  cloud: <path d="M7.5 18.5h9.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 9.3 4.6 4.6 0 0 0 7.5 18.5z" />,
  gauge: (
    <>
      <path d="M4.5 17a8.5 8.5 0 1 1 15 0" />
      <path d="M12 13.5l4-4.5" />
      <circle cx="12" cy="14" r="1.2" />
    </>
  ),
  edge: (
    <>
      <rect x="3" y="14" width="6" height="6" rx="1.2" />
      <path d="M9 17h3a3 3 0 0 0 3-3V9" />
      <path d="M15 4.5a3.5 3.5 0 0 1 3.4 4.3A2.8 2.8 0 0 1 17.8 14H12.2a2.8 2.8 0 0 1-.6-5.5A3.5 3.5 0 0 1 15 4.5z" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M10 2v4M14 2v4M10 18v4M14 18v4M2 10h4M2 14h4M18 10h4M18 14h4" />
      <path d="M10 10h4v4h-4z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" />
      <path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" />
      <path d="M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" />
    </>
  ),
  school: (
    <>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" />
      <path d="M6.5 11.5V16c1.5 1.4 3.4 2 5.5 2s4-.6 5.5-2v-4.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  bars: <path d="M5 20V11M12 20V4M19 20v-6" />,
  flow: (
    <>
      <rect x="2.5" y="9" width="5" height="6" rx="1" />
      <rect x="9.5" y="9" width="5" height="6" rx="1" />
      <rect x="16.5" y="9" width="5" height="6" rx="1" />
      <path d="M7.5 12h2M14.5 12h2" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/* brand mark: three batch lanes, one still decoding */
export function Mark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden="true">
      <rect x="1.5" y="3.5" width="17" height="3" rx="1.5" fill="currentColor" />
      <rect x="1.5" y="8.5" width="9" height="3" rx="1.5" fill="currentColor" />
      <rect x="12.5" y="8.5" width="3" height="3" rx="0.6" fill="currentColor" opacity="0.45" />
      <rect x="1.5" y="13.5" width="13" height="3" rx="1.5" fill="currentColor" />
    </svg>
  );
}
