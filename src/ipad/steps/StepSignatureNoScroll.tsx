import { useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import SignaturePadView from '../../components/SignaturePadView';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepSignatureNoScroll({ onNext, onPrev }: StepProps) {
  const { signature, updateSignature, termsAccepted, setTermsAccepted } = useInvoiceWizard();
  const [showTermsPage, setShowTermsPage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSigned = (dataUrl: string, timestamp: string) => {
    updateSignature({ dataUrl, timestamp });
    
    // Indication de traitement et passage automatique
    if (termsAccepted) {
      setIsProcessing(true);
      setTimeout(() => {
        onNext();
      }, 1500);
    }
  };

  // Page secondaire pour les conditions générales
  if (showTermsPage) {
    return <TermsAndConditionsPage 
      termsAccepted={termsAccepted}
      setTermsAccepted={setTermsAccepted}
      onBack={() => setShowTermsPage(false)}
      onAccept={() => {
        setTermsAccepted(true);
        setShowTermsPage(false);
      }}
    />;
  }

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative">
      {/* 🎯 Header fixe */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          ✍️ Signature du Client
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Étape 6/8 • Signature obligatoire pour finaliser
        </p>
      </div>

      {/* 🎯 Contenu principal avec espace pour les boutons */}
      <div className="flex-1 px-6 py-4 pb-16 flex flex-col">
        
        {/* Zone de signature - prend la place disponible */}
        <div className="flex-1 bg-white rounded-xl border-2 border-gray-300 p-4 mb-4">
          <div className="h-full flex flex-col">
            <div className="text-center mb-3">
              <div className="text-lg font-semibold text-myconfort-dark">
                📝 Signez dans la zone ci-dessous
              </div>
              <div className="text-sm text-gray-600">
                Utilisez votre doigt ou un stylet
              </div>
            </div>
            
            {/* SignaturePad responsive */}
            <div className="flex-1 min-h-[200px]">
              <SignaturePadView onSigned={handleSigned} onPrevious={onPrev} />
            </div>
          </div>
        </div>

        {/* Status et actions compacts */}
        <div className="space-y-3">
          
          {/* Aperçu signature si signée */}
          {signature?.dataUrl && (
            <div className="bg-myconfort-green/10 p-3 rounded-xl border border-myconfort-green/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-myconfort-green">
                    {isProcessing ? '🔄 Passage à l\'étape suivante...' : '✓ Signature enregistrée'}
                  </div>
                  <div className="text-xs text-myconfort-dark/70">
                    {signature.timestamp && new Date(signature.timestamp).toLocaleString()}
                  </div>
                </div>
                <img 
                  src={signature.dataUrl} 
                  alt="Signature" 
                  className="h-12 w-24 object-contain border rounded"
                />
              </div>
            </div>
          )}

          {/* Conditions générales */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-300">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 text-myconfort-green"
              />
              <label htmlFor="terms" className="text-sm font-medium text-myconfort-dark">
                J'accepte les conditions générales
              </label>
            </div>
            <button
              onClick={() => setShowTermsPage(true)}
              className="px-3 py-1 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 
                         rounded-lg text-sm font-medium transition-colors"
            >
              📋 Lire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 Page secondaire pour les conditions générales
function TermsAndConditionsPage({ 
  termsAccepted,
  setTermsAccepted,
  onBack,
  onAccept 
}: { 
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  onBack: () => void; 
  onAccept: () => void; 
}) {
  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📋 Conditions Générales de Vente
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          MyConfort - Conditions à accepter
        </p>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-300 space-y-4 text-sm leading-relaxed">
          
          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">1. OBJET</h3>
            <p className="text-gray-700">
              Les présentes conditions générales de vente régissent les relations contractuelles 
              entre MyConfort et ses clients dans le cadre de la vente de produits et services 
              de confort thermique, isolation et équipements énergétiques.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">2. COMMANDES</h3>
            <p className="text-gray-700">
              Toute commande implique l'acceptation pleine et entière des présentes conditions. 
              Les commandes ne sont définitives qu'après acceptation par MyConfort et encaissement 
              de l'acompte convenu.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">3. PRIX ET PAIEMENT</h3>
            <p className="text-gray-700">
              Les prix s'entendent TTC. Un acompte est exigé à la commande. Le solde est payable 
              selon les modalités convenues (comptant, échelonné, ou lors de la livraison). 
              Tout retard de paiement entraîne des pénalités de 3 fois le taux légal.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">4. LIVRAISON ET INSTALLATION</h3>
            <p className="text-gray-700">
              Les délais de livraison sont donnés à titre indicatif. MyConfort s'engage à respecter 
              au mieux ces délais mais ne pourra être tenu responsable des retards dus aux 
              fournisseurs ou à des circonstances exceptionnelles.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">5. GARANTIES</h3>
            <p className="text-gray-700">
              MyConfort garantit ses produits selon les conditions du fabricant. La garantie 
              main d'œuvre est de 2 ans à compter de la réception des travaux. Cette garantie 
              ne couvre pas l'usure normale, les dommages dus à un mauvais usage ou à un défaut d'entretien.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">6. DROIT DE RÉTRACTATION</h3>
            <p className="text-gray-700">
              Conformément au Code de la consommation, le client dispose d'un délai de 14 jours 
              pour exercer son droit de rétractation, sauf pour les produits personnalisés ou 
              les services déjà exécutés avec accord express du client.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">7. DONNÉES PERSONNELLES</h3>
            <p className="text-gray-700">
              Les données personnelles collectées sont nécessaires au traitement de la commande 
              et à la gestion de la relation commerciale. Elles ne sont pas transmises à des tiers 
              sans consentement. Le client dispose d'un droit d'accès, de rectification et de suppression.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-myconfort-dark mb-2">8. JURIDICTION</h3>
            <p className="text-gray-700">
              Tout litige sera soumis aux tribunaux compétents du ressort du siège social de MyConfort. 
              Le droit français s'applique exclusivement.
            </p>
          </div>

          <div className="border-t pt-4 mt-6">
            <p className="text-xs text-gray-500 text-center">
              MyConfort - Siège social: [Adresse] - RCS: [Numéro] - TVA: [Numéro]<br/>
              Conditions générales mises à jour le 24 août 2025
            </p>
          </div>
        </div>
      </div>

      {/* Navigation avec checkbox */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10">
        <div className="flex items-center justify-center mb-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 text-myconfort-green"
            />
            <span className="font-medium text-myconfort-dark">
              J'ai lu et j'accepte les conditions générales
            </span>
          </label>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                       font-bold rounded-xl text-lg transition-all transform hover:scale-105
                       min-h-[56px]"
          >
            ← Retour
          </button>

          <button
            onClick={termsAccepted ? onAccept : undefined}
            disabled={!termsAccepted}
            className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform 
                        shadow-lg min-h-[56px] ${
              !termsAccepted
                ? 'bg-red-500 hover:bg-red-600 text-white cursor-not-allowed opacity-90'
                : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
            }`}
          >
            {!termsAccepted ? 'Cochez pour accepter les conditions' : 'Accepter et continuer →'}
          </button>
        </div>
      </div>
    </div>
  );
}
