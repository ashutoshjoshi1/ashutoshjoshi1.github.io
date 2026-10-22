"use client";

import { HERO } from "../../lib/data";
import { GODDARD } from "../../lib/sun";
import { clockTime, useNow } from "../../hooks/useNow";
import Readout from "../split/Readout";

export type Placement = "stage" | "inline";

interface PortraitFigureProps {
  placement: Placement;
  on?: boolean;
}

/* the portrait the page opens on: held on the stage on wide screens, at
   the top of the hero on a phone */
export default function PortraitFigure({ placement, on = true }: PortraitFigureProps) {
  const now = useNow();
  return (
    <figure className={`figure figure--portrait figure--${placement}`} data-on={on}>
      <div className="figure__picture portrait">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
        <img
          className="portrait__img"
          src={HERO.photo}
          alt={HERO.photoAlt}
          width={1024}
          height={1536}
          fetchPriority={placement === "stage" ? "high" : "auto"}
          decoding="async"
        />
      </div>
      <Readout
        left="Baltimore, Maryland"
        right={now ? `${clockTime(now, GODDARD.timeZone)} Eastern time` : "US Eastern time"}
      />
    </figure>
  );
}
