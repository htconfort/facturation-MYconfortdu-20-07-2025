import SignaturePad from 'signature_pad';

export type SignatureExport = {
  pngDataUrl: string;          // data:image/png;base64,...
  blob: Blob;
  timestamp: string;           // ISO
};

export function initSignaturePad(canvas: HTMLCanvasElement) {
  const pad = new SignaturePad(canvas, {
    throttle: 16,               // fluidité stylet
    minWidth: 0.75,
    maxWidth: 2.5,
    penColor: '#14281D',
    backgroundColor: 'rgba(255,255,255,0)'
  });
  
  // Ajuste la densité pour iPad HD
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(ratio, ratio);
  pad.clear();
  return pad;
}

export async function exportSignature(pad: SignaturePad): Promise<SignatureExport> {
  const timestamp = new Date().toISOString();
  const pngDataUrl = pad.toDataURL('image/png');
  const res = await fetch(pngDataUrl);
  const blob = await res.blob();
  return { pngDataUrl, blob, timestamp };
}
