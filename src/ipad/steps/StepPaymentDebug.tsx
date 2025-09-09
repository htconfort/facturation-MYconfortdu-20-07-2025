// StepPaymentDebug.tsx - Version debug pour diagnostiquer les problèmes
import { useState, useMemo, useCallback } from 'react';
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

export default function StepPaymentDebug({ onNext, onPrev }: StepProps) {
  const { paiement, updatePaiement, produits } = useInvoiceWizard();

  // Debug: Afficher les données reçues
  console.log('=== DEBUG PAYMENT PAGE ===');
  console.log('Produits reçus:', produits);
  console.log('Nombre de produits:', produits?.length || 0);
  console.log('Paiement actuel:', paiement);

  // État local pour l'acompte et les méthodes
  const [acompte, setAcompte] = useState<number>(paiement?.depositAmount || 0);
  const [depositMethod, setDepositMethod] = useState<string>(paiement?.depositMethod || '');
  const [selectedMethod, setSelectedMethod] = useState<string>(paiement?.method || '');

  // Total TTC à partir des lignes - version debug
  const totalAmount: number = useMemo(() => {
    if (!produits || produits.length === 0) {
      console.log('⚠️ Aucun produit trouvé pour le calcul');
      return 0;
    }

    const total = produits.reduce((acc: number, produit: any) => {
      console.log('Produit:', produit);
      const productTotal = calculateProductTotal(
        produit.prix || 0, 
        produit.quantite || 1, 
        produit.tva || 20
      );
      console.log(`Prix unitaire: ${produit.prix}, Quantité: ${produit.quantite}, Total: ${productTotal}`);
      return acc + productTotal;
    }, 0);

    console.log('💰 Total calculé:', total);
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
      
      {/* ===== HEADER DEBUG ===== */}
      <div 
        className="absolute top-0 left-0 right-0 z-20 bg-myconfort-green"
        style={{ height: '100px' }}
      >
        <div className="flex flex-col justify-center h-full px-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            💳 Mode de Règlement (DEBUG)
          </h1>
          <div className="text-sm">
            <p>Étape 4/7 | Produits: {produits?.length || 0}</p>
            <p className="text-lg font-bold">
              Total calculé : {totalAmount.toFixed(2)}€ TTC
            </p>
            {totalAmount === 0 && (
              <p className="text-red-200">⚠️ Aucun montant calculé - vérifier les produits</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== CONTENU DEBUG ===== */}
      <div 
        className="absolute left-0 right-0 px-6 overflow-y-auto overflow-x-hidden"
        style={{
          top: '100px',
          bottom: '120px',
          paddingBottom: '40px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Section Debug */}
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-6 mt-4">
          <h3 className="text-red-800 font-bold mb-2">🐛 DEBUG INFO</h3>
          <div className="text-sm text-red-700">
            <p><strong>Nombre de produits:</strong> {produits?.length || 0}</p>
            <p><strong>Total calculé:</strong> {totalAmount}€</p>
            <p><strong>Acompte:</strong> {acompte}€</p>
            <p><strong>Reste à payer:</strong> {restePay}€</p>
            <p><strong>Validation OK:</strong> {isValidPayment ? '✅' : '❌'}</p>
          </div>
          
          {produits && produits.length > 0 && (
            <div className="mt-3">
              <strong>Détail produits:</strong>
              {produits.map((p: any, i: number) => (
                <div key={i} className="text-xs bg-white p-2 mt-1 rounded">
                  {p.designation} - {p.prix}€ × {p.quantite} = {(p.prix * p.quantite).toFixed(2)}€
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== RÉSUMÉ FINANCIER ===== */}
        <div className="bg-myconfort-green/10 p-6 rounded-2xl border-2 border-myconfort-green/20 mb-8 shadow-sm">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase">
                Total TTC
              </div>
              <div className="text-2xl font-bold text-myconfort-dark">
                {totalAmount.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase">
                Acompte
              </div>
              <div className={`text-2xl font-bold ${acompte > 0 ? 'text-myconfort-green' : 'text-gray-400'}`}>
                {acompte.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-myconfort-green font-semibold mb-2 uppercase">
                Reste à payer
              </div>
              <div className="text-2xl font-bold text-myconfort-dark">
                {restePay.toFixed(2)}€
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTION ACOMPTE SIMPLE ===== */}
        <div className="bg-white p-6 rounded-2xl mb-8 border border-myconfort-green/15 shadow-sm">
          <h3 className="text-xl font-semibold text-myconfort-dark mb-4">
            💰 Acompte demandé
          </h3>

          {/* Boutons pourcentages */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[20, 30, 40, 50].map(percent => {
              const amount = Math.round(totalAmount * percent / 100);
              return (
                <button
                  key={percent}
                  onClick={() => {
                    console.log(`Sélection ${percent}% = ${amount}€`);
                    setAcompte(amount);
                  }}
                  className={`p-3 rounded-xl border-2 font-semibold transition-colors min-h-12 ${
                    acompte === amount 
                      ? 'border-myconfort-green bg-myconfort-green/10 text-myconfort-green' 
                      : 'border-myconfort-green/20 bg-white text-myconfort-dark'
                  }`}
                >
                  <div>{percent}%</div>
                  <div className="text-sm">{amount}€</div>
                </button>
              );
            })}
          </div>

          {/* Input personnalisé */}
          <div className="mb-4">
            <label className="block text-base font-semibold text-myconfort-dark mb-2">
              Montant personnalisé (€)
            </label>
            <NumericInput
              value={acompte}
              onChange={(value) => {
                console.log('NumericInput onChange:', value);
                const numValue = parseFloat(value) || 0;
                console.log('Converted to number:', numValue);
                setAcompte(numValue);
              }}
              min={0}
              max={totalAmount}
              placeholder="0.00"
              className="w-full p-3 text-lg rounded-xl border-2 border-myconfort-green/20 bg-white text-myconfort-dark font-semibold focus:border-myconfort-green focus:outline-none"
            />
          </div>

          {/* Mode de règlement de l'acompte */}
          {acompte > 0 && (
            <div>
              <label className="block text-base font-semibold text-myconfort-dark mb-3">
                Mode de règlement de l'acompte *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Espèces', label: 'Espèces', emoji: '💵' },
                  { id: 'Carte Bleue', label: 'Carte', emoji: '💳' },
                  { id: 'Chèque comptant', label: 'Chèque', emoji: '🧾' },
                  { id: 'Virement', label: 'Virement', emoji: '🏦' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      console.log('Sélection deposit method:', method.id);
                      setDepositMethod(method.id);
                    }}
                    className={`p-3 rounded-xl border-2 transition-colors min-h-16 flex flex-col justify-center items-center ${
                      depositMethod === method.id 
                        ? 'border-myconfort-green bg-myconfort-green/10' 
                        : 'border-myconfort-green/20 bg-white'
                    }`}
                  >
                    <div className="text-xl">{method.emoji}</div>
                    <div className="font-semibold text-sm">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== SECTION RESTE À PAYER ===== */}
        {restePay > 0 && (
          <div className="bg-white p-6 rounded-2xl mb-8 border border-myconfort-green/15 shadow-sm">
            <h3 className="text-xl font-semibold text-myconfort-dark mb-4">
              💳 Mode de règlement du reste ({restePay.toFixed(2)}€)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Espèces', label: 'Espèces', emoji: '💵' },
                { id: 'Virement', label: 'Virement', emoji: '🏦' },
                { id: 'Carte Bleue', label: 'Carte', emoji: '💳' },
                { id: 'Chèque au comptant', label: 'Chèque', emoji: '🧾' },
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => {
                    console.log('Sélection method:', method.id);
                    setSelectedMethod(method.id);
                    savePayment({ method: method.id });
                  }}
                  className={`p-3 rounded-xl border-2 transition-colors min-h-16 flex flex-col justify-center items-center ${
                    selectedMethod === method.id 
                      ? 'border-myconfort-green bg-myconfort-green/10' 
                      : 'border-myconfort-green/20 bg-white'
                  }`}
                >
                  <div className="text-xl">{method.emoji}</div>
                  <div className="font-semibold text-sm">{method.label}</div>
                </button>
              ))}

              {/* Alma simplifié */}
              <button
                onClick={() => {
                  console.log('Sélection Alma');
                  setSelectedMethod('Alma 3x');
                  savePayment({ method: 'Alma 3x' });
                }}
                className={`p-3 rounded-xl border-2 transition-colors min-h-16 flex flex-col justify-center items-center ${
                  selectedMethod?.startsWith('Alma') 
                    ? 'border-myconfort-green bg-myconfort-green/10' 
                    : 'border-orange-300 bg-orange-50'
                }`}
              >
                <img src={AlmaLogo} alt="Alma" className="h-6" />
                <div className="font-semibold text-sm">Alma</div>
              </button>

              {/* Chèques à venir simplifié */}
              <button
                onClick={() => {
                  console.log('Sélection Chèques à venir');
                  setSelectedMethod('Chèque à venir');
                  savePayment({ method: 'Chèque à venir' });
                }}
                className={`p-3 rounded-xl border-2 transition-colors min-h-16 flex flex-col justify-center items-center ${
                  selectedMethod === 'Chèque à venir' 
                    ? 'border-myconfort-green bg-myconfort-green/10' 
                    : 'border-myconfort-coral/30 bg-myconfort-coral/5'
                }`}
              >
                <div className="text-xl">📄</div>
                <div className="font-semibold text-sm">Chèques</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== FOOTER AVEC NAVIGATION ===== */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-white border-t border-myconfort-dark/10"
        style={{ height: '120px' }}
      >
        <div className="flex flex-col justify-center h-full px-8">
          {/* Message de validation */}
          {!isValidPayment && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm text-center mb-3 border border-red-200">
              {acompte > totalAmount ? 'L\'acompte dépasse le total' :
               acompte > 0 && !depositMethod ? 'Choisir mode règlement acompte' :
               restePay > 0 && !selectedMethod ? 'Choisir mode règlement reste' :
               'Compléter les informations'}
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => {
                console.log('Click Précédent');
                onPrev();
              }}
              className="px-6 py-3 rounded-full border-2 border-myconfort-green bg-white text-myconfort-green font-semibold hover:bg-myconfort-green/5 transition-colors"
            >
              ← Précédent
            </button>

            <div className="px-4 py-2 bg-myconfort-green/10 rounded-full text-myconfort-green font-semibold text-sm">
              Étape 4/7
            </div>

            <button
              onClick={() => {
                console.log('Click Suivant - Valid:', isValidPayment);
                if (isValidPayment) {
                  onNext();
                } else {
                  console.log('Validation échouée');
                }
              }}
              disabled={!isValidPayment}
              className={`px-6 py-3 rounded-full font-semibold transition-colors ${
                isValidPayment 
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
