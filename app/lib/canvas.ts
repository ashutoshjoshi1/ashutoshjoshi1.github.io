/* size a canvas's backing store to its CSS box at the screen's density
   (capped), and report the CSS size to draw in */
export function fitCanvas(canvas: HTMLCanvasElement, maxDpr = 2): { width: number; height: number; dpr: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const bw = Math.round(width * dpr);
  const bh = Math.round(height * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  return { width, height, dpr };
}
