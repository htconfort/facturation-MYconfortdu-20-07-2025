import { useRef, useEffect, useState } from 'react';
import { useInvoiceWizard } from '../../store/useInvoiceWizard';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  onQuit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function StepSignature({ onNext }: StepProps) {
  const { signatureDataUrl, setSignature, updateAdvisorName, advisorName, setTermsAccepted, termsAccepted } = useInvoiceWizard();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = 800;
    canvas.height = 300;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fond blanc
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Restaurer la signature existante si présente
    if (signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = signatureDataUrl;
    }
  }, [signatureDataUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    setIsDrawing(true);
    setHasDrawn(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Sauvegarder la signature
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignature(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature(undefined);
    setHasDrawn(false);
  };

  const isValid = hasDrawn && termsAccepted && (advisorName || '').trim().length > 0;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#477A0C] mb-2">✍️ Signature Électronique</h2>
        <p className="text-gray-600 text-lg">
          Signez numériquement pour finaliser votre commande
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Nom du conseiller */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">👤 Conseiller MyConfort</h3>
          <div>
            <label className="block text-gray-700 font-semibold mb-3">
              Nom du conseiller *
            </label>
            <input
              value={advisorName || ''}
              onChange={(e) => updateAdvisorName(e.target.value)}
              className="w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all"
              placeholder="Ex: Sophie Martin"
            />
          </div>
        </div>

        {/* Zone de signature */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">✍️ Signature du client</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
            <canvas
              ref={canvasRef}
              className="w-full h-48 bg-white rounded-lg border-2 border-gray-200 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                {hasDrawn ? '✅ Signature effectuée' : '👆 Signez dans la zone ci-dessus'}
              </p>
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
              >
                🗑️ Effacer
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Instructions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Utilisez votre doigt ou un stylet pour signer</li>
              <li>• La signature sera intégrée au PDF de la facture</li>
              <li>• Vous pouvez effacer et recommencer si nécessaire</li>
              <li>• Une signature claire améliore la validité du document</li>
            </ul>
          </div>
        </div>

        {/* Acceptation des conditions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Conditions Générales</h3>
          
          <div className="bg-gray-50 rounded-xl p-6 max-h-60 overflow-y-auto mb-4">
            <div className="text-sm text-gray-700 leading-relaxed space-y-3">
              <h4 className="font-semibold text-lg text-gray-800">Conditions Générales de Vente MyConfort</h4>
              
              <p><strong>Article 1 - Objet</strong><br />
              Les présentes conditions générales de vente s'appliquent à toutes les ventes de produits MyConfort.</p>
              
              <p><strong>Article 2 - Prix et Paiement</strong><br />
              Les prix sont exprimés en euros TTC. Le paiement peut s'effectuer par carte bancaire, virement, chèque ou espèces.</p>
              
              <p><strong>Article 3 - Livraison</strong><br />
              Les délais de livraison sont donnés à titre indicatif. MyConfort s'engage à respecter au mieux ces délais.</p>
              
              <p><strong>Article 4 - Garantie</strong><br />
              Tous nos produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.</p>
              
              <p><strong>Article 5 - Droit de rétractation</strong><br />
              Conformément à la loi, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation.</p>
              
              <p><strong>Article 6 - Protection des données</strong><br />
              Vos données personnelles sont collectées et traitées conformément au RGPD et à notre politique de confidentialité.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-6 h-6 text-[#477A0C] bg-gray-100 border-2 border-gray-300 rounded focus:ring-[#477A0C] focus:ring-2"
            />
            <label htmlFor="terms" className="text-gray-700 font-semibold cursor-pointer">
              J'accepte les conditions générales de vente MyConfort *
            </label>
          </div>
        </div>

        {/* Validation et statut */}
        <div className={`rounded-2xl p-6 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isValid ? 'text-green-800' : 'text-orange-800'}`}>
                {isValid ? '✅ Signature complète' : '⚠️ Signature incomplète'}
              </h3>
              <p className={`text-sm ${isValid ? 'text-green-600' : 'text-orange-600'}`}>
                {isValid 
                  ? 'Toutes les informations sont remplies, vous pouvez continuer'
                  : 'Veuillez remplir tous les champs requis : conseiller, signature et acceptation des CGV'
                }
              </p>
            </div>
            {isValid && (
              <button
                onClick={onNext}
                className="bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Voir le Récapitulatif →
              </button>
            )}
          </div>
        </div>

        {/* Messages d'erreur spécifiques */}
        {!isValid && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-red-800 font-semibold mb-2">Éléments manquants :</div>
            <ul className="text-red-600 text-sm space-y-1">
              {!(advisorName || '').trim() && <li>• Nom du conseiller</li>}
              {!hasDrawn && <li>• Signature du client</li>}
              {!termsAccepted && <li>• Acceptation des conditions générales</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
