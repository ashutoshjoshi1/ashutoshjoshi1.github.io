"use client";

import { useMemo, type CSSProperties } from "react";
import { clockTime, useNow } from "../../hooks/useNow";
import { BANDS, NM_MAX, NM_MIN, nmToX, spectrumPath } from "../../lib/spectrum";
import { GODDARD, nextSunrise, sunPath, sunPosition, type SunPosition } from "../../lib/sun";
import type { Placement } from "../split/placement";
import Readout from "../split/Readout";

/* the dome: a south-facing view of the sky, the observer at its foot */
const DOME = { width: 600, height: 300, cx: 300, cy: 286, r: 270 };
const SPECTRUM = { width: 600, height: 170, samples: 260 };
const WAVELENGTHS = [300, 350, 400, 450, 500];
const PATH_STEP_MIN = 30;
const LOOK_EVERY_MS = 60_000;

/* a sky position on the dome: east to the left, west to the right */
function project({ elevation, azimuth }: SunPosition): { x: number; y: number } {
  const el = (elevation * Math.PI) / 180;
  const az = (azimuth * Math.PI) / 180;
  return { x: DOME.cx - DOME.r * Math.cos(el) * Math.sin(az), y: DOME.cy - DOME.r * Math.sin(el) };
}

const CURVE = spectrumPath(SPECTRUM.width, SPECTRUM.height, SPECTRUM.samples);
const percent = (nm: number) => `${(nmToX(nm, 100)).toFixed(2)}%`;

interface SkyFigureProps {
  placement: Placement;
  on?: boolean;
}

/* The sun over NASA Goddard right now, where a Pandora on the roof is
   pointed, and the light it reads there. Computed in the browser. */
export default function SkyFigure({ placement, on = true }: SkyFigureProps) {
  const now = useNow(LOOK_EVERY_MS);

  const sky = useMemo(() => {
    if (!now) return null;
    const sun = sunPosition(now, GODDARD.lat, GODDARD.lon);
    const path = sunPath(now, GODDARD.lat, GODDARD.lon, PATH_STEP_MIN).map(project);
    const up = sun.elevation > 0;
    return { sun, at: project(sun), path, up, sunrise: up ? null : nextSunrise(now, GODDARD.lat, GODDARD.lon) };
  }, [now]);

  const reading = !sky
    ? "Finding the sun"
    : sky.up
      ? `Sun ${Math.round(sky.sun.elevation)}° up, bearing ${Math.round(sky.sun.azimuth)}°`
      : sky.sunrise
        ? `Below the horizon until ${clockTime(sky.sunrise, GODDARD.timeZone)}`
        : "Below the horizon";

  return (
    <figure
      className={`figure figure--sky figure--${placement}`}
      data-on={on}
      data-ui
      data-up={sky?.up ?? false}
      aria-hidden={(placement === "stage" && !on) || undefined}
      {...(placement === "inline" ? { "data-reveal": "" } : {})}
    >
      <div className="figure__body sky">
        <div className="sky__head">
          <p className="sky__title t-lead sans">The sun over Goddard, now</p>
          <p className="t-small soft">
            A Pandora on the roof follows it from sunrise to sunset and splits its light.
          </p>
        </div>

        <div className="sky__dome">
          <svg viewBox={`0 0 ${DOME.width} ${DOME.height}`} aria-hidden="true">
            <path
              className="sky__vault"
              d={`M${DOME.cx - DOME.r},${DOME.cy} A${DOME.r},${DOME.r} 0 0 1 ${DOME.cx + DOME.r},${DOME.cy} Z`}
            />
            <rect className="sky__ground" x="0" y={DOME.cy} width={DOME.width} height={DOME.height - DOME.cy} />
            {sky?.path.map((p, i) => (
              <circle key={i} className="sky__hour" cx={p.x} cy={p.y} r="2.4" style={{ "--i": i } as CSSProperties} />
            ))}
            {sky?.up && (
              <>
                <line
                  className="sky__sight"
                  x1={DOME.cx}
                  y1={DOME.cy - 10}
                  x2={sky.at.x}
                  y2={sky.at.y}
                  pathLength={1}
                />
                <circle className="sky__sun" cx={sky.at.x} cy={sky.at.y} r="11" />
              </>
            )}
            <rect className="sky__post" x={DOME.cx - 1.5} y={DOME.cy - 8} width="3" height="8" />
            <circle className="sky__head-unit" cx={DOME.cx} cy={DOME.cy - 11} r="5.5" />
          </svg>
          <p className="sky__compass t-small soft" aria-hidden="true">
            <span>East</span>
            <span>South</span>
            <span>West</span>
          </p>
          <p className="sr-only">
            Today&apos;s path of the sun across the sky over Greenbelt, Maryland, seen facing south, with a dot every half
            hour and the sun where it stands now.
          </p>
        </div>

        <div className="sky__spectrum">
          <p className="t-small soft">What it reads: sunlight from 300 to 530 nm, and the windows where each gas is fitted</p>
          <div className="spectrum">
            <svg viewBox={`0 0 ${SPECTRUM.width} ${SPECTRUM.height}`} preserveAspectRatio="none" aria-hidden="true">
              {BANDS.map((band) => (
                <rect
                  key={band.gas}
                  className="spectrum__band"
                  x={nmToX(band.from, SPECTRUM.width)}
                  y="0"
                  width={nmToX(band.to, SPECTRUM.width) - nmToX(band.from, SPECTRUM.width)}
                  height={SPECTRUM.height}
                />
              ))}
              <path className="spectrum__curve" d={CURVE} pathLength={1} vectorEffect="non-scaling-stroke" />
            </svg>
            {BANDS.map((band) => (
              <span key={band.gas} className="spectrum__gas t-small" style={{ left: percent(band.from) }}>
                {band.gas}
              </span>
            ))}
          </div>
          <div className="spectrum__axis t-small soft figures" aria-hidden="true">
            {WAVELENGTHS.map((nm) => (
              <span key={nm} style={{ left: percent(nm) }}>
                {nm}
              </span>
            ))}
            <span style={{ left: "100%" }}>{NM_MAX} nm</span>
          </div>
          <p className="sr-only">
            A solar spectrum from {NM_MIN} to {NM_MAX} nanometres, cut off by ozone below about 310 nm and marked with dark
            Fraunhofer lines. Shaded windows mark where ozone (310 to 330 nm), formaldehyde (325 to 360 nm) and nitrogen
            dioxide (400 to 470 nm) are fitted.
          </p>
        </div>
      </div>
      <Readout left="Greenbelt, Maryland" right={reading} />
    </figure>
  );
}
