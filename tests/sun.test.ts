import { test } from "node:test";
import assert from "node:assert/strict";
import { GODDARD, nextSunrise, sunPosition, sunPath } from "../app/lib/sun";

const { lat, lon } = GODDARD;

/* the highest the sun gets on a day, sampled every five minutes */
function noonElevation(isoDay: string): { elevation: number; azimuth: number } {
  const start = Date.parse(`${isoDay}T00:00:00Z`);
  let best = { elevation: -90, azimuth: 0 };
  for (let m = 0; m < 24 * 60; m += 5) {
    const p = sunPosition(new Date(start + m * 60_000), lat, lon);
    if (p.elevation > best.elevation) best = p;
  }
  return best;
}

test("at the equinox the noon sun stands at 90° minus the latitude", () => {
  const noon = noonElevation("2026-03-20");
  assert.ok(Math.abs(noon.elevation - (90 - lat)) < 1.2, `got ${noon.elevation}`);
});

test("at the June solstice the noon sun is higher by the tilt of the axis", () => {
  const noon = noonElevation("2026-06-21");
  assert.ok(Math.abs(noon.elevation - (90 - lat + 23.44)) < 1, `got ${noon.elevation}`);
});

test("at the December solstice the noon sun is lower by the tilt of the axis", () => {
  const noon = noonElevation("2026-12-21");
  assert.ok(Math.abs(noon.elevation - (90 - lat - 23.44)) < 1, `got ${noon.elevation}`);
});

test("the noon sun is due south of Maryland", () => {
  const noon = noonElevation("2026-10-22");
  assert.ok(Math.abs(noon.azimuth - 180) < 2, `got ${noon.azimuth}`);
});

test("the sun is in the east in the morning and the west in the afternoon", () => {
  /* 9 a.m. and 3 p.m. Eastern Daylight Time */
  const morning = sunPosition(new Date("2026-07-01T13:00:00Z"), lat, lon);
  const afternoon = sunPosition(new Date("2026-07-01T19:00:00Z"), lat, lon);
  assert.ok(morning.elevation > 0 && afternoon.elevation > 0);
  assert.ok(morning.azimuth > 0 && morning.azimuth < 180, `morning ${morning.azimuth}`);
  assert.ok(afternoon.azimuth > 180 && afternoon.azimuth < 360, `afternoon ${afternoon.azimuth}`);
});

test("the sun is below the horizon at local midnight", () => {
  const midnight = sunPosition(new Date("2026-10-22T04:00:00Z"), lat, lon);
  assert.ok(midnight.elevation < -20, `got ${midnight.elevation}`);
});

test("the day's path runs east to west and stays above the horizon", () => {
  const path = sunPath(new Date("2026-10-22T15:00:00Z"), lat, lon, 60);
  assert.ok(path.length >= 9 && path.length <= 13, `got ${path.length} hourly points`);
  for (const point of path) assert.ok(point.elevation > 0);
  for (let i = 1; i < path.length; i++) {
    assert.ok(path[i].azimuth > path[i - 1].azimuth, "azimuth grows through the day");
    assert.ok(path[i].time > path[i - 1].time, "points are in time order");
  }
});

test("the path is the same whatever the hour it is asked for on that day", () => {
  const morning = sunPath(new Date("2026-10-22T12:00:00Z"), lat, lon, 60);
  const evening = sunPath(new Date("2026-10-22T21:00:00Z"), lat, lon, 60);
  assert.deepEqual(
    morning.map((p) => p.time),
    evening.map((p) => p.time),
  );
});

test("after dark, the next sunrise is the following morning", () => {
  /* 11 p.m. Eastern on 22 October 2026 */
  const night = new Date("2026-10-23T03:00:00Z");
  const sunrise = nextSunrise(night, lat, lon);
  assert.ok(sunrise !== null);
  const hoursAhead = (sunrise.getTime() - night.getTime()) / 3_600_000;
  assert.ok(hoursAhead > 7 && hoursAhead < 10, `got ${hoursAhead} h`);
  assert.ok(Math.abs(sunPosition(sunrise, lat, lon).elevation) < 0.5);
});
