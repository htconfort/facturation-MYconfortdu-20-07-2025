import SignaturePad from 'signature_pad';

export type SignatureExport = {
  pngDataUrl: string; // data:image/png;base64,...
  blob: Blob;
  timestamp: string; // ISO
};

export function initSignaturePad(canvas: HTMLCanvasElement) {
  const pad = new SignaturePad(canvas, {
    throttle: 8,                    // 🔧 Réduction pour plus de fluidité sur iPad
    minWidth: 1.5,                  // 🔧 Traits plus épais pour meilleure visibilité
    maxWidth: 4.0,                  // 🔧 Largeur max augmentée  
    penColor: '#000000',            // 🔧 Noir pur pour contraste maximum sur iPad
    backgroundColor: 'rgba(255,255,255,0)', // 🔧 Fond transparent pour éviter conflits WebView
    velocityFilterWeight: 0.7,      // 🔧 Lissage optimisé pour stylet/doigt
    minDistance: 2,                 // 🔧 Distance minimum entre points
    dotSize: 1.5,                   // 🔧 Taille des points pour départ de trait
  });

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const { offsetWidth, offsetHeight } = canvas;
  if (offsetWidth > 0 && offsetHeight > 0) {
    canvas.width = offsetWidth * ratio;
    canvas.height = offsetHeight * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
      // 🔧 Configuration explicite du contexte pour iPad
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
    }
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
