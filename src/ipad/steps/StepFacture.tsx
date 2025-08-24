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
  const { invoiceNumber, invoiceDate, eventLocation, setInvoiceData } =
    useInvoiceWizard();
  const [hasEditedLocation, setHasEditedLocation] = useState(false);

  // Générer automatiquement un numéro de facture et la date du jour si vides
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

    if (!invoiceNumber) {
      setInvoiceData({ invoiceNumber: generateInvoiceNumber() });
    }

    if (!invoiceDate) {
      setInvoiceData({ invoiceDate: today });
    }
  }, [invoiceNumber, invoiceDate, setInvoiceData]);

  const validateAndNext = () => {
    // Seul le lieu d'événement est obligatoire
    if (!eventLocation || eventLocation.trim() === '') {
      // Le cadre rouge est déjà géré dans le className conditionnel
      return;
    }

    onNext();
  };

  // État de validation pour les couleurs des cadres
  const isLocationValid = eventLocation && eventLocation.trim() !== '';
  const isLocationEmpty = !eventLocation || eventLocation.trim() === '';

  return (
    <div className='max-w-6xl mx-auto py-8'>
      {/* Header avec style MyConfort */}
      <div className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-8 mb-8 border border-gray-100'>
        <h1 className='text-3xl font-bold text-[#F2EFE2] mb-6 flex items-center justify-center'>
          <span className='bg-[#F2EFE2] text-[#477A0C] px-8 py-4 rounded-full font-bold text-2xl'>
            📋 INFORMATIONS FACTURE
          </span>
        </h1>

        <div className='bg-[#F2EFE2] rounded-lg p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Informations entreprise */}
            <div className='space-y-3'>
              <h2 className='text-2xl font-bold text-black mb-4'>
                <strong>MYCONFORT</strong>
              </h2>
              <p className='text-black font-semibold text-lg'>
                <strong>88 Avenue des Ternes</strong>
              </p>
              <p className='text-black font-semibold text-lg'>
                75017 Paris, France
              </p>
              <p className='text-black font-semibold text-lg'>
                SIRET: 824 313 530 00027
              </p>
              <p className='text-black font-semibold text-lg'>
                Tél: 04 68 50 41 45
              </p>
              <p className='text-black font-semibold text-lg'>
                Email: myconfort@gmail.com
              </p>
              <p className='text-black font-semibold text-lg'>
                Site web: https://www.htconfort.com
              </p>
            </div>

            {/* Détails facture */}
            <div className='space-y-6'>
              {/* Numéro de facture */}
              <div className='flex flex-col space-y-2'>
                <span className='font-bold text-black text-lg'>
                  Facture n°:
                </span>
                <input
                  value={invoiceNumber}
                  type='text'
                  className='border-2 border-[#477A0C] rounded-lg px-4 py-3 text-xl font-mono text-black bg-white focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all font-bold'
                  readOnly
                />
              </div>

              {/* Date facture */}
              <div className='flex flex-col space-y-2'>
                <label className='font-bold text-black text-lg'>
                  Date: <span className='text-green-600'>✓ Automatique</span>
                </label>
                <input
                  value={invoiceDate}
                  onChange={e =>
                    setInvoiceData({ invoiceDate: e.target.value })
                  }
                  type='date'
                  className='border-2 border-green-500 rounded-lg px-4 py-3 text-lg text-black bg-green-50 focus:ring-2 focus:ring-green-300 transition-all font-bold'
                />
                <p className='text-green-600 text-sm font-semibold'>
                  ✅ Date remplie automatiquement (modifiable si besoin)
                </p>
              </div>

              {/* Lieu événement */}
              <div className='flex flex-col space-y-2'>
                <label className='font-bold text-black text-lg'>
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
                  className={`w-full border-3 rounded-lg px-4 py-3 text-lg text-black bg-white focus:ring-4 transition-all font-bold ${
                    isLocationEmpty && hasEditedLocation
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : isLocationValid
                        ? 'border-green-500 focus:border-green-600 focus:ring-green-200 bg-green-50'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  }`}
                  placeholder="Ex: Salon de l'habitat Paris, Maison du client, etc."
                />
                {isLocationEmpty ? (
                  <p className='text-red-600 text-lg font-bold flex items-center'>
                    ⚠️ Le lieu de l'événement est obligatoire pour continuer
                  </p>
                ) : (
                  <p className='text-green-600 text-lg font-bold flex items-center'>
                    ✅ Lieu renseigné - Vous pouvez continuer
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions iPad */}
      <div className='bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8'>
        <div className='flex items-center gap-4'>
          <div className='text-4xl'>📱</div>
          <div>
            <h3 className='text-xl font-bold text-blue-800 mb-2'>
              Instructions iPad
            </h3>
            <ul className='text-blue-700 space-y-1'>
              <li>• ✅ Numéro de facture généré automatiquement</li>
              <li>• ✅ Date remplie automatiquement avec aujourd'hui</li>
              <li>
                • 🎯 <strong>Une seule chose à faire :</strong> Remplir le lieu
                d'événement
              </li>
              <li>• 🔴➡️🟢 Le cadre devient vert quand c'est rempli</li>
              <li>
                • 🚫 Impossible de continuer tant que le lieu n'est pas
                renseigné
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Boutons navigation */}
      <div className='flex justify-between items-center'>
        <button
          onClick={onQuit}
          className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105'
        >
          ← Quitter
        </button>

        <button
          onClick={validateAndNext}
          disabled={isLocationEmpty}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform shadow-lg ${
            isLocationEmpty
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white hover:scale-105'
          }`}
        >
          {isLocationEmpty
            ? "🚫 Remplir le lieu d'abord"
            : '✅ Suivant: Client →'}
        </button>
      </div>
    </div>
  );
}
