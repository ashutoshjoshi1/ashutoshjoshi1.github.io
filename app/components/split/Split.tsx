"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ServerFigure from "../inference/ServerFigure";
import SkyFigure from "../nasa/SkyFigure";
import { ServerProvider } from "./ServerContext";
import "./split.css";

/* intro: the tuned server; server: the same server through the inference story */
export type Layer = "intro" | "server" | "sky";

const LAYERS: Layer[] = ["intro", "server", "sky"];

function isLayer(value: string | undefined): value is Layer {
  return LAYERS.includes(value as Layer);
}

/*
 * The split stage. On wide screens the reading column scrolls on the left
 * while the right half holds still and changes what it shows as chapters
 * pass: the live server as it runs in production, the same server taken
 * apart step by step, the sun over Goddard. Each chapter
 * names its layer with data-chapter; the one crossing the middle of the
 * screen wins. On a phone the stage is not drawn and each chapter carries
 * its own figure inline.
 */
export default function Split({ children }: { children: ReactNode }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<Layer>("intro");

  useEffect(() => {
    const chapters = columnRef.current?.querySelectorAll<HTMLElement>("[data-chapter]");
    if (!chapters?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.chapter;
          if (entry.isIntersecting && isLayer(name)) setLayer(name);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    chapters.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ServerProvider>
      <div className="split" data-layer={layer}>
        <div ref={columnRef} className="split__column">
          {children}
        </div>
        <div className="split__stage">
          <ServerFigure placement="stage" on={layer !== "sky"} mode={layer === "intro" ? "production" : "story"} />
          <SkyFigure placement="stage" on={layer === "sky"} />
        </div>
      </div>
    </ServerProvider>
  );
}
