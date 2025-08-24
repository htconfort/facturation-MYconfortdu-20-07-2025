import { useState, useMemo } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepRecapNoScroll({ onNext, onPrev }: StepProps) {
  const { 
    client, 
    produits, 
    paiement, 
    livraison, 
    signature, 
    invoiceNumber,
    invoiceDate
  } = useInvoiceWizard();
  
  const [showFullInvoice, setShowFullInvoice] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  // Calculs financiers
  const totalTTC = useMemo(() => {
    return produits.reduce((sum, p) => 
      sum + calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType), 0
    );
  }, [produits]);

  const isComplete = client.name && produits.length > 0 && paiement.method && signature?.dataUrl;

  // Page secondaire pour l'aperçu complet de la facture
  if (showFullInvoice) {
    return <FullInvoicePreviewPage 
      client={client}
      produits={produits}
      paiement={paiement}
      livraison={livraison}
      totalTTC={totalTTC}
      invoiceNumber={invoiceNumber}
      invoiceDate={invoiceDate}
      onBack={() => setShowFullInvoice(false)}
      onValidate={() => {
        setShowFullInvoice(false);
        setShowProcessing(true);
      }}
    />;
  }

  // Page de traitement final
  if (showProcessing) {
    return <ProcessingPage 
      onComplete={() => {
        // Ici on peut déclencher l'envoi N8N, impression, etc.
        onNext(); // ou redirection vers confirmation finale
      }}
    />;
  }

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* 🎯 Header fixe */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📋 Récapitulatif Final
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Étape 7/7 • Vérification avant finalisation
        </p>
      </div>

      {/* 🎯 Contenu principal */}
      <div className="flex-1 px-6 py-4 flex flex-col justify-center">
        
        {/* Résumé ultra-compact */}
        <div className="bg-myconfort-green/10 p-4 rounded-xl border border-myconfort-green/30 mb-6">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-myconfort-dark">
                {client.name ? '✓' : '❌'}
              </div>
              <div className="text-xs text-myconfort-dark/70">Client</div>
            </div>
            <div>
              <div className="text-lg font-bold text-myconfort-dark">
                {produits.length}
              </div>
              <div className="text-xs text-myconfort-dark/70">Produits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-myconfort-dark">
                {totalTTC.toFixed(0)}€
              </div>
              <div className="text-xs text-myconfort-dark/70">Total TTC</div>
            </div>
            <div>
              <div className="text-lg font-bold text-myconfort-dark">
                {signature?.dataUrl ? '✓' : '❌'}
              </div>
              <div className="text-xs text-myconfort-dark/70">Signature</div>
            </div>
          </div>
        </div>

        {/* Informations essentielles */}
        <div className="space-y-4">
          
          {/* Client */}
          <div className="bg-white p-4 rounded-xl border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-myconfort-dark">👤 {client.name || 'Non renseigné'}</div>
                <div className="text-sm text-gray-600">
                  {client.email} • {client.phone}
                </div>
                <div className="text-sm text-gray-600">
                  {client.address}, {client.city} {client.postalCode}
                </div>
              </div>
              <div className="text-2xl">
                {client.name ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

          {/* Produits résumé */}
          <div className="bg-white p-4 rounded-xl border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-myconfort-dark">📦 {produits.length} produit(s)</div>
                <div className="text-sm text-gray-600">
                  Total: {totalTTC.toFixed(2)}€ TTC
                </div>
                {produits.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {produits[0].designation}{produits.length > 1 ? `... (+${produits.length-1})` : ''}
                  </div>
                )}
              </div>
              <div className="text-2xl">
                {produits.length > 0 ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white p-4 rounded-xl border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-myconfort-dark">💳 {paiement.method || 'Non défini'}</div>
                <div className="text-sm text-gray-600">
                  {paiement.depositAmount ? `Acompte: ${paiement.depositAmount}€` : 'Montant à définir'}
                </div>
                {paiement.nombreFoisAlma && (
                  <div className="text-xs text-gray-500">Alma {paiement.nombreFoisAlma}x</div>
                )}
                {paiement.nombreChequesAVenir && (
                  <div className="text-xs text-gray-500">{paiement.nombreChequesAVenir} chèques</div>
                )}
              </div>
              <div className="text-2xl">
                {paiement.method ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

          {/* Livraison */}
          <div className="bg-white p-4 rounded-xl border border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-myconfort-dark">🚚 {livraison.deliveryMethod || 'À définir'}</div>
                <div className="text-sm text-gray-600">
                  {livraison.deliveryAddress || client.address || 'Adresse client'}
                </div>
              </div>
              <div className="text-2xl">
                {livraison.deliveryMethod ? '✅' : '⚠️'}
              </div>
            </div>
          </div>

        </div>

        {/* Actions principales */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowFullInvoice(true)}
            className="px-8 py-3 bg-myconfort-blue/20 hover:bg-myconfort-blue/30 
                       text-myconfort-dark font-medium rounded-xl transition-colors
                       border border-myconfort-blue/30"
          >
            📄 Aperçu facture complète
          </button>
        </div>
      </div>

      {/* 🎯 Navigation fixe */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onPrev}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Précédent
        </button>

        <button
          onClick={isComplete ? () => setShowProcessing(true) : undefined}
          disabled={!isComplete}
          className={`px-12 py-4 font-bold rounded-xl text-lg transition-all transform 
                      shadow-lg min-h-[56px] ${
            !isComplete
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              : 'bg-myconfort-green hover:bg-myconfort-green/90 text-white hover:scale-105'
          }`}
        >
          🎯 Finaliser →
        </button>
      </div>
    </div>
  );
}

