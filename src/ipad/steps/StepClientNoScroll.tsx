// StepClientNoScroll.tsx
import { useEffect, useRef, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Hash,
  Home,
  Key,
} from 'lucide-react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepClientNoScroll({ onNext, onPrev }: StepProps) {
  const { client, updateClient } = useInvoiceWizard();
  const nameRef = useRef<HTMLInputElement>(null);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const updateField = (field: string, value: string) =>
    updateClient({ [field]: value });

  // Validations
  const validity = {
    name: (client.name?.trim().length || 0) > 2,
    email: !!client.email?.includes('@'),
    phone: (client.phone?.trim().length || 0) > 0,
    address: (client.address?.trim().length || 0) > 0,
    city: (client.city?.trim().length || 0) > 0,
    postalCode: (client.postalCode?.trim().length || 0) > 0,
    housingType: (client.housingType?.trim().length || 0) > 0,
    doorCode:
      (client.doorCode?.trim().length || 0) > 0 ||
      client.doorCode === 'Pas de digicode',
  };
  const isFieldValid = (field: keyof typeof validity) =>
    !hasAttemptedNext || validity[field];

  const allFieldsValid =
    validity.name &&
    validity.email &&
    validity.phone &&
    validity.address &&
    validity.city &&
    validity.postalCode &&
    validity.housingType &&
    validity.doorCode;

  const handleNext = () => {
    setHasAttemptedNext(true);
    if (allFieldsValid) onNext();
  };

  return (
    <div className='min-h-screen w-full bg-myconfort-cream' style={{
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none'
    }}>
      {/* Conteneur centré */}
      <div className='mx-auto w-full max-w-6xl px-4 pt-6 pb-6'>
        {/* Header */}
        <div className='px-4 py-2 border-b border-myconfort-dark/10 mb-4'>
          <h1 className='text-3xl font-bold text-myconfort-dark font-manrope'>
            👤 Informations Client
          </h1>
          <p className='text-lg text-gray-600'>
            Étape 2/7 • Tous les champs{' '}
            <span className='text-red-600 font-bold'>*</span> = obligatoire
          </p>
        </div>

        {/* --- FORMULAIRE (UN SEUL BLOC 3×3) --- */}
        <div className='px-4'>
          <form className='grid grid-cols-1 gap-4'>
            {/* Ligne 1 */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Nom */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <User className='w-4 h-4 text-myconfort-green' /> Nom complet{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  ref={nameRef}
                  type='text'
                  value={client.name || ''}
                  onChange={e => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('name')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  placeholder='Nom et prénom'
                  required
                />
                {!isFieldValid('name') && (
                  <p className='text-myconfort-coral text-xs'>
                    Le nom doit faire plus de 2 caractères.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Mail className='w-4 h-4 text-myconfort-green' /> Email{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  type='email'
                  value={client.email || ''}
                  onChange={e => updateField('email', e.target.value)}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('email')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  placeholder='example@gmail.com'
                  required
                />
                {!isFieldValid('email') && (
                  <p className='text-myconfort-coral text-xs'>
                    Adresse email valide requise.
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Phone className='w-4 h-4 text-myconfort-green' /> Téléphone{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  type='tel'
                  value={client.phone || ''}
                  onChange={e => updateField('phone', e.target.value)}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('phone')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  placeholder='06 12 34 56 78'
                  required
                />
                {!isFieldValid('phone') && (
                  <p className='text-myconfort-coral text-xs'>
                    Numéro de téléphone requis.
                  </p>
                )}
              </div>
            </div>

            {/* Ligne 2 */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Adresse */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <MapPin className='w-4 h-4 text-myconfort-green' /> Adresse{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  type='text'
                  value={client.address || ''}
                  onChange={e => updateField('address', e.target.value)}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('address')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  placeholder='123 rue de la Paix'
                  required
                />
                {!isFieldValid('address') && (
                  <p className='text-myconfort-coral text-xs'>
                    Ce champ est requis.
                  </p>
                )}
              </div>

              {/* Adresse 2 (optionnelle) */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Building className='w-4 h-4 text-gray-400' /> Adresse 2
                  (optionnel)
                </label>
                <input
                  type='text'
                  value={client.addressLine2 || ''}
                  onChange={e => updateField('addressLine2', e.target.value)}
                  className='w-full px-3 py-2 text-base border-2 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none'
                  placeholder='Bâtiment, étage, etc.'
                />
              </div>

              {/* Ville */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Building className='w-4 h-4 text-myconfort-green' /> Ville{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  type='text'
                  value={client.city || ''}
                  onChange={e => updateField('city', e.target.value)}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('city')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  placeholder='Paris'
                  required
                />
                {!isFieldValid('city') && (
                  <p className='text-myconfort-coral text-xs'>
                    Ce champ est requis.
                  </p>
                )}
              </div>
            </div>

            {/* Ligne 3 */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Code postal */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Hash className='w-4 h-4 text-myconfort-green' /> Code postal{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  value={client.postalCode || ''}
                  onChange={e => updateField('postalCode', e.target.value)}
                  onFocus={e => {
                    e.target.style.fontSize = '16px';
                    e.target.style.webkitUserSelect = 'text';
                    e.target.style.userSelect = 'text';
                  }}
                  onTouchStart={e => e.preventDefault()}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                    isFieldValid('postalCode')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  style={{ 
                    WebkitAppearance: 'none',
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                    touchAction: 'manipulation'
                  }}
                  placeholder='75001'
                  required
                />
                {!isFieldValid('postalCode') && (
                  <p className='text-myconfort-coral text-xs'>
                    Ce champ est requis.
                  </p>
                )}
              </div>

              {/* Type de logement */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Home className='w-4 h-4 text-myconfort-green' /> Type de
                  logement <span className='text-red-600 font-bold'>*</span>
                </label>
                <select
                  value={client.housingType || ''}
                  onChange={e => updateField('housingType', e.target.value)}
                  onFocus={e => {
                    e.target.style.fontSize = '16px';
                    e.target.style.webkitUserSelect = 'none';
                    e.target.style.userSelect = 'none';
                  }}
                  className={`w-full px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none cursor-pointer ${
                    isFieldValid('housingType')
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                  }`}
                  style={{ 
                    WebkitAppearance: 'none',
                    touchAction: 'manipulation'
                  }}
                  required
                >
                  <option value=''>Sélectionner...</option>
                  <option value='Appartement'>Appartement</option>
                  <option value='Maison'>Maison</option>
                  <option value='Bureau'>Bureau</option>
                </select>
                {!isFieldValid('housingType') && (
                  <p className='text-myconfort-coral text-xs'>
                    Ce champ est requis.
                  </p>
                )}
              </div>

              {/* Code porte / Pas de digicode */}
              <div className='space-y-0'>
                <label className='flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope'>
                  <Key className='w-4 h-4 text-myconfort-green' /> Code porte{' '}
                  <span className='text-red-600 font-bold'>*</span>
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={
                      client.doorCode === 'Pas de digicode'
                        ? ''
                        : client.doorCode || ''
                    }
                    onChange={e => updateField('doorCode', e.target.value)}
                    onFocus={e => {
                      e.target.style.fontSize = '16px';
                      e.target.style.webkitUserSelect = 'text';
                      e.target.style.userSelect = 'text';
                    }}
                    disabled={client.doorCode === 'Pas de digicode'}
                    className={`flex-1 px-3 py-2 text-base border-2 rounded-lg font-manrope transition-colors min-h-[40px] focus:outline-none ${
                      client.doorCode === 'Pas de digicode'
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : isFieldValid('doorCode')
                          ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green'
                          : 'border-myconfort-coral bg-red-50 text-red-900'
                    }`}
                    style={{ 
                      WebkitAppearance: 'none',
                      WebkitUserSelect: client.doorCode === 'Pas de digicode' ? 'none' : 'text',
                      userSelect: client.doorCode === 'Pas de digicode' ? 'none' : 'text',
                      touchAction: 'manipulation'
                    }}
                    placeholder='A1234B'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      updateField(
                        'doorCode',
                        client.doorCode === 'Pas de digicode'
                          ? ''
                          : 'Pas de digicode'
                      )
                    }
                    className={`px-3 py-2 text-base font-medium rounded-lg border-2 transition-colors min-h-[40px] cursor-pointer select-none ${
                      client.doorCode === 'Pas de digicode'
                        ? 'bg-myconfort-coral text-white border-myconfort-coral'
                        : 'bg-gray-100 text-myconfort-dark border-gray-200 hover:bg-gray-200'
                    }`}
                    style={{ 
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      touchAction: 'manipulation'
                    }}
                  >
                    {client.doorCode === 'Pas de digicode'
                      ? 'Annuler'
                      : 'Pas de code'}
                  </button>
                </div>
                {!isFieldValid('doorCode') && (
                  <p className='text-myconfort-coral text-xs'>
                    Saisir un code ou choisir "Pas de code".
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* 🎯 Boutons navigation */}
        <div className='flex justify-center gap-4 mt-6 mb-4'>
          <button
            type='button'
            onClick={onPrev}
            className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg'
          >
            ← Précédent
          </button>
          <button
            type='button'
            onClick={handleNext}
            className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform shadow-lg ${
              allFieldsValid
                ? 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
                : 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
            }`}
          >
            {allFieldsValid ? '✅ Suivant →' : '🚫 Compléter les champs'}
          </button>
        </div>
      </div>
    </div>
  );
}
