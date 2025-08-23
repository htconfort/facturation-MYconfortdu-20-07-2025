import React, { useState, useEffect, useRef } from 'react';
import { WizardSheet } from '../WizardSheet';

export interface ClientForm {
  clientName: string;
  clientAddress: string;
  clientPostalCode: string;
  clientCity: string;
  clientEmail: string;
  clientPhone: string;
  clientDoorCode?: string;
  clientHousingType?: string;
  clientSiret?: string;
  addressLine2?: string;
}

interface Props {
  isOpen: boolean;
  initial: ClientForm;
  onCancel: () => void;
  onSave: (data: ClientForm) => void;
}

export const ClientEditor: React.FC<Props> = ({
  isOpen,
  initial,
  onCancel,
  onSave,
}) => {
  const [form, setForm] = useState<ClientForm>(initial);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(initial);
  }, [initial, isOpen]);

  // Focus automatique sur le premier champ à l'ouverture
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Validation basique
    if (!form.clientName.trim() || !form.clientEmail.trim()) {
      alert('Nom et email sont obligatoires');
      return;
    }
    onSave(form);
  };

  return (
    <WizardSheet
      isOpen={isOpen}
      title='✏️ Client — Édition plein écran'
      onClose={onCancel}
      onSave={handleSave}
      saveLabel='Enregistrer'
    >
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Nom complet *
            </span>
            <input
              ref={firstInputRef}
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              placeholder='Nom et prénom du client'
            />
          </label>

          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>Email *</span>
            <input
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              type='email'
              value={form.clientEmail}
              onChange={e => setForm({ ...form, clientEmail: e.target.value })}
              placeholder='email@example.com'
            />
          </label>
        </div>

        <label className='flex flex-col gap-2'>
          <span className='text-sm font-medium text-gray-700'>
            Adresse (ligne 1) *
          </span>
          <input
            className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
            value={form.clientAddress}
            onChange={e => setForm({ ...form, clientAddress: e.target.value })}
            placeholder='Numéro et nom de rue'
          />
        </label>

        <label className='flex flex-col gap-2'>
          <span className='text-sm font-medium text-gray-700'>
            Adresse (ligne 2)
          </span>
          <input
            className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
            value={form.addressLine2 || ''}
            onChange={e => setForm({ ...form, addressLine2: e.target.value })}
            placeholder="Complément d'adresse (optionnel)"
          />
        </label>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Code postal *
            </span>
            <input
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              value={form.clientPostalCode}
              onChange={e =>
                setForm({ ...form, clientPostalCode: e.target.value })
              }
              placeholder='75000'
            />
          </label>

          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>Ville *</span>
            <input
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              value={form.clientCity}
              onChange={e => setForm({ ...form, clientCity: e.target.value })}
              placeholder='Paris'
            />
          </label>
        </div>

        <label className='flex flex-col gap-2'>
          <span className='text-sm font-medium text-gray-700'>Téléphone *</span>
          <input
            className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
            value={form.clientPhone}
            onChange={e => setForm({ ...form, clientPhone: e.target.value })}
            placeholder='06 12 34 56 78'
          />
        </label>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Code porte
            </span>
            <input
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              value={form.clientDoorCode || ''}
              onChange={e =>
                setForm({ ...form, clientDoorCode: e.target.value })
              }
              placeholder='A123B'
            />
          </label>

          <label className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-gray-700'>
              Type logement
            </span>
            <select
              className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
              value={form.clientHousingType || ''}
              onChange={e =>
                setForm({ ...form, clientHousingType: e.target.value })
              }
            >
              <option value=''>Choisir...</option>
              <option value='Appartement'>Appartement</option>
              <option value='Maison'>Maison</option>
              <option value='Studio'>Studio</option>
              <option value='Loft'>Loft</option>
              <option value='Bureau'>Bureau</option>
              <option value='Commerce'>Commerce</option>
            </select>
          </label>
        </div>

        <label className='flex flex-col gap-2'>
          <span className='text-sm font-medium text-gray-700'>
            SIRET (professionnel)
          </span>
          <input
            className='border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-[#477A0C] focus:border-transparent'
            value={form.clientSiret || ''}
            onChange={e => setForm({ ...form, clientSiret: e.target.value })}
            placeholder='12345678901234'
          />
        </label>

        {/* Indication des champs obligatoires */}
        <div className='text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg'>
          <span className='font-medium'>💡 Astuce iPad :</span> Les champs
          marqués d'un * sont obligatoires. Touchez "Enregistrer" pour
          sauvegarder et revenir à la facture.
        </div>
      </div>
    </WizardSheet>
  );
};
