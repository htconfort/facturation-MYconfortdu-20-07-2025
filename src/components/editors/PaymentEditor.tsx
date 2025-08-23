import React, { useState, useEffect } from 'react';
import { WizardSheet } from '../WizardSheet';

export interface PaymentForm {
  paymentMethod: 'cheque' | 'cash' | 'transfer' | 'alma';
  acompte: number;
  nombreCheques: number;
  chequeDates: string[];
  chequeMontants: number[];
  notes?: string;
}

interface Props {
  isOpen: boolean;
  initial: PaymentForm;
  totalAmount: number;
  onCancel: () => void;
  onSave: (data: PaymentForm) => void;
}

export const PaymentEditor: React.FC<Props> = ({
  isOpen,
  initial,
  totalAmount,
  onCancel,
  onSave,
}) => {
  const [form, setForm] = useState<PaymentForm>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial, isOpen]);

  const calculateResteAPayer = () => {
    return totalAmount - form.acompte;
  };

  const calculateMontantParCheque = () => {
    const reste = calculateResteAPayer();
    if (form.nombreCheques === 0) return 0;
    return Math.floor(reste / form.nombreCheques);
  };

  const generateSuggestions = () => {
    const suggestions = [];
    const pourcentages = [20, 25, 30, 40, 50];

    for (const pct of pourcentages) {
      const acompte = Math.round((totalAmount * pct) / 100);
      const reste = totalAmount - acompte;
      const montantParCheque = Math.floor(reste / form.nombreCheques);
      const modulo = reste % form.nombreCheques;

      suggestions.push({
        pourcentage: pct,
        acompte,
        montantParCheque,
        modulo,
        quality: modulo === 0 ? 'excellent' : modulo <= 2 ? 'bon' : 'moyen',
      });
    }

    return suggestions.sort((a, b) => a.modulo - b.modulo);
  };

  const applySuggestion = (acompte: number) => {
    setForm({ ...form, acompte });
  };

  const handleSave = () => {
    if (form.paymentMethod === 'cheque' && form.nombreCheques > 10) {
      alert('Maximum 10 chèques autorisés');
      return;
    }
    onSave(form);
  };

  return (
    <WizardSheet
      isOpen={isOpen}
      title='💳 Paiement — Édition plein écran'
      onClose={onCancel}
      onSave={handleSave}
      saveLabel='Enregistrer'
    >
      <div className='space-y-6'>
        {/* Récapitulatif montant */}
        <div className='bg-[#477A0C] text-white p-4 rounded-lg'>
          <div className='text-lg font-bold'>
            Total facture : {totalAmount.toFixed(2)} € TTC
          </div>
          <div className='text-sm opacity-90'>TVA 20% incluse</div>
        </div>

        {/* Mode de paiement */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3'>
            Mode de paiement principal
          </label>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {[
              {
                value: 'cheque',
                label: '📝 Chèque(s)',
                desc: 'Paiement par chèque(s)',
              },
              { value: 'cash', label: '💸 Espèces', desc: 'Paiement comptant' },
              {
                value: 'transfer',
                label: '🏪 Virement',
                desc: 'Virement bancaire',
              },
              {
                value: 'alma',
                label: '💳 Alma',
                desc: 'Paiement en plusieurs fois',
              },
            ].map(option => (
              <button
                key={option.value}
                onClick={() =>
                  setForm({ ...form, paymentMethod: option.value as any })
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  form.paymentMethod === option.value
                    ? 'border-[#477A0C] bg-[#477A0C]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='font-medium'>{option.label}</div>
                <div className='text-sm text-gray-600'>{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration acompte */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Acompte à l'installation
            </span>
            <input
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              type='number'
              min='0'
              max={totalAmount}
              step='10'
              value={form.acompte}
              onChange={e =>
                setForm({ ...form, acompte: parseFloat(e.target.value) || 0 })
              }
              placeholder='0'
            />
          </label>

          {form.paymentMethod === 'cheque' && (
            <label className='flex flex-col gap-2'>
              <span className='text-sm font-medium text-gray-700'>
                Nombre de chèques (max 10)
              </span>
              <input
                className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
                type='number'
                min='1'
                max='10'
                value={form.nombreCheques}
                onChange={e =>
                  setForm({
                    ...form,
                    nombreCheques: parseInt(e.target.value) || 1,
                  })
                }
              />
            </label>
          )}
        </div>

        {/* Suggestions acomptes magiques */}
        {form.paymentMethod === 'cheque' && form.nombreCheques > 0 && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h3 className='font-medium text-blue-800 mb-3'>
              ✨ Suggestions d'acomptes "magiques" (chèques ronds)
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {generateSuggestions()
                .slice(0, 4)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion.acompte)}
                    className={`p-3 bg-white rounded border text-left hover:border-blue-300 transition-colors ${
                      suggestion.quality === 'excellent'
                        ? 'ring-1 ring-green-300'
                        : ''
                    }`}
                  >
                    <div className='font-medium text-blue-800'>
                      {suggestion.pourcentage}% = {suggestion.acompte}€
                    </div>
                    <div className='text-xs text-blue-600'>
                      {form.nombreCheques} × {suggestion.montantParCheque}€
                      {suggestion.modulo > 0 && ` + ${suggestion.modulo}€`}
                      {suggestion.quality === 'excellent' && ' 🎯'}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Récapitulatif paiement */}
        {form.acompte > 0 && (
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-medium text-gray-800 mb-2'>
              📊 Récapitulatif paiement
            </h3>
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span>Acompte installation :</span>
                <span className='font-medium'>{form.acompte.toFixed(2)} €</span>
              </div>
              <div className='flex justify-between'>
                <span>Reste à payer :</span>
                <span className='font-medium'>
                  {calculateResteAPayer().toFixed(2)} €
                </span>
              </div>
              {form.paymentMethod === 'cheque' && form.nombreCheques > 0 && (
                <div className='flex justify-between border-t pt-1'>
                  <span>{form.nombreCheques} chèques de :</span>
                  <span className='font-medium'>
                    {calculateMontantParCheque().toFixed(2)} € chacun
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes paiement */}
        <label className='flex flex-col gap-2'>
          <span className='text-sm font-medium text-gray-700'>
            Notes sur le paiement
          </span>
          <textarea
            className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent min-h-[100px] resize-y'
            value={form.notes || ''}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder='Instructions particulières, dates de chèques, conditions spéciales...'
          />
        </label>

        {/* Aide iPad */}
        <div className='text-xs text-gray-500 p-3 bg-gray-50 rounded-lg'>
          <span className='font-medium'>💡 Aide iPad :</span> Utilisez les
          suggestions d'acomptes magiques pour obtenir des chèques avec des
          montants ronds (sans centimes). Maximum 10 chèques autorisés.
        </div>
      </div>
    </WizardSheet>
  );
};
