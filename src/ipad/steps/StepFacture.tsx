import { useState, useEffect } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { generateInvoiceNumber } from '../../utils/calculations';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepFacture({ onNext, onQuit }: StepProps) {
  const { invoiceNumber, invoiceDate, eventLocation, advisorName, setInvoiceData, updateAdvisorName } =
    useInvoiceWizard();
  const [hasEditedLocation, setHasEditedLocation] = useState(false);
  const [hasEditedAdvisor, setHasEditedAdvisor] = useState(false);

  // Générer automatiquement un numéro de facture et la date du jour si vides
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    // Toujours générer un nouveau numéro de facture au démarrage
    const newInvoiceNumber = generateInvoiceNumber();
    console.log('🔢 Génération numéro facture StepFacture:', newInvoiceNumber);
    
    // Mettre à jour les deux en une seule fois
    setInvoiceData({ 
      invoiceNumber: newInvoiceNumber,
      invoiceDate: today 
    });
  }, []); // Exécuter une seule fois au montage

  const validateAndNext = () => {
    // Le lieu d'événement ET le conseiller sont obligatoires
    if (!eventLocation || eventLocation.trim() === '') {
      return;
    }
    
    if (!advisorName || advisorName.trim() === '') {
      return;
    }

    onNext();
  };

  // État de validation pour les couleurs des cadres
  const isLocationValid = eventLocation && eventLocation.trim() !== '';
  const isLocationEmpty = !eventLocation || eventLocation.trim() === '';
  const isAdvisorValid = advisorName && advisorName.trim() !== '';
  const isAdvisorEmpty = !advisorName || advisorName.trim() === '';
  const isFormValid = isLocationValid && isAdvisorValid;

  return (
    <div className='max-w-6xl mx-auto py-2 relative'>
      {/* Header avec style MyConfort - COMPACT */}
      <div className='bg-[#477A0C] rounded-lg shadow-lg p-4 mb-4 border border-gray-100'>
        <h1 className='text-2xl font-bold text-[#F2EFE2] mb-3 flex items-center justify-center'>
          <span className='bg-[#F2EFE2] text-[#477A0C] px-6 py-2 rounded-full font-bold text-xl'>
            📋 INFORMATIONS FACTURE
          </span>
        </h1>

        <div className='bg-[#F2EFE2] rounded-lg p-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Informations entreprise */}
            <div className='space-y-1'>
              <h2 className='text-lg font-bold text-black mb-2'>
                <strong>MYCONFORT</strong>
              </h2>
              <p className='text-black font-semibold text-sm'>
                <strong>88 Avenue des Ternes</strong>
              </p>
              <p className='text-black font-semibold text-sm'>
                75017 Paris, France
              </p>
              <p className='text-black font-semibold text-sm'>
                SIRET: 824 313 530 00027
              </p>
              <p className='text-black font-semibold text-sm'>
                Tél: 04 68 50 41 45
              </p>
              <p className='text-black font-semibold text-sm'>
                Email: myconfort@gmail.com
              </p>
              <p className='text-black font-semibold text-sm'>
                Site web: https://www.htconfort.com
              </p>
            </div>

            {/* Détails facture */}
            <div className='space-y-3'>
              {/* Numéro de facture */}
              <div className='flex flex-col space-y-1'>
                <span className='font-bold text-black text-sm'>
                  Facture n°: <span className='text-green-600'>✓ Auto</span>
                </span>
                <input
                  value={invoiceNumber || 'Génération...'}
                  type='text'
                  className='border-2 border-[#477A0C] rounded-lg px-3 py-2 text-base font-mono text-black bg-green-50 focus:border-[#F55D3E] focus:ring-1 focus:ring-[#89BBFE] transition-all font-bold'
                  readOnly
                />
                <p className='text-green-600 text-xs font-semibold'>
                  ✅ Numéro généré automatiquement
                </p>
              </div>

              {/* Date facture */}
              <div className='flex flex-col space-y-1'>
                <label className='font-bold text-black text-sm'>
                  Date: <span className='text-green-600'>✓ Auto</span>
                </label>
                <input
                  value={invoiceDate}
                  onChange={e =>
                    setInvoiceData({ invoiceDate: e.target.value })
                  }
                  type='date'
                  className='border-2 border-green-500 rounded-lg px-3 py-2 text-sm text-black bg-green-50 focus:ring-1 focus:ring-green-300 transition-all font-bold'
                />
                <p className='text-green-600 text-xs font-semibold'>
                  ✅ Date remplie automatiquement
                </p>
              </div>

              {/* Lieu événement */}
              <div className='flex flex-col space-y-1'>
                <label className='font-bold text-black text-sm'>
                  Lieu de l'événement: <span className='text-red-600'>*</span>
                </label>
                <input
                  value={eventLocation}
                  onChange={e => {
                    setInvoiceData({ eventLocation: e.target.value });
                    setHasEditedLocation(true);
                  }}
                  type='text'
                  required
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-black bg-white focus:ring-1 transition-all font-bold ${
                    isLocationEmpty && hasEditedLocation
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : isLocationValid
                        ? 'border-green-500 focus:border-green-600 focus:ring-green-200 bg-green-50'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  }`}
                  placeholder="Ex: Salon de l'habitat Paris, Maison du client, etc."
                />
                {isLocationEmpty ? (
                  <p className='text-red-600 text-xs font-bold flex items-center'>
                    ⚠️ Le lieu de l'événement est obligatoire pour continuer
                  </p>
                ) : (
                  <p className='text-green-600 text-xs font-bold flex items-center'>
                    ✅ Lieu renseigné - Vous pouvez continuer
                  </p>
                )}
              </div>

              {/* Conseiller/Vendeuse */}
              <div className='flex flex-col space-y-1'>
                <label className='font-bold text-black text-sm'>
                  Conseiller/Vendeuse: <span className='text-red-600'>*</span>
                </label>
                <input
                  value={advisorName}
                  onChange={e => {
                    updateAdvisorName(e.target.value);
                    setHasEditedAdvisor(true);
                  }}
                  type='text'
                  required
                  className={`w-full border-2 rounded-lg px-3 py-2 text-sm text-black bg-white focus:ring-1 transition-all font-bold ${
                    isAdvisorEmpty && hasEditedAdvisor
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : isAdvisorValid
                        ? 'border-green-500 focus:border-green-600 focus:ring-green-200 bg-green-50'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  }`}
                  placeholder="Ex: Marie Dupont, Jean Martin, etc."
                />
                {isAdvisorEmpty ? (
                  <p className='text-red-600 text-xs font-bold flex items-center'>
                    ⚠️ Le nom du conseiller est obligatoire pour continuer
                  </p>
                ) : (
                  <p className='text-green-600 text-xs font-bold flex items-center'>
                    ✅ Conseiller renseigné - Vous pouvez continuer
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Boutons navigation */}
      <div className='flex justify-center gap-4 mt-6 mb-4'>
        <button
          onClick={onQuit}
          className='px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg'
        >
          ← Quitter
        </button>

        <button
          onClick={validateAndNext}
          disabled={!isFormValid}
          className={`px-6 py-3 font-bold rounded-xl text-lg transition-all transform shadow-lg ${
            !isFormValid
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white hover:scale-105'
          }`}
        >
          {!isFormValid
            ? isLocationEmpty && isAdvisorEmpty
              ? "🚫 Remplir lieu et conseiller"
              : isLocationEmpty
              ? "🚫 Remplir le lieu d'abord"
              : "🚫 Remplir le conseiller d'abord"
            : '✅ Suivant: Client →'}
        </button>
      </div>
    </div>
  );
}
