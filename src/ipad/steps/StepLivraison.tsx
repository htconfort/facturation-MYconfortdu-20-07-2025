import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepLivraison({ onNext, onPrev }: StepProps) {
  const { livraison, updateLivraison, produits } = useInvoiceWizard();

  // Vérifier s'il y a des produits à livrer
  const produitsALivrer = produits.filter(p => !p.isPickupOnSite);
  const produitsAEmporter = produits.filter(p => p.isPickupOnSite);

  const isValid = Boolean(
    livraison.deliveryMethod && livraison.deliveryMethod.trim().length > 0
  );

  return (
    <div className='py-8'>
      {/* Header avec bouton Suivant à côté du cercle 5 */}
      <div className='text-center mb-8 flex flex-col items-center'>
        <div className='flex items-center gap-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-[#477A0C] text-white rounded-full text-2xl font-bold mb-4'>
            5
          </div>
          <button
            type='button'
            onClick={onNext}
            className='bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg border-2 border-[#477A0C] transition-all'
            style={{ marginBottom: '1rem' }}
          >
            Suivant →
          </button>
        </div>
        <h2 className='text-3xl font-bold text-[#477A0C] mb-2'>
          🚚 Modalités de Livraison
        </h2>
        <p className='text-gray-600 text-lg'>
          Organisez la livraison et l'installation des produits
        </p>
      </div>

      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Récapitulatif des produits */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4'>
            📋 Récapitulatif des produits
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Produits à livrer */}
            <div className='bg-blue-50 rounded-xl p-4'>
              <h4 className='font-semibold text-blue-800 mb-3 flex items-center'>
                <span className='mr-2'>📦</span>À livrer (
                {produitsALivrer.length})
              </h4>
              {produitsALivrer.length > 0 ? (
                <ul className='space-y-2'>
                  {produitsALivrer.map(p => (
                    <li key={p.id} className='text-blue-700 text-sm'>
                      • {p.designation} (x{p.qty})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-blue-600 text-sm italic'>
                  Aucun produit à livrer
                </p>
              )}
            </div>

            {/* Produits emporter */}
            <div className='bg-green-50 rounded-xl p-4'>
              <h4 className='font-semibold text-green-800 mb-3 flex items-center'>
                <span className='mr-2'>🚗</span>
                emporter ({produitsAEmporter.length})
              </h4>
              {produitsAEmporter.length > 0 ? (
                <ul className='space-y-2'>
                  {produitsAEmporter.map(p => (
                    <li key={p.id} className='text-green-700 text-sm'>
                      • {p.designation} (x{p.qty})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-green-600 text-sm italic'>
                  Aucun produit emporter
                </p>
              )}
            </div>
          </div>
        </section>

        {/* TEST SUPPRESSION - Section supprimée pour vérifier l'interaction */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-6'>
            Modes de livraison
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[
              {
                value: 'Colissimo 48 heures',
                label: '📦 Colissimo 48 heures',
                desc: 'Livraison par La Poste sous 48h',
              },
              {
                value: 'Livraison par transporteur',
                label: '🚚 Livraison par transporteur',
                desc: 'Livraison à domicile par transporteur',
              },
              {
                value: "Retrait sur place à la fin de l'événement",
                label: "📍 Retrait sur place à la fin de l'événement",
                desc: "Le client récupère à la fin de l'événement",
              },
            ].map(method => {
              const selected = livraison.deliveryMethod === method.value;
              return (
                <button
                  key={method.value}
                  type='button'
                  onClick={() =>
                    updateLivraison({ deliveryMethod: method.value })
                  }
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? 'border-[#477A0C] bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-[#477A0C] hover:bg-green-50'
                  }`}
                >
                  <div className='font-semibold text-lg mb-2'>
                    {method.label}
                  </div>
                  <div className='text-gray-600 text-sm'>{method.desc}</div>
                  {selected && (
                    <div className='mt-2 text-[#477A0C] font-bold'>
                      ✓ Sélectionné
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Date de livraison convenue */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-6'>
            📅 Date de livraison convenue
          </h3>

          <div className='bg-blue-50 rounded-xl p-4 mb-4'>
            <h4 className='font-semibold text-blue-800 mb-2'>💡 Information</h4>
            <p className='text-blue-700 text-sm'>
              Sélectionnez la date de livraison convenue avec le client.
            </p>
          </div>

          <input
            type='date'
            value={livraison.deliveryDate || ''}
            onChange={e => updateLivraison({ deliveryDate: e.target.value })}
            className='w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all'
            min={new Date().toISOString().split('T')[0]}
          />
        </section>

        {/* Adresse de livraison */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-6'>
            🏠 Adresse de livraison
          </h3>

          <div className='bg-blue-50 rounded-xl p-4 mb-4'>
            <h4 className='font-semibold text-blue-800 mb-2'>💡 Information</h4>
            <p className='text-blue-700 text-sm'>
              Confirmez l'adresse de livraison ou précisez si différente de
              l'adresse client.
            </p>
          </div>

          <textarea
            value={livraison.deliveryAddress || ''}
            onChange={e => updateLivraison({ deliveryAddress: e.target.value })}
            className='w-full h-32 rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all resize-none'
            placeholder='Même adresse que le client OU préciser une adresse différente...'
          />
        </section>

        {/* Notes de livraison */}
        <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-6'>
            � SECTION SUPPRIMÉE POUR TEST INTERACTION
          </h3>

          <div className='bg-red-100 rounded-xl p-6 text-center'>
            <p className='text-red-800 font-bold text-xl'>
              ✅ SI TU VOIS CE MESSAGE, L'INTERACTION FONCTIONNE !
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className='flex gap-4 justify-center'>
          <button
            type='button'
            onClick={onPrev}
            className='px-8 py-4 rounded-xl border-2 border-gray-300 text-lg font-semibold hover:bg-gray-50 transition-all'
          >
            ← Paiement
          </button>

          {/* Modes de livraison OBLIGATOIRE */}
          {isValid ? (
            <button
              type='button'
              onClick={onNext}
              className='bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg'
            >
              Continuer vers la Signature →
            </button>
          ) : (
            <div className='text-center p-6 bg-orange-50 rounded-2xl'>
              <div className='text-3xl mb-3'>⚠️</div>
              <h3 className='text-lg font-semibold text-orange-800 mb-2'>
                Modes de livraison requis
              </h3>
              <p className='text-orange-600'>
                Veuillez sélectionner un mode de livraison pour continuer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
