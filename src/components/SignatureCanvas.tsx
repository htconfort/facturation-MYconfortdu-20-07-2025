import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Trash2, RotateCcw, Check, Download } from 'lucide-react';

interface SignatureCanvasProps {
  /** Callback when signature changes */
  onSignatureChange?: (signatureDataUrl: string | null) => void;
  /** Initial signature data URL */
  initialSignature?: string;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Background color */
  backgroundColor?: string;
  /** Pen color */
  penColor?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Custom className */
  className?: string;
  /** Label for accessibility */
  label?: string;
}

/**
 * Composant signature tactile optimisé iPad
 * Utilise signature_pad avec configuration pour stylet Apple Pencil
 */
export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSignatureChange,
  initialSignature,
  width = 800,
  height = 300,
  backgroundColor = '#F2EFE2', // myconfort-cream
  penColor = '#14281D', // myconfort-dark
  readOnly = false,
  className = '',
  label = 'Zone de signature'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSignaturePadReady, setIsSignaturePadReady] = useState(false);

  // Initialize SignaturePad
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Set canvas size with device pixel ratio for crisp lines
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    // Initialize SignaturePad with optimized settings for iPad
    const signaturePad = new SignaturePad(canvas, {
      backgroundColor,
      penColor,
      minWidth: 1.5,
      maxWidth: 3.5,
      throttle: 16, // 60fps for smooth drawing
      minDistance: 1,
      velocityFilterWeight: 0.7,
      // Optimized for touch/stylus
      dotSize: 1.5,
    });

    // Configure for read-only mode
    if (readOnly) {
      signaturePad.off();
    }

    // Event handlers
    const handleChange = () => {
      const isEmpty = signaturePad.isEmpty();
      setIsEmpty(isEmpty);
      
      if (onSignatureChange) {
        onSignatureChange(isEmpty ? null : signaturePad.toDataURL('image/png'));
      }
    };

    signaturePad.addEventListener('afterUpdateStroke', handleChange);
    signaturePad.addEventListener('endStroke', handleChange);

    signaturePadRef.current = signaturePad;
    setIsSignaturePadReady(true);

    // Load initial signature if provided
    if (initialSignature && initialSignature.trim()) {
      try {
        signaturePad.fromDataURL(initialSignature);
        setIsEmpty(false);
      } catch (error) {
        console.error('Error loading initial signature:', error);
      }
    }

    return () => {
      signaturePad.removeEventListener('afterUpdateStroke', handleChange);
      signaturePad.removeEventListener('endStroke', handleChange);
      signaturePad.off();
    };
  }, [width, height, backgroundColor, penColor, readOnly, onSignatureChange, initialSignature]);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
      onSignatureChange?.(null);
    }
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop(); // Remove last stroke
        signaturePadRef.current.fromData(data);
        
        const isEmpty = signaturePadRef.current.isEmpty();
        setIsEmpty(isEmpty);
        onSignatureChange?.(isEmpty ? null : signaturePadRef.current.toDataURL('image/png'));
      }
    }
  };

  const handleDownload = () => {
    if (signaturePadRef.current && !isEmpty) {
      const dataURL = signaturePadRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `signature-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const getSignatureData = () => {
    if (signaturePadRef.current && !isEmpty) {
      return {
        dataURL: signaturePadRef.current.toDataURL('image/png'),
        isEmpty: false,
        timestamp: new Date().toISOString()
      };
    }
    return {
      dataURL: null,
      isEmpty: true,
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div className={`signature-canvas-container ${className}`}>
      {/* Canvas container with border */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`
            border-2 border-gray-300 rounded-lg cursor-crosshair
            touch-manipulation
            ${readOnly ? 'pointer-events-none bg-gray-50' : 'bg-myconfort-cream'}
            ${!isSignaturePadReady ? 'opacity-50' : ''}
          `}
          aria-label={label}
          role="img"
          tabIndex={readOnly ? -1 : 0}
        />
        
        {/* Overlay message when empty */}
        {isEmpty && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-400 text-lg font-manrope text-center">
              <div className="mb-2">✍️</div>
              <div>Signez dans cette zone</div>
              <div className="text-sm mt-1">Compatible avec Apple Pencil</div>
            </div>
          </div>
        )}

        {/* Read-only indicator */}
        {readOnly && !isEmpty && (
          <div className="absolute top-2 right-2 bg-myconfort-blue text-white px-2 py-1 rounded text-sm">
            Signature enregistrée
          </div>
        )}
      </div>

      {/* Action buttons - only show if not read-only */}
      {!readOnly && (
        <div className="flex items-center justify-between mt-4 gap-3">
          <div className="flex gap-3">
            {/* Clear button */}
            <button
              onClick={handleClear}
              disabled={isEmpty}
              className={`
                flex items-center gap-2 px-4 py-3 min-h-[56px]
                rounded-lg font-medium font-manrope
                transition-colors duration-150
                touch-manipulation
                ${isEmpty 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-myconfort-coral text-white hover:bg-red-600 active:bg-red-700'
                }
              `}
              aria-label="Effacer la signature"
            >
              <Trash2 size={20} />
              <span>Effacer</span>
            </button>

            {/* Undo button */}
            <button
              onClick={handleUndo}
              disabled={isEmpty}
              className={`
                flex items-center gap-2 px-4 py-3 min-h-[56px]
                rounded-lg font-medium font-manrope
                transition-colors duration-150
                touch-manipulation
                ${isEmpty 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-myconfort-dark hover:bg-gray-300 active:bg-gray-400'
                }
              `}
              aria-label="Annuler le dernier trait"
            >
              <RotateCcw size={20} />
              <span>Annuler</span>
            </button>
          </div>

          <div className="flex gap-3">
            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isEmpty}
              className={`
                flex items-center gap-2 px-4 py-3 min-h-[56px]
                rounded-lg font-medium font-manrope
                transition-colors duration-150
                touch-manipulation
                ${isEmpty 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-myconfort-blue text-white hover:bg-blue-600 active:bg-blue-700'
                }
              `}
              aria-label="Télécharger la signature"
            >
              <Download size={20} />
              <span>Télécharger</span>
            </button>

            {/* Status indicator */}
            <div className={`
              flex items-center gap-2 px-4 py-3 min-h-[56px]
              rounded-lg font-medium font-manrope
              ${isEmpty 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-myconfort-green text-white'
              }
            `}>
              <Check size={20} />
              <span>{isEmpty ? 'En attente' : 'Signée'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;
