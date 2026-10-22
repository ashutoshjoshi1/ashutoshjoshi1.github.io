import { test } from "node:test";
import assert from "node:assert/strict";
import { BANDS, NM_MAX, NM_MIN, irradiance, spectrumPath } from "../app/lib/spectrum";

test("ozone cuts the sunlight off below about 310 nm", () => {
  assert.ok(irradiance(300) < 0.1 * irradiance(340));
});

test("the calcium H and K lines bite deep into the continuum", () => {
  const k = irradiance(393.4);
  const nearby = irradiance(405);
  assert.ok(k < 0.4 * nearby, `K ${k}, nearby ${nearby}`);
});

test("every gas band the instrument reads lies inside its range", () => {
  for (const band of BANDS) {
    assert.ok(band.from >= NM_MIN && band.to <= NM_MAX && band.from < band.to, band.gas);
  }
});

test("the path spans the box it is drawn in and stays inside it", () => {
  const d = spectrumPath(600, 200, 120);
  const points = [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  assert.equal(points.length, 120);
  assert.equal(points[0][0], 0);
  assert.equal(points[points.length - 1][0], 600);
  for (const [, y] of points) assert.ok(y >= 0 && y <= 200, `y ${y}`);
});
