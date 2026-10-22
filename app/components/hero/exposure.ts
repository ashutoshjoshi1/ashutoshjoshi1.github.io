import { lerpRect, type Rect } from "../../lib/pixels";

/*
 * The hero's geometry, as pure functions of the viewport: where the window
 * sits on the first frame, which part of the photograph it shows, and how
 * both open out to the full screen as the visitor scrolls.
 *
 * The photograph is a portrait on a black ground, so the open view fits its
 * height and lets the ground run out to the screen's edges: a crop wider than
 * the photo overhangs it, and the overhang is drawn as that same black.
 */

export interface Photo {
  width: number;
  height: number;
  /* the subject, in photo pixels: the window starts centred on it */
  focus: { x: number; y: number };
  /* share of the photo's height on screen once the window is open */
  openHeight: number;
}

export interface Inset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/* below this width the name sits above the window and the words below it */
export const STACKED_BELOW = 900;
/* room kept under a stacked window for the sentence and the button */
const STACKED_FOOT = 224;

/* the window: a 4:5 portrait, centred between the name and the words on
   desktop; on phones and tablets, high in the screen under the name */
export function windowInset(vw: number, vh: number): Inset {
  if (vw >= STACKED_BELOW) {
    const width = Math.min(vw * 0.36, vh * 0.72 * 0.8);
    const height = width * 1.25;
    const left = (vw - width) / 2;
    const top = (vh - height) / 2;
    return { top, right: left, bottom: top, left };
  }
  const top = vh * 0.3;
  const height = Math.min(vw * 0.78 * 1.25, vh - top - STACKED_FOOT);
  const width = height * 0.8;
  const left = (vw - width) / 2;
  return { top, right: left, bottom: vh - top - height, left };
}

export function insetAt(start: Inset, t: number): Inset {
  const k = 1 - t;
  return { top: start.top * k, right: start.right * k, bottom: start.bottom * k, left: start.left * k };
}

/* a span of `size` centred on `center` inside [0, extent]; a span wider than
   the photo is centred on it instead, overhanging into the ground */
function place(center: number, size: number, extent: number): number {
  if (size >= extent) return (extent - size) / 2;
  return Math.min(Math.max(center - size / 2, 0), extent - size);
}

/* the photo crop that fills the whole viewport once the window is open */
export function openCrop(photo: Photo, vw: number, vh: number): Rect {
  const h = photo.height * photo.openHeight;
  const w = h * (vw / vh);
  return { x: place(photo.focus.x, w, photo.width), y: place(photo.focus.y, h, photo.height), w, h };
}

/* the first frame: the same viewport-shaped crop, zoomed in on the face so
   the small window in the middle of the screen holds it */
export function closedCrop(photo: Photo, vw: number, vh: number, zoom: number): Rect {
  const open = openCrop(photo, vw, vh);
  const w = open.w / zoom;
  const h = open.h / zoom;
  return { x: place(photo.focus.x, w, photo.width), y: place(photo.focus.y, h, photo.height), w, h };
}

export function cropAt(photo: Photo, vw: number, vh: number, zoom: number, t: number): Rect {
  return lerpRect(closedCrop(photo, vw, vh, zoom), openCrop(photo, vw, vh), t);
}

/* cell size: coarse detector cells that hold for the first part of the
   opening, then shrink geometrically to one pixel, fully resolved a little
   before the window reaches the edges */
export function blockAt(startBlock: number, t: number, resolvedAt = 0.85): number {
  const p = Math.min(1, t / resolvedAt);
  return Math.pow(startBlock, 1 - Math.pow(p, 1.5));
}
