import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepNouvellesCommandes({ onPrev }: StepProps) {
  const { reset, setStep } = useInvoiceWizard();
  const [isResetting, setIsResetting] = useState(false);

  const handleNewOrder = async () => {
    setIsResetting(true);

    // Petit délai pour l'animation
    setTimeout(() => {
      reset(); // Réinitialiser tout le store
      setStep('facture'); // Retourner à la première étape
      setIsResetting(false);
    }, 1000);
  };

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          🎯 Nouvelles Commandes
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 8/8 • Terminer et recommencer
        </p>
      </div>

      {/* Contenu principal */}
      <div className='flex-1 px-6 py-8 flex flex-col justify-center items-center'>
        {isResetting ? (
          /* État de chargement */
          <div className='text-center space-y-6'>
            <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-myconfort-green mx-auto'></div>
            <div>
              <h2 className='text-xl font-bold text-myconfort-dark mb-2'>
                🔄 Réinitialisation en cours...
              </h2>
              <p className='text-myconfort-dark/70'>
                Préparation d'une nouvelle commande
              </p>
            </div>
          </div>
        ) : (
          /* Interface principale */
          <div className='max-w-2xl text-center space-y-8'>
            {/* Icône de succès */}
            <div className='w-24 h-24 bg-myconfort-green/10 rounded-full flex items-center justify-center mx-auto'>
              <div className='text-4xl'>✅</div>
            </div>

            {/* Message de fin */}
            <div className='space-y-4'>
              <h2 className='text-3xl font-bold text-myconfort-dark'>
                Commande terminée !
              </h2>
              <p className='text-lg text-myconfort-dark/70'>
                Votre facture a été enregistrée avec succès. Vous pouvez
                maintenant créer une nouvelle commande.
              </p>
            </div>

            {/* Statistiques de la session */}
            <div className='bg-myconfort-green/5 p-6 rounded-xl border border-myconfort-green/20'>
              <h3 className='text-lg font-bold text-myconfort-dark mb-4'>
                📊 Résumé de cette session
              </h3>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold text-myconfort-green'>
                    1
                  </div>
                  <div className='text-sm text-myconfort-dark/70'>
                    Facture créée
                  </div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-myconfort-blue'>
                    7
                  </div>
                  <div className='text-sm text-myconfort-dark/70'>
                    Étapes complétées
                  </div>
                </div>
                <div>
                  <div className='text-2xl font-bold text-orange-600'>3</div>
                  <div className='text-sm text-myconfort-dark/70'>
                    Actions réalisées
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton principal */}
            <button
              onClick={handleNewOrder}
              className='w-full max-w-md px-8 py-6 bg-myconfort-green hover:bg-myconfort-green/90 
                         text-white font-bold rounded-xl text-xl shadow-lg transition-all 
                         transform hover:scale-105 mx-auto block'
            >
              🚀 Créer une nouvelle commande
            </button>

            {/* Action secondaire */}
            <div className='flex justify-center'>
              <button
                onClick={() => window.location.reload()}
                className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                           font-bold rounded-xl text-lg transition-all shadow-lg min-h-[56px]'
              >
                🔄 Recharger l'application
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎯 Bouton navigation flottant - aligné avec les autres */}
      <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50'>
        <button
          onClick={onPrev}
          disabled={isResetting}
          className={`px-8 py-4 font-bold rounded-xl text-lg transition-all shadow-lg min-h-[56px] ${
            isResetting
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          ← Retour au récap
        </button>
      </div>
    </div>
  );
}
