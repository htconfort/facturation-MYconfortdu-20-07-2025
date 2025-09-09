// StepPaymentWithLogs.tsx - Version avec logs détaillés pour debug
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';
import { calculateProductTotal } from '../../utils/calculations';
import AlmaLogo from '../../assets/images/Alma_orange.png';
import NumericInput from '../../components/NumericInput';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

export default function StepPaymentWithLogs({ onNext, onPrev }: StepProps) {
  const storeData = useInvoiceWizard();
  const { paiement, updatePaiement, produits } = storeData;

  // LOG COMPLET DU STORE AU MONTAGE
  useEffect(() => {
    console.log('=== STEP PAYMENT - STORE DATA ===');
    console.log('Store complet:', storeData);
    console.log('Produits du store:', produits);
    console.log('Paiement du store:', paiement);
    console.log('Type de produits:', typeof produits);
    console.log('Array.isArray(produits):', Array.isArray(produits));
    console.log('Nombre de produits:', produits?.length);
    
    if (produits && produits.length > 0) {
      console.log('=== DÉTAIL DES PRODUITS ===');
      produits.forEach((p, i) => {
        console.log(`Produit ${i}:`, p);
        console.log(`- designation: ${p.designation}`);
        console.log(`- priceTTC: ${p.priceTTC} (type: ${typeof p.priceTTC})`);
        console.log(`- qty: ${p.qty} (type: ${typeof p.qty})`);
        
        // Test du calcul pour ce produit
        try {
          const total = calculateProductTotal(p.priceTTC || 0, p.qty || 1, p.tva || 20);
          console.log(`- total calculé: ${total}`);
        } catch (error) {
          console.error(`- erreur calcul produit ${i}:`, error);
        }
      });
    } else {
      console.log('❌ AUCUN PRODUIT TROUVÉ');
    }
  }, [storeData, produits, paiement]);

  // État local pour l'acompte et les méthodes
  const [acompte, setAcompte] = useState<number>(paiement?.depositAmount || 0);
  const [depositMethod, setDepositMethod] = useState<string>(paiement?.depositMethod || '');
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');

  // Total TTC avec logs détaillés
  const totalAmount: number = useMemo(() => {
    console.log('=== CALCUL TOTAL AMOUNT ===');
    console.log('Produits pour calcul:', produits);
    
    if (!produits) {
      console.log('❌ produits is null/undefined');
      return 0;
    }
    
    if (!Array.isArray(produits)) {
      console.log('❌ produits is not an array:', typeof produits);
      return 0;
    }
    
    if (produits.length === 0) {
      console.log('❌ produits array is empty');
      return 0;
    }

    let total = 0;
    
    try {
      total = produits.reduce((acc: number, produit: any, index: number) => {
        console.log(`=== PRODUIT ${index} ===`);
        console.log('Produit brut:', produit);
        
        const prix = produit.priceTTC || produit.prix || 0;
        const quantite = produit.qty || produit.quantite || 1;
        const tva = produit.tva || 20;
        
        console.log(`Prix: ${prix} (type: ${typeof prix})`);
        console.log(`Quantité: ${quantite} (type: ${typeof quantite})`);
        console.log(`TVA: ${tva} (type: ${typeof tva})`);
        
        try {
          const productTotal = calculateProductTotal(prix, quantite, tva);
          console.log(`Total produit: ${productTotal}`);
          console.log(`Acc avant: ${acc}, après: ${acc + productTotal}`);
          return acc + productTotal;
        } catch (error) {
          console.error(`Erreur calcul produit ${index}:`, error);
          return acc;
        }
      }, 0);
      
      console.log(`💰 TOTAL FINAL: ${total}`);
    } catch (error) {
      console.error('❌ Erreur dans reduce:', error);
      total = 0;
    }

    return total;
  }, [produits]);

  // Reste à payer
  const restePay = useMemo(() => {
    const reste = Math.max(0, totalAmount - acompte);
    console.log(`Reste à payer: ${totalAmount} - ${acompte} = ${reste}`);
    return reste;
  }, [totalAmount, acompte]);

  // Validation
  const isValidPayment = useMemo(() => {
    const valid = (() => {
      if (acompte < 0 || acompte > totalAmount) return false;
      if (acompte > 0 && !depositMethod) return false;
      if (restePay > 0 && !selectedMethod) return false;
      return true;
    })();
    console.log('Validation paiement:', valid);
    return valid;
  }, [acompte, totalAmount, depositMethod, restePay, selectedMethod]);

  // Sauvegarde
  const savePayment = useCallback((data: any) => {
    console.log('Sauvegarde paiement:', data);
    try {
      updatePaiement({
        ...paiement,
        ...data,
        depositAmount: acompte,
        depositMethod,
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  }, [updatePaiement, paiement, acompte, depositMethod]);

  return (
    <div 
      className="w-full h-screen bg-myconfort-cream relative overflow-visible font-manrope"
      style={{ height: '100svh' }}
    >
      
      {/* ===== HEADER AVEC DIAGNOSTIC ===== */}
      <div 
        className="absolute top-0 left-0 right-0 z-20"
        style={{ height: '120px' }}
      >
        {/* Ligne diagnostic rouge */}
        <div className="bg-red-600 text-white px-4 py-2 text-sm">
          <strong>DEBUG:</strong> Produits: {produits?.length || 0} | Total: {totalAmount}€ | 
          {totalAmount === 0 && produits?.length > 0 && ' ⚠️ PROBLÈME CALCUL'} 
          {!produits && ' ⚠️ PRODUITS NULL'}
          {produits?.length === 0 && ' ⚠️ AUCUN PRODUIT'}
        </div>
        
        {/* Header normal */}
        <div className="bg-gradient-to-r from-myconfort-green to-green-600 text-white px-8 py-4 flex flex-col justify-center" style={{ height: '90px' }}>
          <h1 className="text-2xl font-bold mb-2">
            💳 Mode de Règlement
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-90">Étape 4/7</p>
            <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <span className="text-white font-bold text-lg">
                Total : {totalAmount.toFixed(2)}€ TTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENU ===== */}
      <div 
        className="absolute left-0 right-0 px-6 overflow-y-auto overflow-x-hidden"
        style={{
          top: '120px',
          bottom: '110px',
          paddingBottom: '20px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Section debug détaillée */}
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 DIAGNOSTIC COMPLET</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Produits reçus:</strong> {produits ? `${produits.length} produits` : 'NULL'}</p>
            <p><strong>Total calculé:</strong> {totalAmount}€</p>
            {produits && produits.length > 0 && (
              <div className="mt-2 space-y-1">
                <strong>Détail produits:</strong>
                {produits.map((p: any, i: number) => (
                  <div key={i} className="text-xs bg-white p-2 rounded">
                    {i+1}. {p.designation} - {p.priceTTC || p.prix}€ × {p.qty || p.quantite} = {((p.priceTTC || p.prix) * (p.qty || p.quantite)).toFixed(2)}€
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interface simplifiée si pas de données */}
        {totalAmount === 0 ? (
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-xl text-center">
            <h3 className="text-red-800 font-bold text-lg mb-2">❌ Aucun montant détecté</h3>
            <p className="text-red-600 mb-4">Les données des produits ne sont pas transmises correctement.</p>
            <button 
              onClick={() => {
                console.log('Force refresh store data');
                console.log('Current store:', useInvoiceWizard.getState());
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              🔄 Debug Store
            </button>
          </div>
        ) : (
          <>
            {/* Résumé financier */}
            <div className="bg-white/90 backdrop-blur p-5 rounded-xl border border-myconfort-green/20 mb-6 shadow-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                    Total TTC
                  </div>
                  <div className="text-xl font-bold text-myconfort-dark">
                    {totalAmount.toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                    Acompte
                  </div>
                  <div className={`text-xl font-bold ${acompte > 0 ? 'text-myconfort-green' : 'text-gray-400'}`}>
                    {acompte.toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-xs text-myconfort-green font-semibold uppercase tracking-wide mb-1">
                    Reste
                  </div>
                  <div className="text-xl font-bold text-myconfort-dark">
                    {restePay.toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>

            {/* Section acompte simplifiée */}
            <div className="bg-white p-6 rounded-xl mb-6 border border-myconfort-green/15 shadow-sm">
              <h3 className="text-lg font-bold text-myconfort-dark mb-4">💰 Acompte</h3>

              {/* Boutons pourcentages */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[20, 30, 40, 50].map(percent => {
                  const amount = Math.round(totalAmount * percent / 100);
                  const isSelected = acompte === amount;
                  return (
                    <button
                      key={percent}
                      onClick={() => {
                        console.log(`Sélection ${percent}% = ${amount}€`);
                        setAcompte(amount);
                      }}
                      className={`p-3 rounded-lg border-2 font-bold transition-all min-h-14 ${
                        isSelected 
                          ? 'border-myconfort-green bg-myconfort-green text-white' 
                          : 'border-myconfort-green/30 bg-white text-myconfort-dark hover:border-myconfort-green'
                      }`}
                    >
                      <div className="text-sm">{percent}%</div>
                      <div className="text-xs">{amount}€</div>
                    </button>
                  );
                })}
              </div>

              {/* Input */}
              <NumericInput
                value={acompte}
                onChange={(value) => {
                  const numValue = parseFloat(value) || 0;
                  console.log('NumericInput:', value, '→', numValue);
                  setAcompte(numValue);
                }}
                min={0}
                max={totalAmount}
                className="w-full p-3 text-lg rounded-lg border-2 border-myconfort-green/20"
                placeholder="Montant personnalisé"
              />
            </div>
          </>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-myconfort-green/20"
        style={{ height: '110px' }}
      >
        <div className="flex flex-col justify-center h-full px-6">
          {/* Boutons de navigation */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={onPrev}
              className="px-6 py-3 rounded-full border-2 border-myconfort-green bg-white text-myconfort-green font-bold hover:bg-myconfort-green/5"
            >
              ← Précédent
            </button>

            <div className="px-4 py-2 bg-myconfort-green/10 rounded-full text-myconfort-green font-bold text-sm">
              4/7
            </div>

            <button
              onClick={() => {
                console.log('Click Suivant - Total:', totalAmount);
                if (totalAmount > 0) {
                  onNext();
                } else {
                  console.log('❌ Pas de total, navigation bloquée');
                }
              }}
              disabled={totalAmount === 0}
              className={`px-6 py-3 rounded-full font-bold transition-all ${
                totalAmount > 0
                  ? 'bg-myconfort-green text-white hover:bg-myconfort-green/90' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
