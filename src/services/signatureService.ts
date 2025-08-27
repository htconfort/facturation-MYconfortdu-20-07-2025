import SignaturePad from 'signature_pad';

export type SignatureExport = {
  pngDataUrl: string;
  blob: Blob;
  timestamp: string;  // ISO
};

export function initSignaturePad(
  canvas: HTMLCanvasElement,
  { penColor = '#ff00ff', minWidth = 1.5, maxWidth = 4.0 }: { penColor?: string; minWidth?: number; maxWidth?: number } = {}
) {
  const paintBackground = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const { offsetWidth, offsetHeight } = canvas;
    if (!offsetWidth || !offsetHeight) return;
    canvas.width = Math.floor(offsetWidth * ratio);
    canvas.height = Math.floor(offsetHeight * ratio);
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#ffffff';              // ⬅️ fond OPAQUE
    ctx.fillRect(0, 0, offsetWidth, offsetHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
  };

  paintBackground();

  const pad = new SignaturePad(canvas, {
    throttle: 8,
    minWidth,
    maxWidth,
    penColor,                               // ⬅️ trait MAGENTA pour test visuel
    velocityFilterWeight: 0.7,
    minDistance: 2,
    dotSize: 1.5,
  }) as SignaturePad & { __repaintBackground?: () => void };

  pad.__repaintBackground = () => {
    const data = pad.toData();
    paintBackground();
    pad.clear();
    if (data.length) { try { pad.fromData(data); } catch { /* ignore */ } }
  };

  pad.clear();
  return pad;
}

export async function exportSignature(pad: SignaturePad) {
  const timestamp = new Date().toISOString();
  const src = (pad as any).canvas as HTMLCanvasElement;

  // ⬇️ Compose sur fond blanc OPAQUE avant l'export
  const out = document.createElement('canvas');
  out.width = src.width;
  out.height = src.height;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(src, 0, 0);

  const pngDataUrl = out.toDataURL('image/png');
  const res = await fetch(pngDataUrl);
  const blob = await res.blob();

  return { pngDataUrl, blob, timestamp };
}
