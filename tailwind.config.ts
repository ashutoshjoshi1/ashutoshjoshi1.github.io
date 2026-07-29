import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elev": "var(--bg-elev)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        accent: "var(--accent)",
        uv: "var(--uv)",
        blue: "var(--blue)",
        cyan: "var(--cyan)",
        green: "var(--green)",
        volt: "var(--volt)",
        amber: "var(--amber)",
        red: "var(--red)",
      },
      borderColor: {
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
