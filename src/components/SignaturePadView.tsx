import { useEffect, useRef, useState } from 'react';
import type SignaturePad from 'signature_pad';
import {
  initSignaturePad,
  exportSignature,
} from '../services/signatureService';

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

  useEffect(() => {
    if (!canvasRef.current) return;
    const p = initSignaturePad(canvasRef.current);
    
    // Callbacks pour gérer l'état de dessin
    p.addEventListener('beginStroke', () => onDrawingStart?.());
    p.addEventListener('endStroke', () => onDrawingEnd?.());
    
    setPad(p);

    const handleResize = () => {
      if (!canvasRef.current) return;
      const wasEmpty = p.isEmpty();
      const data = p.toData();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
      canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);
      p.clear();
      if (!wasEmpty) p.fromData(data);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onDrawingStart, onDrawingEnd]);

  const handleClear = () => pad?.clear();

  const handleSave = async () => {
    if (!pad || pad.isEmpty()) return;
    const { pngDataUrl, timestamp } = await exportSignature(pad);
    onSigned?.(pngDataUrl, timestamp);
  };

  return (
    <div className={`flex flex-col gap-3 ${className || ''}`}>
      <div className='rounded-2xl border border-myconfort-dark/20 bg-white shadow-sm p-2'>
        <div className='h-[280px] w-full'>
          <canvas
            ref={canvasRef}
            className='h-full w-full rounded-xl touch-none'
            style={{ 
              touchAction: 'none', 
              overscrollBehavior: 'contain' 
            }}
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
          className='px-4 py-2 rounded-xl bg-myconfort-green text-white hover:opacity-90 min-h-[56px] font-semibold'
        >
          Enregistrer la signature
        </button>
      </div>
    </div>
  );
}
