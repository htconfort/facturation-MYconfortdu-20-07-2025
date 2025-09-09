import { useState, useCallback } from 'react';
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
  const { signature, updateSignature } = useInvoiceWizard();
  const [showTermsPage, setShowTermsPage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const onStart = useCallback(() => {
    // Callback stable pour début de signature
  }, []);
  const onEnd = useCallback(() => {
    // Callback stable pour fin de signature
  }, []);

  const handleSigned = async (dataUrl: string, timestamp: string) => {
    try {
      setIsSaving(true);
      updateSignature({ dataUrl, timestamp });
      
      // Attendre un peu pour que l'état se stabilise
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsSaving(false);
      
      // Ne pas naviguer automatiquement - laisser l'utilisateur cliquer "Suivant"
    } catch (error) {
      console.error('Erreur sauvegarde signature:', error);
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (!signature?.dataUrl || isSaving) return;
    
    setIsProcessing(true);
    // Navigation manuelle sécurisée
    setTimeout(() => {
      onNext();
    }, 500);
  };

  // Page secondaire pour les conditions générales
  if (showTermsPage) {
    return (
      <TermsAndConditionsPage
        onBack={() => setShowTermsPage(false)}
      />
    );
  }

  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden relative'>
      {/* 🎯 Header fixe */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          ✍️ Signature du Client
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          Étape 6/8 • Signature obligatoire pour finaliser
        </p>
      </div>

      {/* 🎯 Contenu principal avec zone de signature réduite pour laisser voir le footer */}
      <div className='flex-1 px-6 py-2 flex flex-col'>
        {/* Zone de signature - prend la place disponible */}
        <div className='bg-white rounded-xl border-2 border-gray-300 p-3 mb-3'>
          <div className='h-full flex flex-col'>
            <div className='text-center mb-3'>
              <div className='text-lg font-semibold text-myconfort-dark'>
                📝 Signez dans la zone ci-dessous
              </div>
              <div className='text-sm text-gray-600'>
                Utilisez votre doigt ou un stylet
              </div>
            </div>

            {/* SignaturePad responsive */}
            {/* Hauteur contrôlée pour laisser respirer le footer */}
            <div className='min-h-[160px] h-[32vh]'>
              <SignaturePadView
                onSigned={handleSigned}
                onDrawingStart={onStart}
                onDrawingEnd={onEnd}
              />
              
              {/* Boutons de navigation remontés à côté d'Enregistrer */}
              <div className='flex items-center gap-2 mt-2'>
                <button
                  onClick={onPrev}
                  disabled={isSaving}
                  className='px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 min-h-[56px] font-semibold'
                >
                  ← Précédent
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!signature?.dataUrl || isSaving || isProcessing}
                  className={`px-4 py-2 rounded-xl min-h-[56px] font-semibold
                    ${(!signature?.dataUrl || isSaving || isProcessing)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                      : 'bg-myconfort-green text-white hover:opacity-90'}`}
                >
                  {isProcessing 
                    ? '🔄 Traitement...' 
                    : isSaving 
                      ? '💾 Sauvegarde...'
                      : !signature?.dataUrl
                        ? 'Signez d\'abord'
                        : 'Suivant →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status et actions compacts */}
        <div className='space-y-3'>
          {/* Aperçu signature si signée */}
          {signature?.dataUrl && (
            <div className='bg-myconfort-green/10 p-3 rounded-xl border border-myconfort-green/30'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm font-medium text-myconfort-green'>
                    {isProcessing
                      ? "🔄 Passage à l'étape suivante..."
                      : '✓ Signature enregistrée'}
                  </div>
                  <div className='text-xs text-myconfort-dark/70'>
                    {signature.timestamp &&
                      new Date(signature.timestamp).toLocaleString()}
                  </div>
                </div>
                <img
                  src={signature.dataUrl}
                  alt='Signature'
                  className='h-12 w-24 object-contain border rounded'
                />
              </div>
            </div>
          )}

          {/* Lien vers conditions générales (optionnel) */}
          <div className='text-center'>
            <button
              onClick={() => setShowTermsPage(true)}
              className='px-4 py-2 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 
                         rounded-lg text-sm font-medium transition-colors'
            >
              📋 Consulter les conditions générales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎯 Page secondaire pour les conditions générales
function TermsAndConditionsPage({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <div className='w-full h-full bg-myconfort-cream flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-myconfort-dark/10'>
        <h1 className='text-2xl font-bold text-myconfort-dark'>
          📋 Conditions Générales de Vente
        </h1>
        <p className='text-myconfort-dark/70 text-sm'>
          MyConfort - Conditions à accepter
        </p>
      </div>

      {/* Contenu scrollable */}
      <div className='flex-1 px-6 py-4 overflow-y-auto'>
        <div className='bg-white p-6 rounded-xl border border-gray-300 space-y-4 text-sm leading-relaxed'>
          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>1. OBJET</h3>
            <p className='text-gray-700'>
              Les présentes conditions générales de vente régissent les
              relations contractuelles entre MyConfort et ses clients dans le
              cadre de la vente de produits et services de confort thermique,
              isolation et équipements énergétiques.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>2. COMMANDES</h3>
            <p className='text-gray-700'>
              Toute commande implique l'acceptation pleine et entière des
              présentes conditions. Les commandes ne sont définitives qu'après
              acceptation par MyConfort et encaissement de l'acompte convenu.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>
              3. PRIX ET PAIEMENT
            </h3>
            <p className='text-gray-700'>
              Les prix s'entendent TTC. Un acompte est exigé à la commande. Le
              solde est payable selon les modalités convenues (comptant,
              échelonné, ou lors de la livraison). Tout retard de paiement
              entraîne des pénalités de 3 fois le taux légal.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>
              4. LIVRAISON ET INSTALLATION
            </h3>
            <p className='text-gray-700'>
              Les délais de livraison sont donnés à titre indicatif. MyConfort
              s'engage à respecter au mieux ces délais mais ne pourra être tenu
              responsable des retards dus aux fournisseurs ou à des
              circonstances exceptionnelles.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>5. GARANTIES</h3>
            <p className='text-gray-700'>
              MyConfort garantit ses produits selon les conditions du fabricant.
              La garantie main d'œuvre est de 2 ans à compter de la réception
              des travaux. Cette garantie ne couvre pas l'usure normale, les
              dommages dus à un mauvais usage ou à un défaut d'entretien.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>
              6. DROIT DE RÉTRACTATION
            </h3>
            <p className='text-gray-700'>
              Conformément au Code de la consommation, le client dispose d'un
              délai de 14 jours pour exercer son droit de rétractation, sauf
              pour les produits personnalisés ou les services déjà exécutés avec
              accord express du client.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>
              7. DONNÉES PERSONNELLES
            </h3>
            <p className='text-gray-700'>
              Les données personnelles collectées sont nécessaires au traitement
              de la commande et à la gestion de la relation commerciale. Elles
              ne sont pas transmises à des tiers sans consentement. Le client
              dispose d'un droit d'accès, de rectification et de suppression.
            </p>
          </div>

          <div>
            <h3 className='font-bold text-myconfort-dark mb-2'>
              8. JURIDICTION
            </h3>
            <p className='text-gray-700'>
              Tout litige sera soumis aux tribunaux compétents du ressort du
              siège social de MyConfort. Le droit français s'applique
              exclusivement.
            </p>
          </div>

          <div className='border-t pt-4 mt-6'>
            <p className='text-xs text-gray-500 text-center'>
              MyConfort - Siège social: [Adresse] - RCS: [Numéro] - TVA:
              [Numéro]
              <br />
              Conditions générales mises à jour le 24 août 2025
            </p>
          </div>
        </div>
      </div>

      {/* Navigation simple */}
      <div className='px-6 py-4 border-t border-myconfort-dark/10'>
        <div className='flex justify-center'>
          <button
            onClick={onBack}
            className='px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                       font-bold rounded-xl text-lg transition-all transform hover:scale-105
                       min-h-[56px]'
          >
            ← Retour à la signature
          </button>
        </div>
      </div>
    </div>
  );
}
