import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepLivraisonNoScroll({ onNext, onPrev }: StepProps) {
  const { livraison, updateLivraison, produits, client } = useInvoiceWizard();
  const [showDetailsPage, setShowDetailsPage] = useState(false);

  // Analyser les produits
  const produitsALivrer = produits.filter(p => !p.isPickupOnSite);
  const produitsAEmporter = produits.filter(p => p.isPickupOnSite);

  // Validation
  const isValid = Boolean(
    livraison.deliveryMethod && livraison.deliveryMethod.trim().length > 0
  );

  // Page secondaire pour les détails
  if (showDetailsPage) {
    return (
      <DeliveryDetailsPage
        produitsALivrer={produitsALivrer}
        produitsAEmporter={produitsAEmporter}
        client={client}
        livraison={livraison}
        updateLivraison={updateLivraison}
        onBack={() => setShowDetailsPage(false)}
        onComplete={() => {
          setShowDetailsPage(false);
          if (isValid) onNext();
        }}
      />
    );
  }

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* 🎯 Header fixe avec bouton Suivant */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-myconfort-dark'>
              🚚 Modalités de Livraison
            </h1>
            <p className='text-myconfort-dark/70 text-sm'>
              Étape 5/7 • {produitsALivrer.length} produits à livrer,{' '}
              {produitsAEmporter.length} à emporter
            </p>
          </div>
          <button
            type='button'
            onClick={onNext}
            className='bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg border-2 border-[#477A0C] transition-all'
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* 🎯 Contenu principal - centré et remonté */}
      <div className='flex-1 px-6 py-4 flex flex-col justify-start'>
        {/* Résumé rapide */}
        <div className='bg-myconfort-green/10 p-4 rounded-xl border border-myconfort-green/30 mb-4'>
          <div className='grid grid-cols-2 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-myconfort-green'>
                {produitsALivrer.length}
              </div>
              <div className='text-sm text-myconfort-dark/70'>À livrer</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-myconfort-blue'>
                {produitsAEmporter.length}
              </div>
              <div className='text-sm text-myconfort-dark/70'>À emporter</div>
            </div>
          </div>
        </div>

        {/* Choix du mode de livraison */}
        <div className='space-y-3'>
          <label className='block text-lg font-medium text-myconfort-dark mb-4'>
            Mode de livraison *
          </label>

          <div className='grid grid-cols-1 gap-4'>
            {/* Livraison Colissimo */}
            <button
              onClick={() =>
                updateLivraison({ deliveryMethod: 'Livraison Colissimo' })
              }
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                livraison.deliveryMethod === 'Livraison Colissimo'
                  ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-myconfort-green/50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-myconfort-dark'>
                    � Livraison Colissimo
                  </div>
                  <div className='text-sm text-gray-600'>
                    48 heures • Poids inférieur à 5 kg
                  </div>
                </div>
                {livraison.deliveryMethod === 'Livraison Colissimo' && (
                  <div className='text-myconfort-green text-xl'>✓</div>
                )}
              </div>
            </button>

            {/* Livraison par transporteur France Express */}
            <button
              onClick={() =>
                updateLivraison({ deliveryMethod: 'Livraison France Express' })
              }
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                livraison.deliveryMethod === 'Livraison France Express'
                  ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-myconfort-green/50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-myconfort-dark'>
                    ⚡ Livraison par transporteur France Express
                  </div>
                  <div className='text-sm text-gray-600'>
                    Date à définir dans les détails du planning
                  </div>
                </div>
                {livraison.deliveryMethod === 'Livraison France Express' && (
                  <div className='text-myconfort-green text-xl'>✓</div>
                )}
              </div>
            </button>

            {/* Retrait sur stand */}
            <button
              onClick={() =>
                updateLivraison({ deliveryMethod: 'Retrait sur stand' })
              }
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                livraison.deliveryMethod === 'Retrait sur stand'
                  ? 'border-myconfort-green bg-myconfort-green/10 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-myconfort-green/50'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-myconfort-dark'>
                    🏪 Retrait sur stand
                  </div>
                  <div className='text-sm text-gray-600'>
                    À la fin de l'événement
                  </div>
                </div>
                {livraison.deliveryMethod === 'Retrait sur stand' && (
                  <div className='text-myconfort-green text-xl'>✓</div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Espacement optimisé pour éviter que les boutons flottants couvrent le contenu */}
        <div className='h-32'></div>
      </div>

      {/* 🚀 BOUTONS FLOTTANTS - Dans le cadre iPad, remontés de 2cm */}
      <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
        <button
          onClick={onPrev}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Précédent
        </button>
        <div className='flex flex-col items-center'>
          <div className='bg-white px-3 py-1 rounded-full shadow-lg mb-1'>
            <div className='text-xs text-gray-500 font-manrope'>Étape 5/7</div>
          </div>
        </div>
        <button
          onClick={isValid ? onNext : undefined}
          disabled={!isValid}
          className={`px-6 py-3 rounded-full text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl ${
            !isValid
              ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
              : 'bg-myconfort-green text-white hover:bg-myconfort-green/90'
          }`}
        >
          {!isValid ? '⚠️ Mode requis' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
}

// 🎯 Page secondaire pour les détails de livraison
function DeliveryDetailsPage({
  produitsALivrer,
  produitsAEmporter,
  client,
  livraison,
  updateLivraison,
  onBack,
  onComplete,
}: any) {
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState(
    livraison.deliveryAddress || ''
  );
  const [notes, setNotes] = useState(livraison.deliveryNotes || '');

  const handleSave = () => {
    updateLivraison({
      deliveryAddress: useCustomAddress ? customAddress : client.address,
      deliveryNotes: notes,
    });
    onComplete();
  };

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          📦 Détails de Livraison
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Configuration complète de la livraison
        </p>
      </div>

      {/* Contenu scrollable */}
      <div className='flex-1 px-6 py-4 overflow-y-auto'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {/* Répartition des produits */}
          <div className='bg-white p-4 rounded-xl border border-gray-300'>
            <h3 className='font-bold text-myconfort-dark mb-3'>
              📊 Répartition des produits
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='font-medium text-blue-600'>
                  À livrer ({produitsALivrer.length})
                </div>
                {produitsALivrer.map((p, i) => (
                  <div key={i} className='text-gray-600'>
                    • {p.designation} (x{p.qty})
                  </div>
                ))}
              </div>
              <div>
                <div className='font-medium text-green-600'>
                  À emporter ({produitsAEmporter.length})
                </div>
                {produitsAEmporter.map((p, i) => (
                  <div key={i} className='text-gray-600'>
                    • {p.designation} (x{p.qty})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className='bg-white p-4 rounded-xl border border-gray-300'>
            <h3 className='font-bold text-myconfort-dark mb-3'>
              📍 Adresse de livraison
            </h3>

            <div className='space-y-3'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={!useCustomAddress}
                  onChange={() => setUseCustomAddress(false)}
                  className='w-4 h-4'
                />
                <span>
                  Adresse du client: {client.address || 'Non renseignée'}
                </span>
              </label>

              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  checked={useCustomAddress}
                  onChange={() => setUseCustomAddress(true)}
                  className='w-4 h-4'
                />
                <span>Adresse différente</span>
              </label>

              {useCustomAddress && (
                <textarea
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                  placeholder="Saisir l'adresse de livraison..."
                  rows={3}
                  className='w-full p-3 border rounded-lg'
                />
              )}
            </div>
          </div>

          {/* Notes de livraison */}
          <div className='bg-white p-4 rounded-xl border border-gray-300'>
            <h3 className='font-bold text-myconfort-dark mb-3'>
              📝 Instructions de livraison
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Livraison entre 9h-12h, sonner à l'interphone, étage sans ascenseur..."
              rows={4}
              className='w-full p-3 border rounded-lg resize-none'
            />
          </div>
        </div>
      </div>

      {/* Navigation - Utilise les boutons flottants aussi */}
      {/* 🚀 BOUTONS FLOTTANTS */}
      <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex gap-4'>
        <button
          onClick={onBack}
          className='px-6 py-3 rounded-full bg-white border-2 border-gray-300 text-base font-medium font-manrope text-myconfort-dark hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl'
        >
          ← Retour
        </button>
        <button
          onClick={handleSave}
          className='px-6 py-3 rounded-full bg-myconfort-green text-white text-base font-medium font-manrope transition-all shadow-lg hover:shadow-xl hover:bg-myconfort-green/90'
        >
          Valider →
        </button>
      </div>
    </div>
  );
}
