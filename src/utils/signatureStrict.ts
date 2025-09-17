export function hasInkOnCanvas(
  canvas: HTMLCanvasElement,
  tolerance: number = 12,
  minColoredPixels: number = 80
): boolean {
  try {
    const off = document.createElement('canvas');
    off.width = 64;
    off.height = 64;
    const octx = off.getContext('2d');
    if (!octx) return false;
    octx.drawImage(canvas, 0, 0, off.width, off.height);
    const img = octx.getImageData(0, 0, off.width, off.height).data;
    let colored = 0;
    for (let i = 0; i < img.length; i += 4) {
      const r = img[i], g = img[i + 1], b = img[i + 2], a = img[i + 3];
      if (a === 0) continue;
      if (r < 255 - tolerance || g < 255 - tolerance || b < 255 - tolerance) {
        colored++;
        if (colored >= minColoredPixels) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
