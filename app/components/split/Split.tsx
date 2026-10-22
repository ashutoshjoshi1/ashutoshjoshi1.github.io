"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PortraitFigure from "../hero/PortraitFigure";
import ServerFigure from "../inference/ServerFigure";
import SkyFigure from "../nasa/SkyFigure";
import { ServerProvider } from "./ServerContext";
import "./split.css";

export type Layer = "portrait" | "server" | "sky";

const LAYERS: Layer[] = ["portrait", "server", "sky"];

function isLayer(value: string | undefined): value is Layer {
  return LAYERS.includes(value as Layer);
}

/*
 * The split stage. On wide screens the reading column scrolls on the left
 * while the right half holds still and changes what it shows as chapters
 * pass: the portrait, the live server, the sun over Goddard. Each chapter
 * names its layer with data-chapter; the one crossing the middle of the
 * screen wins. On a phone the stage is not drawn and each chapter carries
 * its own figure inline.
 */
export default function Split({ children }: { children: ReactNode }) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<Layer>("portrait");

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
          <PortraitFigure placement="stage" on={layer === "portrait"} />
          <ServerFigure placement="stage" on={layer === "server"} />
          <SkyFigure placement="stage" on={layer === "sky"} />
        </div>
      </div>
    </ServerProvider>
  );
}
