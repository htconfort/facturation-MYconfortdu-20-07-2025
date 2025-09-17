import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { useSingleFlight } from '../hooks/useSingleFlight';
import { hasInkOnCanvas } from '../utils/signatureStrict';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => Promise<boolean> | boolean; // return success flag
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePad, setSignaturePad] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: strokes sufficiency fallback (uses library API)
  const hasSufficientStrokes = useCallback((): boolean => {
    try {
      if (!signaturePad?.toData) return false;
      const strokes = signaturePad.toData() || [];
      // Sum all points
      const pointCount = strokes.reduce((sum: number, s: any) => sum + (s.points?.length || 0), 0);
      return pointCount >= 12 || strokes.length >= 2; // relaxed acceptance
    } catch {
      return false;
    }
  }, [signaturePad]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    let cleanupFns: Array<() => void> = [];

    import('signature_pad').then(SignaturePadModule => {
      const SignaturePad = SignaturePadModule.default;
      const canvas = canvasRef.current!;

      // Set canvas size (device pixel ratio for crisp drawing)
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      // Paint white background to avoid transparent exports
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);

      const pad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: '#0f172a',
        minWidth: 2,   // slightly thicker for reliability
        maxWidth: 4,
        throttle: 16,
      });

      setSignaturePad(pad);

      // Pointer/touch handling: prevent scroll only inside the canvas
      const startDrawing = () => setIsDrawing(true);
      const stopDrawing = () => setIsDrawing(false);

      const preventScroll = (e: TouchEvent) => {
        e.preventDefault();
      };

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('touchstart', startDrawing, { passive: false } as any);
      canvas.addEventListener('touchend', stopDrawing as any, { passive: false } as any);
      canvas.addEventListener('touchmove', preventScroll, { passive: false } as any);

      cleanupFns.push(() => canvas.removeEventListener('mousedown', startDrawing));
      cleanupFns.push(() => canvas.removeEventListener('mouseup', stopDrawing));
      cleanupFns.push(() => canvas.removeEventListener('touchstart', startDrawing as any));
      cleanupFns.push(() => canvas.removeEventListener('touchend', stopDrawing as any));
      cleanupFns.push(() => canvas.removeEventListener('touchmove', preventScroll as any));
    });

    return () => {
      cleanupFns.forEach(fn => {
        try { fn(); } catch {}
      });
    };
  }, [isOpen]);

  const clearSignature = () => {
    if (signaturePad && canvasRef.current) {
      signaturePad.clear();
      // repaint white background
      const c = canvasRef.current;
      const rect = c.getBoundingClientRect();
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
      setError(null);
    }
  };

  const exportDataUrl = (): string | null => {
    if (!signaturePad || signaturePad.isEmpty()) return null;
    try {
      const dataURL = signaturePad.toDataURL('image/png');
      return dataURL;
    } catch (e) {
      return null;
    }
  };

  const saveOnce = useSingleFlight(async () => {
    setError(null);
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const hasPixels = canvas ? hasInkOnCanvas(canvas, 20, 30) : false; // relaxed tolerance
      if (!hasPixels && !hasSufficientStrokes()) {
        setError('Signature trop courte. Veuillez signer lisiblement.');
        return false;
      }
      const dataURL = exportDataUrl();
      if (!dataURL) {
        setError('Erreur: impossible d’exporter la signature.');
        return false;
      }
      const ok = await Promise.resolve(onSave(dataURL));
      if (ok) {
        onClose();
      } else {
        setError('La sauvegarde de la signature a échoué.');
      }
      return ok;
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la sauvegarde.');
      return false;
    } finally {
      setSaving(false);
    }
  });

  const saveSignature = useCallback(() => {
    if (saving) return;
    void saveOnce();
  }, [saveOnce, saving]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='text-xl font-bold text-[#14281D]'>
            Signature du client
          </h3>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='p-4'>
          <div className='border-2 border-gray-300 rounded mb-4 bg-white'>
            <canvas
              ref={canvasRef}
              id='signatureCanvas'
              className='w-full h-48 touch-none select-none pointer-events-auto'
            />
          </div>

          <div className='text-sm text-gray-600 mb-4 text-center'>
            {isDrawing ? 'Signature en cours…' : 'Signez dans la zone ci-dessus'}
          </div>

          {error && (
            <div className='mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2'>
              {error}
            </div>
          )}

          <div className='flex justify-between'>
            <button
              onClick={clearSignature}
              className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all'
              disabled={saving}
            >
              <RotateCcw className='w-4 h-4' />
              <span>Effacer</span>
            </button>

            <div className='flex space-x-2'>
              <button
                onClick={onClose}
                className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all'
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={saveSignature}
                disabled={saving}
                aria-busy={saving}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${saving ? 'bg-[#477A0C]/60 cursor-not-allowed' : 'bg-[#477A0C] hover:bg-[#3A6A0A]'} text-white`}
              >
                <Check className='w-4 h-4' />
                <span>{saving ? 'Enregistrement...' : 'Valider'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
