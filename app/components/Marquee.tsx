const ITEMS = [
  "Signal from noise",
  "NASA Pandora network",
  "AI systems",
  "Multi-agent",
  "C++ / Python / TypeScript",
  "Full-stack",
];

export default function Marquee() {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`whitespace-nowrap px-6 text-2xl sm:text-3xl ${
              i % 2 === 0 ? "font-display italic" : "font-sans uppercase tracking-tight"
            }`}
          >
            {item}
          </span>
          <span className="text-accent" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="hairline-t hairline-b overflow-hidden py-5" role="presentation">
      <div className="marquee-track" style={{ "--marquee-speed": "30s" } as React.CSSProperties}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
