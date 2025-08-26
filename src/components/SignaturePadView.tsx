import { useEffect, useRef, useState } from 'react';
import type SignaturePad from 'signature_pad';
import { initSignaturePad, exportSignature } from '../services/signatureService';

type Props = {
  onSigned?: (dataUrl: string, timestamp: string) => void;
  onPrevious?: () => void;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
  className?: string;
};

export default function SignaturePadView({
  onSigned,
  onPrevious,
  onDrawingStart,
  onDrawingEnd,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pad, setPad] = useState<SignaturePad | null>(null);
  const [hasInk, setHasInk] = useState(false);     // ⇐ y a-t-il quelque chose de dessiné ?
  const [saving, setSaving] = useState(false);     // ⇐ état local d'enregistrement

  // garder des refs stables pour les callbacks
  const onStartRef = useRef(onDrawingStart);
  const onEndRef = useRef(onDrawingEnd);
  useEffect(() => { onStartRef.current = onDrawingStart; }, [onDrawingStart]);
  useEffect(() => { onEndRef.current = onDrawingEnd; }, [onDrawingEnd]);

  // init du pad une seule fois
  useEffect(() => {
    if (!canvasRef.current) return;
    const p = initSignaturePad(canvasRef.current);

    // Utiliser l'API native signature_pad
    (p as any).onBegin = () => {
      onStartRef.current?.();
      // dès qu'on commence un trait, on considère qu'il y a de l'encre
      setHasInk(true);
    };
    (p as any).onEnd = () => {
      onEndRef.current?.();
      // si effacé par un clear programmatique, hasInk repassera à false
      setHasInk(!p.isEmpty());
    };

    setPad(p);

    // resize avec conservation des traits
    const handleResize = () => {
      if (!canvasRef.current) return;
      const data = p.toData();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const { offsetWidth, offsetHeight } = canvasRef.current;
      if (offsetWidth === 0 || offsetHeight === 0) return;
      canvasRef.current.width = offsetWidth * ratio;
      canvasRef.current.height = offsetHeight * ratio;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);
      p.clear();
      if (data.length > 0) {
        try { p.fromData(data); } catch { /* noop si incompatible */ }
      }
      setHasInk(!p.isEmpty());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClear = () => {
    pad?.clear();
    setHasInk(false); // ⇐ désactive "Enregistrer" après effacement
  };

  const handleSave = async () => {
    if (!pad || pad.isEmpty() || saving) return;
    try {
      setSaving(true);
      const { pngDataUrl, timestamp } = await exportSignature(pad);
      onSigned?.(pngDataUrl, timestamp);
      // ⚠️ aucune navigation ici : on laisse l'utilisateur cliquer "Suivant" côté parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className || ''}`}>
      <div className='rounded-2xl border border-myconfort-dark/20 bg-white shadow-sm p-2'>
        <div className='h-[280px] w-full'>
          <canvas
            ref={canvasRef}
            className='h-full w-full rounded-xl'
            style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        {onPrevious && (
          <button
            onClick={onPrevious}
            className='px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 min-h-[56px] font-semibold'
          >
            ← Précédent
          </button>
        )}

        <button
          onClick={handleClear}
          className='px-4 py-2 rounded-xl bg-myconfort-blue/20 hover:bg-myconfort-blue/30 min-h-[56px] font-semibold'
        >
          Effacer
        </button>

        <button
          onClick={handleSave}
          disabled={!hasInk || saving} // ⇐ activé seulement quand il y a de l'encre et pas en cours de save
          className={`px-4 py-2 rounded-xl min-h-[56px] font-semibold
            ${(!hasInk || saving)
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
              : 'bg-myconfort-green text-white hover:opacity-90'}`}
        >
          {saving ? '💾 Sauvegarde…' : 'Enregistrer la signature'}
        </button>
      </div>
    </div>
  );
}
