import { coverCrop, cropAround, lerpRect, type Rect } from "../../lib/pixels";

/*
 * The hero's geometry, as pure functions of the viewport: where the window
 * sits on the first frame, which part of the photograph it shows, and how
 * both open out to the full-bleed picture as the visitor scrolls.
 */

export interface Photo {
  width: number;
  height: number;
  /* the subject, in photo pixels: the window starts centred on it */
  focus: { x: number; y: number };
  /* object-position of the full-bleed crop on a landscape screen */
  landscapeY: number;
}

export interface Inset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/* the window: a 4:5 portrait, centred on desktop, high on a phone */
export function windowInset(vw: number, vh: number): Inset {
  const phone = vw < 700;
  const width = phone ? vw * 0.78 : Math.min(vw * 0.36, vh * 0.72 * 0.8);
  const height = width * 1.25;
  const left = (vw - width) / 2;
  const top = phone ? Math.min(vh * 0.3, vh - height - 24) : (vh - height) / 2;
  return { top, right: left, bottom: Math.max(0, vh - top - height), left };
}

export function insetAt(start: Inset, t: number): Inset {
  const k = 1 - t;
  return { top: start.top * k, right: start.right * k, bottom: start.bottom * k, left: start.left * k };
}

/* the photo crop that fills the whole viewport once the window is open */
export function openCrop(photo: Photo, vw: number, vh: number): Rect {
  const aspect = vw / vh;
  if (aspect >= photo.width / photo.height) {
    return coverCrop(photo.width, photo.height, aspect, 0.5, photo.landscapeY);
  }
  /* portrait screens: keep the subject in frame horizontally */
  const cropW = photo.height * aspect;
  const fx = (photo.focus.x - cropW / 2) / Math.max(1, photo.width - cropW);
  return coverCrop(photo.width, photo.height, aspect, Math.min(1, Math.max(0, fx)), 0.5);
}

/* the first frame: the same viewport-sized crop, zoomed in on the subject so
   the small window in the middle of the screen holds him rather than the sign */
export function closedCrop(photo: Photo, vw: number, vh: number, zoom: number): Rect {
  const open = openCrop(photo, vw, vh);
  return cropAround(photo.width, photo.height, photo.focus.x, photo.focus.y, open.w / zoom, open.h / zoom);
}

export function cropAt(photo: Photo, vw: number, vh: number, zoom: number, t: number): Rect {
  return lerpRect(closedCrop(photo, vw, vh, zoom), openCrop(photo, vw, vh), t);
}

/* cell size: coarse detector cells that shrink geometrically to one pixel,
   fully resolved a little before the window reaches the edges */
export function blockAt(startBlock: number, t: number, resolvedAt = 0.85): number {
  const p = Math.min(1, t / resolvedAt);
  return Math.pow(startBlock, 1 - p);
}
