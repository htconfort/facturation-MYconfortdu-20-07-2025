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

  // Sauvegarder la signature sans navigation automatique pour éviter les conflits
  const handleSaveSignature = (signatureDataUrl: string) => {
    console.log('📝 Signature sauvegardée:', {
      hasData: !!signatureDataUrl,
      length: signatureDataUrl?.length,
      timestamp: new Date().toISOString()
    });
    
    updateSignature({ 
      dataUrl: signatureDataUrl, 
      timestamp: new Date().toISOString() 
    });
    setShowSignaturePad(false);
    
    console.log('✅ Signature mise à jour dans le store - attente clic Suivant');
    // PAS de navigation automatique - on laisse l'utilisateur cliquer sur "Suivant"
  };

  const handleNext = () => {
    console.log('🚀 StepSignatureNoScroll - handleNext appelé:', {
      hasSignature: !!signature?.dataUrl,
      willProceed: !!signature?.dataUrl
    });
    
    if (!signature?.dataUrl) {
      console.log('❌ Pas de signature - navigation bloquée');
      return;
    }
    
    console.log('✅ Navigation vers étape suivante...');
    // Ajout d'un délai pour éviter les conflits de navigation
    setTimeout(() => {
      onNext();
    }, 100);
  };


  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          ✍️ Signature du Client
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 6/7 • Signature obligatoire pour finaliser
        </p>
      </div>

      {/* Contenu principal - Même logique que le mode normal */}
      <div className='flex-1 px-6 py-6 flex flex-col justify-center items-center'>
        
        {/* Zone de signature ou aperçu */}
        {signature?.dataUrl ? (
          <div className='bg-white rounded-xl border-2 border-myconfort-green p-6 w-full max-w-md text-center'>
            <div className='text-lg font-semibold text-myconfort-green mb-4'>
              ✓ Signature enregistrée
            </div>
            <img
              src={signature.dataUrl}
              alt='Signature'
              className='max-h-32 mx-auto object-contain border rounded'
            />
            <div className='text-xs text-myconfort-dark/70 mt-2'>
              {signature.timestamp &&
                new Date(signature.timestamp).toLocaleString()}
            </div>
            <button
              onClick={() => setShowSignaturePad(true)}
              className='mt-4 px-4 py-2 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 
                         rounded-lg text-sm font-medium transition-colors'
            >
              ✏️ Modifier la signature
            </button>
          </div>
        ) : (
          <div className='bg-white rounded-xl border-2 border-gray-300 p-6 w-full max-w-md text-center'>
            <div className='text-lg font-semibold text-myconfort-dark mb-4'>
              📝 Signature requise
            </div>
            <button
              onClick={() => setShowSignaturePad(true)}
              className='px-6 py-3 bg-myconfort-green hover:bg-myconfort-green/90 
                         text-white font-semibold rounded-xl transition-colors'
            >
              ✍️ Cliquer pour signer
            </button>
          </div>
        )}

      </div>

      {/* Footer navigation - Même style que les autres steps */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4'>
        <button
          onClick={onPrev}
          className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-semibold rounded-xl min-h-[56px] min-w-[120px]'
        >
          ← Précédent
        </button>
        
        <button
          onClick={handleNext}
          disabled={!signature?.dataUrl}
          className={`px-6 py-3 font-semibold rounded-xl min-h-[56px] min-w-[120px]
            ${!signature?.dataUrl
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
              : 'bg-myconfort-green text-white hover:opacity-90'}`}
        >
          {!signature?.dataUrl ? 'Signez d\'abord' : 'Suivant →'}
        </button>
      </div>

      {/* Modal SignaturePad - Exactement le même que le mode normal */}
      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />
    </div>
  );
}

