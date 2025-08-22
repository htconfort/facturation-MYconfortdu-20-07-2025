import { useEffect, useRef, useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepClient({ onNext, onPrev }: StepProps) {
  const { client, updateClient } = useInvoiceWizard();
  const nameRef = useRef<HTMLInputElement>(null);

  // État pour suivre quels champs ont été édités
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});

  // État pour la checkbox "Pas de digicode"
  const [noDigicode, setNoDigicode] = useState<boolean>(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Fonction pour marquer un champ comme édité
  const markAsEdited = (fieldName: string) => {
    setEditedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // Validation des champs obligatoires
  const requiredFields = {
    name: client.name && client.name.trim().length > 2,
    email:
      client.email &&
      client.email.includes('@') &&
      client.email.trim().length > 0,
    phone: client.phone && client.phone.trim().length > 0,
    address: client.address && client.address.trim().length > 0,
    city: client.city && client.city.trim().length > 0,
    postalCode: client.postalCode && client.postalCode.trim().length > 0,
    housingType: client.housingType && client.housingType.trim().length > 0,
    doorCode:
      noDigicode || (client.doorCode && client.doorCode.trim().length > 0),
  };

  const isAllRequiredValid = Object.values(requiredFields).every(Boolean);

  // Fonction pour obtenir la classe CSS du champ
  const getFieldClass = (fieldName: keyof typeof requiredFields) => {
    const isValid = requiredFields[fieldName];
    const hasBeenEdited = editedFields[fieldName];

    if (isValid) {
      return 'w-full h-16 rounded-xl border-3 border-green-500 bg-green-50 px-6 text-xl focus:border-green-600 focus:ring-4 focus:ring-green-200 transition-all font-bold';
    } else if (hasBeenEdited) {
      return 'w-full h-16 rounded-xl border-3 border-red-500 bg-red-50 px-6 text-xl focus:border-red-600 focus:ring-4 focus:ring-red-200 transition-all font-bold';
    } else {
      return 'w-full h-16 rounded-xl border-3 border-red-500 px-6 text-xl focus:border-red-600 focus:ring-4 focus:ring-red-200 transition-all font-bold';
    }
  };

  // Fonction pour obtenir l'indicateur de validation
  const getValidationIndicator = (fieldName: keyof typeof requiredFields) => {
    const isValid = requiredFields[fieldName];
    const hasBeenEdited = editedFields[fieldName];

    if (isValid) {
      return (
        <span className='text-green-600 font-bold text-lg'>✅ Valide</span>
      );
    } else if (hasBeenEdited) {
      return (
        <span className='text-red-600 font-bold text-lg'>⚠️ Obligatoire</span>
      );
    } else {
      return (
        <span className='text-red-600 font-bold text-lg'>⚠️ Obligatoire</span>
      );
    }
  };

  const validateAndNext = () => {
    if (!isAllRequiredValid) {
      // Marquer tous les champs comme édités pour afficher les erreurs
      setEditedFields({
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        housingType: true,
        doorCode: true,
      });
      return;
    }
    onNext();
  };

  return (
    <div className='max-w-6xl mx-auto py-8'>
      {/* Header */}
      <div className='bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-8 mb-8 border border-gray-100'>
        <h1 className='text-3xl font-bold text-[#F2EFE2] mb-6 flex items-center justify-center'>
          <span className='bg-[#F2EFE2] text-[#477A0C] px-8 py-4 rounded-full font-bold text-2xl'>
            👤 INFORMATIONS CLIENT
          </span>
        </h1>

        <div className='bg-[#F2EFE2] rounded-lg p-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Nom complet - OBLIGATOIRE */}
            <div className='lg:col-span-2'>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Nom complet: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('name')}
              </label>
              <input
                ref={nameRef}
                value={client.name}
                onChange={e => {
                  updateClient({ name: e.target.value });
                  markAsEdited('name');
                }}
                className={getFieldClass('name')}
                placeholder='Ex: Martin Dupont'
                autoComplete='name'
              />
            </div>

            {/* Email - OBLIGATOIRE */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Email: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('email')}
              </label>
              <input
                type='email'
                inputMode='email'
                value={client.email || ''}
                onChange={e => {
                  updateClient({ email: e.target.value });
                  markAsEdited('email');
                }}
                className={getFieldClass('email')}
                placeholder='email@exemple.com'
                autoComplete='email'
              />
            </div>

            {/* Téléphone - OBLIGATOIRE */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Téléphone: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('phone')}
              </label>
              <input
                type='tel'
                inputMode='tel'
                value={client.phone || ''}
                onChange={e => {
                  updateClient({ phone: e.target.value });
                  markAsEdited('phone');
                }}
                className={getFieldClass('phone')}
                placeholder='06 xx xx xx xx'
                autoComplete='tel'
              />
            </div>

            {/* Adresse ligne 1 - OBLIGATOIRE */}
            <div className='lg:col-span-2'>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Adresse: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('address')}
              </label>
              <input
                value={client.address || ''}
                onChange={e => {
                  updateClient({ address: e.target.value });
                  markAsEdited('address');
                }}
                className={getFieldClass('address')}
                placeholder='123 rue de la Paix'
                autoComplete='street-address'
              />
            </div>

            {/* Adresse ligne 2 - OPTIONNELLE */}
            <div className='lg:col-span-2'>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Adresse (ligne 2):{' '}
                  <span className='text-green-600'>Optionnelle</span>
                </span>
                <span className='text-blue-600 font-bold text-lg'>
                  💡 Facultatif
                </span>
              </label>
              <input
                value={client.addressLine2 || ''}
                onChange={e => updateClient({ addressLine2: e.target.value })}
                className='w-full h-16 rounded-xl border-3 border-blue-300 bg-blue-50 px-6 text-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all font-bold'
                placeholder='Résidence Les Jardins - Bâtiment B'
              />
            </div>

            {/* Code postal - OBLIGATOIRE */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Code Postal: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('postalCode')}
              </label>
              <input
                inputMode='numeric'
                pattern='[0-9]*'
                value={client.postalCode || ''}
                onChange={e => {
                  updateClient({ postalCode: e.target.value });
                  markAsEdited('postalCode');
                }}
                className={getFieldClass('postalCode')}
                placeholder='75017'
                autoComplete='postal-code'
              />
            </div>

            {/* Ville - OBLIGATOIRE */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  Ville: <span className='text-red-600'>*</span>
                </span>
                {getValidationIndicator('city')}
              </label>
              <input
                value={client.city || ''}
                onChange={e => {
                  updateClient({ city: e.target.value });
                  markAsEdited('city');
                }}
                className={getFieldClass('city')}
                placeholder='Paris'
                autoComplete='address-level2'
              />
            </div>

            {/* SIRET - OPTIONNEL */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>
                  SIRET: <span className='text-green-600'>Optionnel</span>
                </span>
                <span className='text-blue-600 font-bold text-lg'>
                  💡 Facultatif
                </span>
              </label>
              <input
                value={client.siret || ''}
                onChange={e => updateClient({ siret: e.target.value })}
                className='w-full h-16 rounded-xl border-3 border-blue-300 bg-blue-50 px-6 text-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all font-bold'
                placeholder='82431353000027'
              />
            </div>

            {/* Type de logement - OBLIGATOIRE */}
            <div>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>Type de logement</span>
                {getValidationIndicator('housingType')}
              </label>
              <select
                value={client.housingType || ''}
                onChange={e => {
                  updateClient({ housingType: e.target.value });
                  markAsEdited('housingType');
                }}
                className={getFieldClass('housingType')}
              >
                <option value=''>Sélectionner</option>
                <option value='Appartement'>Appartement</option>
                <option value='Maison'>Maison</option>
                <option value='Bureau'>Bureau</option>
                <option value='Local commercial'>Local commercial</option>
              </select>
            </div>

            {/* Code porte - OBLIGATOIRE */}
            <div className='lg:col-span-2'>
              <label className='block text-black font-bold mb-3 text-lg flex items-center justify-between'>
                <span>Code porte / Digicode</span>
                {getValidationIndicator('doorCode')}
              </label>

              <div className='space-y-3'>
                <input
                  value={client.doorCode || ''}
                  onChange={e => {
                    updateClient({ doorCode: e.target.value });
                    markAsEdited('doorCode');
                    if (e.target.value) setNoDigicode(false);
                  }}
                  disabled={noDigicode}
                  className={
                    noDigicode
                      ? 'w-full h-16 rounded-xl border-3 border-gray-300 bg-gray-100 px-6 text-xl font-bold opacity-50'
                      : getFieldClass('doorCode')
                  }
                  placeholder='A1234, Étage 3, Porte gauche...'
                />

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='noDigicode'
                    checked={noDigicode}
                    onChange={e => {
                      setNoDigicode(e.target.checked);
                      markAsEdited('doorCode');
                      if (e.target.checked) {
                        updateClient({ doorCode: 'Pas de digicode' });
                      } else {
                        updateClient({ doorCode: '' });
                      }
                    }}
                    className='w-5 h-5 text-[#477A0C] bg-gray-100 border-gray-300 rounded focus:ring-[#477A0C] focus:ring-2'
                  />
                  <label
                    htmlFor='noDigicode'
                    className='text-lg font-medium text-gray-700'
                  >
                    ✓ Pas de digicode
                  </label>
                </div>
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
              <li>
                • 🔴 Champs obligatoires: Nom, Email, Téléphone, Adresse, Code
                postal, Ville, Type logement, Digicode
              </li>
              <li>• 🔵 Champs optionnels: Adresse ligne 2, SIRET</li>
              <li>
                • 🔴➡️🟢 Les cadres rouges deviennent verts quand remplis
                correctement
              </li>
              <li>
                • ✅ Pour le digicode: remplir le champ OU cocher "Pas de
                digicode"
              </li>
              <li>
                • 🚫 Impossible de continuer tant que les 8 champs obligatoires
                ne sont pas remplis
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Status de validation */}
      <div className='text-center mb-8'>
        {isAllRequiredValid ? (
          <div className='inline-flex items-center px-8 py-4 bg-green-100 text-green-800 rounded-2xl text-xl font-bold'>
            ✅ Tous les champs obligatoires sont remplis - Vous pouvez continuer
          </div>
        ) : (
          <div className='inline-flex items-center px-8 py-4 bg-red-100 text-red-800 rounded-2xl text-xl font-bold'>
            📝 {8 - Object.values(requiredFields).filter(Boolean).length}{' '}
            champ(s) obligatoire(s) manquant(s)
          </div>
        )}
      </div>

      {/* Boutons navigation */}
      <div className='flex justify-between items-center'>
        <button
          onClick={onPrev}
          className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105'
        >
          ← Précédent: Facture
        </button>

        <button
          onClick={validateAndNext}
          disabled={!isAllRequiredValid}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform shadow-lg ${
            !isAllRequiredValid
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              : 'bg-[#477A0C] hover:bg-[#3A6A0A] text-white hover:scale-105'
          }`}
        >
          Suivant: Produits →
        </button>
      </div>
    </div>
  );
}
