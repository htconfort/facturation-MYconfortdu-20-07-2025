import { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Hash, Home, Key } from 'lucide-react';
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

  // Helper pour mettre à jour un champ
  const updateField = (field: string, value: string) => {
    updateClient({ [field]: value });
  };

  // 🎯 Validation complète pour tous les champs OBLIGATOIRES (sauf adresse2)
  const allFieldsValid = 
    (client.name?.trim().length || 0) > 2 &&
    !!client.email?.includes('@') &&
    (client.phone?.trim().length || 0) > 0 &&
    (client.address?.trim().length || 0) > 0 &&
    // adresse2 est OPTIONNELLE
    (client.city?.trim().length || 0) > 0 &&
    (client.postalCode?.trim().length || 0) > 0 &&
    (client.housingType?.trim().length || 0) > 0 &&
    ((client.doorCode?.trim().length || 0) > 0 || client.doorCode === 'Pas de digicode');

  const isFieldValid = (field: keyof typeof validity) => {
    if (!hasAttemptedNext) return true; // Pas de validation avant la 1ère tentative
    return validity[field];
  };

  const validity = {
    name: (client.name?.trim().length || 0) > 2,
    email: !!client.email?.includes('@'),
    phone: (client.phone?.trim().length || 0) > 0,
    address: (client.address?.trim().length || 0) > 0,
    city: (client.city?.trim().length || 0) > 0,
    postalCode: (client.postalCode?.trim().length || 0) > 0,
    housingType: (client.housingType?.trim().length || 0) > 0,
    doorCode: ((client.doorCode?.trim().length || 0) > 0 || client.doorCode === 'Pas de digicode'),
  };

  const handleNext = () => {
    setHasAttemptedNext(true);
    if (allFieldsValid) {
      onNext();
    }
  };

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* 🎯 Header compact */}
      <div className="px-4 py-2 border-b border-myconfort-dark/10">
        <h1 className="text-3xl font-bold text-myconfort-dark font-manrope">
          👤 Informations Client
        </h1>
        <p className="text-lg text-gray-600">
          Étape 2/7 • Tous les champs <span className="text-red-600 font-bold">*</span> = obligatoire
        </p>
      </div>

      {/* 🎯 Contenu principal - Grille complète 9 champs */}
      <div className="flex-1 px-4 py-3 overflow-hidden flex flex-col">
        
        {/* 🏠 Grille 3×3 pour 9 champs (adresse2 optionnelle) */}
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
          
          {/* 📝 Nom complet (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <User className="w-4 h-4 text-myconfort-green" />
              Nom complet <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={client.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('name') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="Nom et prénom"
              required
            />
            {!isFieldValid('name') && <p className="text-myconfort-coral text-xs font-medium">Le nom doit faire plus de 2 caractères.</p>}
          </div>

          {/* 📧 Email (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Mail className="w-4 h-4 text-myconfort-green" />
              Email <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="email"
              value={client.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('email') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="example@gmail.com"
              required
            />
            {!isFieldValid('email') && <p className="text-myconfort-coral text-xs font-medium">Adresse email valide requise.</p>}
          </div>

          {/* � Téléphone (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Phone className="w-4 h-4 text-myconfort-green" />
              Téléphone <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="tel"
              value={client.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('phone') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="06 12 34 56 78"
              required
            />
            {!isFieldValid('phone') && <p className="text-myconfort-coral text-xs font-medium">Numéro de téléphone requis.</p>}
          </div>

          {/* 🏠 Adresse principale (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <MapPin className="w-4 h-4 text-myconfort-green" />
              Adresse <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={client.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('address') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="123 rue de la Paix"
              required
            />
            {!isFieldValid('address') && <p className="text-myconfort-coral text-xs font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🏠 Adresse 2 (OPTIONNELLE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Building className="w-4 h-4 text-gray-400" />
              Adresse 2 (optionnel)
            </label>
            <input
              type="text"
              value={client.addressLine2 || ''}
              onChange={(e) => updateField('addressLine2', e.target.value)}
              className="w-full px-3 py-3 text-base border-2 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0"
              placeholder="Bâtiment, étage, etc."
            />
          </div>

          {/* 🏙️ Ville (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Building className="w-4 h-4 text-myconfort-green" />
              Ville <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={client.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('city') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="Paris"
              required
            />
            {!isFieldValid('city') && <p className="text-myconfort-coral text-xs font-medium">Ce champ est requis.</p>}
          </div>

          {/* 📮 Code postal (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Hash className="w-4 h-4 text-myconfort-green" />
              Code postal <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={client.postalCode || ''}
              onChange={(e) => {
                try {
                  updateField('postalCode', e.target.value);
                } catch (error) {
                  console.error('Erreur lors de la mise à jour du code postal:', error);
                }
              }}
              onFocus={(e) => {
                // Éviter les problèmes de focus sur iPad
                e.target.style.fontSize = '16px';
              }}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('postalCode') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="75001"
              required
            />
            {!isFieldValid('postalCode') && <p className="text-myconfort-coral text-xs font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🏠 Type de logement (OBLIGATOIRE) */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Home className="w-4 h-4 text-myconfort-green" />
              Type de logement <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={client.housingType || ''}
              onChange={(e) => updateField('housingType', e.target.value)}
              className={`w-full px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                isFieldValid('housingType') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              required
            >
              <option value="">Sélectionner...</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Bureau">Bureau</option>
            </select>
            {!isFieldValid('housingType') && <p className="text-myconfort-coral text-xs font-medium">Ce champ est requis.</p>}
          </div>

          {/* � Code porte/digicode avec toggle */}
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-base font-medium text-myconfort-dark font-manrope">
              <Key className="w-4 h-4 text-myconfort-green" />
              Code porte <span className="text-red-600 font-bold">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={client.doorCode === 'Pas de digicode' ? '' : (client.doorCode || '')}
                onChange={(e) => updateField('doorCode', e.target.value)}
                disabled={client.doorCode === 'Pas de digicode'}
                className={`flex-1 px-3 py-3 text-base border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[48px] focus:outline-none focus:ring-0 ${
                  client.doorCode === 'Pas de digicode' 
                    ? 'bg-gray-100 text-gray-500 border-gray-200' 
                    : isFieldValid('doorCode') 
                      ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                      : 'border-myconfort-coral bg-red-50 text-red-900'
                }`}
                placeholder="A1234B"
              />
              <button
                type="button"
                onClick={() => updateField('doorCode', client.doorCode === 'Pas de digicode' ? '' : 'Pas de digicode')}
                className={`px-3 py-3 text-base font-medium rounded-lg border-2 transition-colors min-h-[48px] ${
                  client.doorCode === 'Pas de digicode'
                    ? 'bg-myconfort-coral text-white border-myconfort-coral'
                    : 'bg-gray-100 text-myconfort-dark border-gray-200 hover:bg-gray-200'
                }`}
              >
                {client.doorCode === 'Pas de digicode' ? 'Annuler' : 'Pas de code'}
              </button>
            </div>
            {!isFieldValid('doorCode') && <p className="text-myconfort-coral text-xs font-medium">Saisir un code ou choisir "Pas de code".</p>}
          </div>

          {/* 🔙 Bouton Précédent (GAUCHE) */}
          <div className="space-y-1">
            <button
              onClick={onPrev}
              className="w-full px-3 py-3 text-base font-medium rounded-lg border-2 transition-colors min-h-[48px] bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300 font-manrope"
            >
              ← Précédent
            </button>
          </div>

          {/* Espace vide au centre */}
          <div className="space-y-1">
          </div>

          {/* 🔴 Bouton Suivant (DROITE) */}
          <div className="space-y-1">
            <button
              onClick={handleNext}
              className={`w-full px-3 py-3 text-base font-medium rounded-lg border-2 transition-colors min-h-[48px] font-manrope ${
                allFieldsValid
                  ? 'bg-myconfort-green hover:bg-myconfort-green/90 text-white border-myconfort-green'
                  : 'bg-red-500 hover:bg-red-600 text-white border-red-500 cursor-not-allowed opacity-90'
              }`}
            >
              {allFieldsValid ? '✅ Suivant →' : '🚫 Compléter les champs'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
