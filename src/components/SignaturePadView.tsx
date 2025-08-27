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

    // Utiliser les événements de signature_pad v5
    p.addEventListener('beginStroke', () => {
      onStartRef.current?.();
      // dès qu'on commence un trait, on considère qu'il y a de l'encre
      setHasInk(true);
    });
    
    p.addEventListener('endStroke', () => {
      onEndRef.current?.();
      // vérifier s'il y a encore du contenu après le trait
      setHasInk(!p.isEmpty());
    });

    // Solution de secours : écouter directement sur le canvas
    const handleCanvasInteraction = () => {
      // petite temporisation pour que le trait soit enregistré
      setTimeout(() => {
        const isEmpty = p.isEmpty();
        setHasInk(!isEmpty);
      }, 50);
    };

    canvasRef.current.addEventListener('pointerup', handleCanvasInteraction);
    canvasRef.current.addEventListener('touchend', handleCanvasInteraction);
    canvasRef.current.addEventListener('mouseup', handleCanvasInteraction);

    setPad(p);

    // fonction de nettoyage des événements
    const cleanupEvents = () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('pointerup', handleCanvasInteraction);
        canvasRef.current.removeEventListener('touchend', handleCanvasInteraction);
        canvasRef.current.removeEventListener('mouseup', handleCanvasInteraction);
      }
    };

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
      if (ctx) {
        ctx.scale(ratio, ratio);
        // 🔧 CRITIQUE: Repeindre fond blanc après resize pour iPad
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, offsetWidth, offsetHeight);
        ctx.restore();
      }
      
      // 🔧 Alternative: utiliser helper si disponible
      if ((p as any).__repaintBackground) {
        (p as any).__repaintBackground();
      }
      
      p.clear();
      if (data.length > 0) {
        try { p.fromData(data); } catch { /* noop si incompatible */ }
      }
      setHasInk(!p.isEmpty());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupEvents();
    };
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
      <div className='rounded-2xl border-2 border-myconfort-dark/20 bg-white shadow-sm p-2'>
        <div className='h-[280px] w-full relative'>
          <canvas
            ref={canvasRef}
            className='h-full w-full rounded-xl bg-white'
            style={{ 
              touchAction: 'none', 
              overscrollBehavior: 'contain',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* 🔧 Indicateur visuel pour iPad quand vide */}
          {!hasInk && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400'>
              <div className='text-center'>
                <div className='text-2xl mb-2'>✍️</div>
                <div className='text-sm font-medium'>Signez dans cette zone</div>
                <div className='text-xs mt-1'>Compatible Apple Pencil et doigt</div>
              </div>
            </div>
          )}
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