// 🎯 Page secondaire pour l'aperçu complet de la facture
function FullInvoicePreviewPage({ 
  client,
  produits,
  paiement,
  livraison,
  totalTTC,
  invoiceNumber,
  invoiceDate,
  onBack,
  onValidate 
}: any) {
  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-myconfort-dark/10">
        <h1 className="text-2xl font-bold text-myconfort-dark">
          📄 Aperçu Facture
        </h1>
        <p className="text-myconfort-dark/70 text-sm">
          Facture #{invoiceNumber} - {invoiceDate}
        </p>
      </div>

      {/* Contenu scrollable avec aperçu facture */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl border border-gray-300 max-w-4xl mx-auto">
          
          {/* En-tête facture */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-myconfort-green">MyConfort</h1>
              <p className="text-gray-600">Solutions de confort thermique</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">FACTURE #{invoiceNumber}</div>
              <div className="text-gray-600">Date: {invoiceDate}</div>
            </div>
          </div>

          {/* Informations client */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">FACTURER À:</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-semibold">{client.name}</div>
              <div>{client.address}</div>
              <div>{client.postalCode} {client.city}</div>
              <div>{client.email} • {client.phone}</div>
            </div>
          </div>

          {/* Tableau produits */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-myconfort-green text-white">
                  <th className="border p-2 text-left">Produit</th>
                  <th className="border p-2 text-center">Qté</th>
                  <th className="border p-2 text-right">Prix Unit.</th>
                  <th className="border p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p: any, i: number) => {
                  const total = calculateProductTotal(p.qty, p.priceTTC, p.discount, p.discountType);
                  return (
                    <tr key={i}>
                      <td className="border p-2">{p.designation}</td>
                      <td className="border p-2 text-center">{p.qty}</td>
                      <td className="border p-2 text-right">{p.priceTTC.toFixed(2)}€</td>
                      <td className="border p-2 text-right">{total.toFixed(2)}€</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={3} className="border p-2 text-right">TOTAL TTC:</td>
                  <td className="border p-2 text-right">{totalTTC.toFixed(2)}€</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Informations paiement */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">MODALITÉS DE PAIEMENT:</h3>
            <div className="bg-blue-50 p-3 rounded">
              <div><strong>Méthode:</strong> {paiement.method}</div>
              {paiement.depositAmount && (
                <div><strong>Acompte:</strong> {paiement.depositAmount}€</div>
              )}
              {paiement.nombreFoisAlma && (
                <div><strong>Alma:</strong> {paiement.nombreFoisAlma} fois</div>
              )}
              {paiement.nombreChequesAVenir && (
                <div><strong>Chèques:</strong> {paiement.nombreChequesAVenir} chèques</div>
              )}
            </div>
          </div>

          {/* Informations livraison */}
          <div className="mb-6">
            <h3 className="font-bold text-myconfort-dark mb-2">LIVRAISON:</h3>
            <div className="bg-yellow-50 p-3 rounded">
              <div><strong>Mode:</strong> {livraison.deliveryMethod || 'À définir'}</div>
              <div><strong>Adresse:</strong> {livraison.deliveryAddress || client.address}</div>
              {livraison.deliveryNotes && (
                <div><strong>Instructions:</strong> {livraison.deliveryNotes}</div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-myconfort-dark/10 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     min-h-[56px]"
        >
          ← Retour
        </button>

        <button
          onClick={onValidate}
          className="px-12 py-4 bg-myconfort-green hover:bg-myconfort-green/90 text-white
                     font-bold rounded-xl text-lg transition-all transform hover:scale-105
                     shadow-lg min-h-[56px]"
        >
          ✅ Valider facture →
        </button>
      </div>
    </div>
  );
}

// 🎯 Page de traitement final
function ProcessingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);

  // Simulation du processus
  setTimeout(() => {
    if (step < 4) setStep(step + 1);
    else onComplete();
  }, 1500);

  const steps = [
    '📄 Génération PDF...',
    '📤 Envoi N8N...',
    '💾 Sauvegarde...',
    '✅ Terminé !'
  ];

  return (
    <div className="w-full h-full bg-myconfort-cream flex flex-col overflow-hidden items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-myconfort-dark mb-6">
          Finalisation en cours...
        </h1>
        
        <div className="space-y-3">
          {steps.map((stepText, i) => (
            <div key={i} className={`flex items-center justify-center gap-3 p-2 rounded-lg ${
              i < step ? 'bg-myconfort-green/10 text-myconfort-green' :
              i === step ? 'bg-myconfort-blue/10 text-myconfort-blue' :
              'bg-gray-100 text-gray-400'
            }`}>
              <div className="text-lg">
                {i < step ? '✅' : i === step ? '⏳' : '⭕'}
              </div>
              <div className="font-medium">{stepText}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-myconfort-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Étape {step}/4
          </div>
        </div>
      </div>
    </div>
  );
}
