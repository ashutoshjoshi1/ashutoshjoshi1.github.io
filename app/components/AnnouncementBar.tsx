"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icons";
import { scrollToHash } from "./Button";

const STORAGE_KEY = "aj-announcement-dismissed";

/* the slim black bar above the nav, scale.com-style */
export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {
      /* storage blocked (private mode): the bar simply shows again */
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage blocked: dismissal lasts for this visit only */
    }
  };

  return (
    <div className="relative z-[91] flex h-10 items-center justify-center bg-black px-12 text-[0.85rem] text-white">
      <p className="flex min-w-0 items-center gap-3">
        <span className="status-dot" aria-hidden="true" />
        <span className="truncate">Building LLM inference for NASA science · open to new roles</span>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash("#contact");
          }}
          className="hidden shrink-0 items-center gap-1 text-white/70 transition-colors hover:text-white sm:inline-flex"
        >
          Get in touch
          <Icon name="arrow" size={14} />
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 grid h-7 w-7 place-items-center rounded text-white/60 transition-colors hover:text-white"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
