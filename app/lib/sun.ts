/*
 * SUN — where the sun stands for an observer, from NOAA's general solar
 * position equations (good to about a degree, plenty for a drawing). The
 * NASA panel uses it to show the sun over Goddard right now, the one a
 * Pandora on the roof there is pointed at.
 */

export interface Place {
  name: string;
  lat: number;
  /* degrees east; west is negative */
  lon: number;
  timeZone: string;
}

export const GODDARD: Place = {
  name: "Greenbelt, Maryland",
  lat: 38.99,
  lon: -76.85,
  timeZone: "America/New_York",
};

export interface SunPosition {
  /* degrees above the horizon; negative below it */
  elevation: number;
  /* degrees clockwise from north */
  azimuth: number;
}

export interface SunSample extends SunPosition {
  /* ms since the epoch */
  time: number;
}

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / DAY_MS) + 1;
}

/* fractional year, declination (radians) and equation of time (minutes) */
function orbit(date: Date): { declination: number; eqTime: number } {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const g = ((2 * Math.PI) / 365) * (dayOfYear(date) - 1 + (hours - 12) / 24);
  const eqTime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const declination =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  return { declination, eqTime };
}

export function sunPosition(date: Date, lat: number, lon: number): SunPosition {
  const { declination, eqTime } = orbit(date);
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const solarMinutes = minutes + eqTime + 4 * lon;
  const hourAngle = (solarMinutes / 4 - 180) * RAD;
  const phi = lat * RAD;

  const cosZenith =
    Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const azimuth =
    Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(phi) - Math.tan(declination) * Math.cos(phi)) / RAD +
    180;

  return { elevation: 90 - zenith / RAD, azimuth: ((azimuth % 360) + 360) % 360 };
}

/* UTC ms of solar noon nearest to `date` at this longitude */
function solarNoon(date: Date, lon: number): number {
  const { eqTime } = orbit(date);
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const noon = day + (720 - 4 * lon - eqTime) * 60_000;
  /* the solar day containing `date` may have its noon on the next or previous UTC date */
  const offset = Math.round((date.getTime() - noon) / DAY_MS);
  return noon + offset * DAY_MS;
}

/* the sun's path through one day, sampled every `stepMinutes` on whole
   UTC steps, above the horizon only. The same day gives the same points,
   whatever hour it is asked at. */
export function sunPath(date: Date, lat: number, lon: number, stepMinutes: number): SunSample[] {
  const step = stepMinutes * 60_000;
  const noon = solarNoon(date, lon);
  const first = Math.ceil((noon - DAY_MS / 2) / step) * step;
  const samples: SunSample[] = [];
  for (let time = first; time < noon + DAY_MS / 2; time += step) {
    const position = sunPosition(new Date(time), lat, lon);
    if (position.elevation > 0) samples.push({ time, ...position });
  }
  return samples;
}

/* the next moment the sun clears the horizon, to the minute, within a day;
   null where it does not rise (polar night) */
export function nextSunrise(date: Date, lat: number, lon: number): Date | null {
  let wasUp = sunPosition(date, lat, lon).elevation > 0;
  for (let m = 1; m <= 24 * 60; m++) {
    const time = new Date(date.getTime() + m * 60_000);
    const up = sunPosition(time, lat, lon).elevation > 0;
    if (up && !wasUp) return time;
    wasUp = up;
  }
  return null;
}
