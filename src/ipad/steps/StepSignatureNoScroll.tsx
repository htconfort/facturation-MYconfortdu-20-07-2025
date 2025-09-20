import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { SignaturePad } from '../../components/SignaturePad';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepSignatureNoScroll({ onNext, onPrev }: StepProps) {
  const { signature, updateSignature } = useInvoiceWizard();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  
  // Debug pour identifier le problème de navigation
  console.log('🔧 StepSignatureNoScroll - État signature:', {
    hasSignature: !!signature?.dataUrl,
    timestamp: signature?.timestamp,
    navigationFunctions: { onNext: typeof onNext, onPrev: typeof onPrev }
  });

  // Sauvegarde transactionnelle + navigation après succès seulement
  const handleSaveSignature = async (signatureDataUrl: string): Promise<boolean> => {
    try {
      updateSignature({ dataUrl: signatureDataUrl, timestamp: new Date().toISOString() });
      setShowSignaturePad(false);
      // Navigation après que le store ait été mis à jour
      setTimeout(() => {
        onNext();
      }, 120);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de signature:', error);
      return false;
    }
  };

  const handleNext = () => {
    if (!signature?.dataUrl) return;
    onNext();
  };

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative p-6'>
      <div className='flex-1 flex items-center justify-center'>
        {signature?.dataUrl ? (
          <div className='bg-white rounded-xl border-2 border-gray-300 p-6 text-center'>
            <div className='text-lg font-semibold text-myconfort-dark mb-4'>
              ✔️ Signature enregistrée
            </div>
            <img
              src={signature.dataUrl}
              alt='Signature'
              className='mx-auto max-h-40 rounded border'
            />
            <div className='text-xs text-gray-500 mt-2'>
              {signature.timestamp}
            </div>
            <button
              onClick={() => setShowSignaturePad(true)}
              className='mt-4 px-6 py-3 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 text-myconfort-dark font-semibold rounded-xl'
            >
              Refaire la signature
            </button>
          </div>
        ) : (
          <div className='bg-white rounded-xl border-2 border-gray-300 p-6 w-full max-w-md text-center'>
            <div className='text-lg font-semibold text-myconfort-dark mb-4'>
              📝 Signature requise
            </div>
            <button
              onClick={() => setShowSignaturePad(true)}
              className='px-6 py-3 bg-myconfort-green hover:bg-myconfort-green/90 text-white font-semibold rounded-xl transition-colors'
            >
              ✍️ Cliquer pour signer
            </button>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4'>
        <button
          onClick={onPrev}
          className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl min-h-[56px] min-w-[120px]'
        >
          ← Précédent
        </button>
        <button
          onClick={handleNext}
          disabled={!signature?.dataUrl}
          className={`px-6 py-3 font-semibold rounded-xl min-h-[56px] min-w-[120px] ${!signature?.dataUrl ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' : 'bg-myconfort-green text-white hover:opacity-90'}`}
        >
          {!signature?.dataUrl ? 'Signez d\'abord' : 'Suivant →'}
        </button>
      </div>

      {/* Modal SignaturePad */}
      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />
    </div>
  );
}

