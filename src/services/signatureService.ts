import SignaturePad from 'signature_pad';

export type SignatureExport = {
  pngDataUrl: string; // data:image/png;base64,...
  blob: Blob;
  timestamp: string; // ISO
};

export function initSignaturePad(canvas: HTMLCanvasElement) {
  const pad = new SignaturePad(canvas, {
    throttle: 16,
    minWidth: 0.75,
    maxWidth: 2.5,
    penColor: '#14281D',
    backgroundColor: '#FFFFFF', // évite la "disparition" visuelle sur iPad/WebView
  });

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const { offsetWidth, offsetHeight } = canvas;
  if (offsetWidth > 0 && offsetHeight > 0) {
    canvas.width = offsetWidth * ratio;
    canvas.height = offsetHeight * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(ratio, ratio);
  }
  pad.clear();
  return pad;
}

export async function exportSignature(pad: SignaturePad) {
  const timestamp = new Date().toISOString();
  const pngDataUrl = pad.toDataURL('image/png');
  const res = await fetch(pngDataUrl);
  const blob = await res.blob();
  return { pngDataUrl, blob, timestamp };
}
