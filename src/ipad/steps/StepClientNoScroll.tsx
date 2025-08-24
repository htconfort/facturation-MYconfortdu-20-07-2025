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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <User className="w-5 h-5 text-myconfort-green" />
              Nom complet <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={client.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('name') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="Nom et prénom"
              required
            />
            {!isFieldValid('name') && <p className="text-myconfort-coral text-sm font-medium">Le nom doit faire plus de 2 caractères.</p>}
          </div>

          {/* 📧 Email (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Mail className="w-5 h-5 text-myconfort-green" />
              Email <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="email"
              value={client.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('email') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="email@exemple.fr"
              required
            />
            {!isFieldValid('email') && <p className="text-myconfort-coral text-sm font-medium">Veuillez saisir une adresse email valide.</p>}
          </div>

          {/* 📱 Téléphone (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Phone className="w-5 h-5 text-myconfort-green" />
              Téléphone <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="tel"
              value={client.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('phone') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="06 12 34 56 78"
              required
            />
            {!isFieldValid('phone') && <p className="text-myconfort-coral text-sm font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🏠 Adresse principale (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <MapPin className="w-5 h-5 text-myconfort-green" />
              Adresse <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={client.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('address') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="123 rue de la Paix"
              required
            />
            {!isFieldValid('address') && <p className="text-myconfort-coral text-sm font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🏠 Adresse 2 (OPTIONNELLE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-gray-600 font-manrope">
              <MapPin className="w-5 h-5 text-gray-400" />
              Adresse 2 (optionnel)
              {(client.addressLine2?.trim() || '').length > 0 && <span className="text-myconfort-green ml-1 font-bold">✓</span>}
            </label>
            <input
              type="text"
              value={client.addressLine2 || ''}
              onChange={(e) => updateField('addressLine2', e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green"
              placeholder="Bâtiment, étage..."
            />
          </div>

          {/* 🏙️ Ville (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Building className="w-5 h-5 text-myconfort-green" />
              Ville <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={client.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('city') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="Paris"
              required
            />
            {!isFieldValid('city') && <p className="text-myconfort-coral text-sm font-medium">Ce champ est requis.</p>}
          </div>

          {/* 📮 Code postal (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Hash className="w-5 h-5 text-myconfort-green" />
              Code postal <span className="text-red-600 font-bold">*</span>
            </label>
            <input
              type="text"
              value={client.postalCode || ''}
              onChange={(e) => updateField('postalCode', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
                isFieldValid('postalCode') 
                  ? 'border-gray-200 bg-white text-myconfort-dark hover:border-myconfort-green focus:border-myconfort-green' 
                  : 'border-myconfort-coral bg-red-50 text-red-900'
              }`}
              placeholder="75001"
              required
            />
            {!isFieldValid('postalCode') && <p className="text-myconfort-coral text-sm font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🏠 Type de logement (OBLIGATOIRE) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Home className="w-5 h-5 text-myconfort-green" />
              Type de logement <span className="text-red-600 font-bold">*</span>
            </label>
            <select
              value={client.housingType || ''}
              onChange={(e) => updateField('housingType', e.target.value)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
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
            {!isFieldValid('housingType') && <p className="text-myconfort-coral text-sm font-medium">Ce champ est requis.</p>}
          </div>

          {/* 🔐 Code porte/digicode avec toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-medium text-myconfort-dark font-manrope">
              <Key className="w-5 h-5 text-myconfort-green" />
              Code porte <span className="text-red-600 font-bold">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={client.doorCode === 'Pas de digicode' ? '' : (client.doorCode || '')}
                onChange={(e) => updateField('doorCode', e.target.value)}
                disabled={client.doorCode === 'Pas de digicode'}
                className={`flex-1 px-4 py-4 text-lg border-2 rounded-lg font-manrope transition-colors duration-150 min-h-[56px] focus:outline-none focus:ring-0 ${
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
                className={`px-4 py-4 text-lg font-medium rounded-lg border-2 transition-colors min-h-[56px] ${
                  client.doorCode === 'Pas de digicode'
                    ? 'bg-myconfort-coral text-white border-myconfort-coral'
                    : 'bg-gray-100 text-myconfort-dark border-gray-200 hover:bg-gray-200'
                }`}
              >
                {client.doorCode === 'Pas de digicode' ? 'Annuler' : 'Pas de code'}
              </button>
            </div>
            {!isFieldValid('doorCode') && <p className="text-myconfort-coral text-sm font-medium">Saisir un code ou choisir "Pas de code".</p>}
          </div>

        </div>
      </div>

      {/* 🎯 Footer compact avec boutons plus grands */}
      <div className="px-4 py-3 border-t border-myconfort-dark/10 flex justify-between items-center">
        
        {/* Bouton retour */}
        <button
          onClick={onPrev}
          className="px-6 py-4 bg-gray-100 text-myconfort-dark rounded-lg hover:bg-gray-200 transition-colors text-lg font-medium font-manrope min-h-[56px]"
        >
          ← Retour
        </button>

        {/* Compteur de champs */}
        <div className="text-lg text-myconfort-dark text-center font-medium font-manrope">
          {allFieldsValid ? '✅ Prêt à continuer' : '⚠️ Champs obligatoires manquants'}
        </div>

        {/* Bouton suivant plus grand */}
        <button
          onClick={handleNext}
          className={`px-8 py-4 rounded-lg text-lg font-medium font-manrope text-white transition-all min-h-[56px] ${
            allFieldsValid
              ? 'bg-myconfort-green hover:bg-myconfort-green/90 shadow-lg'
              : 'bg-myconfort-coral hover:bg-myconfort-coral/90'
          }`}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
