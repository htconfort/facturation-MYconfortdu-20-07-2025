import { useEffect, useRef } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepClient({ onNext }: StepProps) {
  const { client, updateClient } = useInvoiceWizard();
  const nameRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => { 
    nameRef.current?.focus(); 
  }, []);

  const isValid = client.name.trim().length > 2 && 
                  client.email && 
                  client.email.includes('@') &&
                  client.phone &&
                  client.address &&
                  client.city &&
                  client.postalCode;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#477A0C] mb-2">👤 Informations Client</h2>
        <p className="text-gray-600 text-lg">
          Saisissez les coordonnées complètes du client pour la facturation
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nom complet - Focus automatique */}
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Nom complet *
            </label>
            <input 
              ref={nameRef}
              value={client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="Ex: Martin Dupont"
              autoComplete="name"
            />
          </div>

          {/* Email - Clavier email optimisé */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Email *
            </label>
            <input 
              type="email" 
              inputMode="email" 
              value={client.email || ''}
              onChange={(e) => updateClient({ email: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="email@exemple.com"
              autoComplete="email"
            />
          </div>

          {/* Téléphone - Clavier numérique */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Téléphone *
            </label>
            <input 
              type="tel" 
              inputMode="tel" 
              value={client.phone || ''}
              onChange={(e) => updateClient({ phone: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="06 xx xx xx xx"
              autoComplete="tel"
            />
          </div>

          {/* Adresse ligne 1 */}
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Adresse (ligne 1) *
            </label>
            <input 
              value={client.address || ''}
              onChange={(e) => updateClient({ address: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="123 rue de la Paix"
              autoComplete="street-address"
            />
          </div>

          {/* Adresse ligne 2 - Optionnelle */}
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Adresse (ligne 2) - Optionnelle
            </label>
            <input 
              value={client.addressLine2 || ''}
              onChange={(e) => updateClient({ addressLine2: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="Résidence Les Jardins - Bâtiment B"
            />
            <p className="text-gray-500 text-sm mt-2 pl-2">
              💡 Résidence, bâtiment, lieu-dit, complément d'adresse...
            </p>
          </div>

          {/* Code postal - Clavier numérique */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Code Postal *
            </label>
            <input 
              inputMode="numeric"
              pattern="[0-9]*"
              value={client.postalCode || ''}
              onChange={(e) => updateClient({ postalCode: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="75017"
              autoComplete="postal-code"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Ville *
            </label>
            <input 
              value={client.city || ''}
              onChange={(e) => updateClient({ city: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="Paris"
              autoComplete="address-level2"
            />
          </div>

          {/* SIRET - Optionnel */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              SIRET <span className="text-gray-400">(optionnel)</span>
            </label>
            <input 
              value={client.siret || ''}
              onChange={(e) => updateClient({ siret: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="82431353000027"
            />
          </div>

          {/* Type de logement - Optionnel */}
          <div>
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Type de logement <span className="text-gray-400">(optionnel)</span>
            </label>
            <select
              value={client.housingType || ''}
              onChange={(e) => updateClient({ housingType: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
            >
              <option value="">Sélectionner</option>
              <option value="Appartement">Appartement</option>
              <option value="Maison">Maison</option>
              <option value="Bureau">Bureau</option>
              <option value="Local commercial">Local commercial</option>
            </select>
          </div>

          {/* Code porte - Optionnel */}
          <div className="lg:col-span-2">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Code porte / Digicode <span className="text-gray-400">(optionnel)</span>
            </label>
            <input 
              value={client.doorCode || ''}
              onChange={(e) => updateClient({ doorCode: e.target.value })}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="A1234, Étage 3, Porte gauche..."
            />
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Champs obligatoires remplis : <span className="font-semibold">{
                [client.name, client.email, client.phone, client.address, client.city, client.postalCode]
                  .filter(field => field && field.trim()).length
              }/6</span>
            </div>
            {isValid && (
              <div className="flex items-center text-green-600 font-semibold">
                <span className="mr-2">✅</span>
                Prêt pour continuer
              </div>
            )}
          </div>
          {!isValid && (
            <div className="mt-2 text-sm text-orange-600">
              ⚠️ Veuillez compléter tous les champs obligatoires pour continuer
            </div>
          )}
        </div>

        {/* Bouton rapide pour continuer */}
        {isValid && (
          <div className="mt-6 text-center">
            <button
              onClick={onNext}
              className="bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Continuer vers les Produits →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
