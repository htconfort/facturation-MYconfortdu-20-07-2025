import SignaturePad from 'signature_pad';

export type SignatureExport = {
  pngDataUrl: string; // data:image/png;base64,...
  blob: Blob;
  timestamp: string; // ISO
};

export function initSignaturePad(canvas: HTMLCanvasElement) {
  // 🔧 SOLUTION SIGNATURE INVISIBLE IPAD: Fond blanc OPAQUE obligatoire
  const pad = new SignaturePad(canvas, {
    throttle: 8,                    // 🔧 Réduction pour plus de fluidité sur iPad
    minWidth: 1.5,                  // 🔧 Traits plus épais pour meilleure visibilité
    maxWidth: 4.0,                  // 🔧 Largeur max augmentée  
    penColor: '#111827',            // 🔧 CONTRASTE ABSOLU pour Safari iPad
    backgroundColor: 'rgb(255,255,255)', // 🔧 BLANC OPAQUE - évite transparence
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
      
      // 🔧 PEINDRE FOND BLANC BITMAP EXPLICITE pour iPad Safari
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, offsetWidth, offsetHeight);
      ctx.restore();
    }
  }
  
  // 🔧 Fonction helper CRITIQUE pour repeindre fond après resize
  (pad as any).__repaintBackground = function() {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const { offsetWidth, offsetHeight } = canvas;
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, offsetWidth, offsetHeight);
      ctx.restore();
    }
  };
  
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
