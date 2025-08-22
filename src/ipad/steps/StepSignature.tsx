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
  const {
    signature,
    updateSignature,
    updateAdvisorName,
    advisorName,
    setTermsAccepted,
    termsAccepted,
  } = useInvoiceWizard();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Auto-cocher les conditions générales au chargement
  useEffect(() => {
    if (!termsAccepted) {
      setTermsAccepted(true);
    }
  }, [termsAccepted, setTermsAccepted]);

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
    if (signature.dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = signature.dataUrl;
    }
  }, [signature.dataUrl]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
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

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
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
      updateSignature({
        dataUrl: dataUrl,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateSignature({ dataUrl: '', timestamp: '' });
    setHasDrawn(false);
  };

  const isValid =
    hasDrawn && termsAccepted && (advisorName || '').trim().length > 0;

  return (
    <div className='py-8'>
      {/* Header avec code couleur harmonisé */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-[#477A0C] text-white rounded-full text-2xl font-bold mb-4'>
          6
        </div>
        <h2 className='text-3xl font-bold text-[#477A0C] mb-2'>
          ✍️ Signature Électronique
        </h2>
        <p className='text-gray-600 text-lg'>
          Signez numériquement pour finaliser votre commande
        </p>
      </div>

      <div className='max-w-4xl mx-auto space-y-8'>
        {/* Nom du conseiller */}
        <div className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4'>
            👤 Conseiller MyConfort
          </h3>
          <div>
            <label className='block text-gray-700 font-semibold mb-3'>
              Nom du conseiller *
            </label>
            <input
              value={advisorName || ''}
              onChange={e => updateAdvisorName(e.target.value)}
              className='w-full h-16 rounded-xl border-2 border-gray-300 px-6 text-xl focus:border-[#477A0C] focus:ring-4 focus:ring-[#477A0C]/20 transition-all'
              placeholder='Ex: Sophie Martin'
            />
          </div>
        </div>

        {/* Information légale - Article L224-59 */}
        <div className='bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-xl p-6'>
          <h3 className='text-xl font-semibold text-amber-800 mb-4 flex items-center'>
            <span className='mr-3'>⚖️</span>
            INFORMATION LÉGALE - ARTICLE L224-59
          </h3>
          <div className='bg-white rounded-xl p-4 border border-amber-200'>
            <p className='text-gray-700 text-lg leading-relaxed italic'>
              « Avant la conclusion de tout contrat entre un consommateur et un
              professionnel à l'occasion d'une foire, d'un salon [...] le
              professionnel informe le consommateur qu'il ne dispose pas d'un
              délai de rétractation. »
            </p>
            <div className='mt-3 text-sm text-amber-700 font-medium'>
              Code de la consommation - Article L224-59
            </div>
          </div>
        </div>

        {/* Zone de signature */}
        <div className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4'>
            ✍️ Signature du client
          </h3>

          <div className='border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50'>
            <canvas
              ref={canvasRef}
              className='w-full h-48 bg-white rounded-lg border-2 border-gray-200 cursor-crosshair touch-none'
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            <div className='flex justify-between items-center mt-4'>
              <p className='text-sm text-gray-600'>
                {hasDrawn
                  ? '✅ Signature effectuée'
                  : '👆 Signez dans la zone ci-dessus'}
              </p>
              <button
                onClick={clearSignature}
                className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all'
              >
                🗑️ Effacer
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className='mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200'>
            <h4 className='font-semibold text-blue-800 mb-2'>
              💡 Instructions
            </h4>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• Utilisez votre doigt ou un stylet pour signer</li>
              <li>• La signature sera intégrée au PDF de la facture</li>
              <li>• Vous pouvez effacer et recommencer si nécessaire</li>
              <li>• Une signature claire améliore la validité du document</li>
            </ul>
          </div>
        </div>

        {/* Acceptation des conditions */}
        <div className='bg-white rounded-2xl shadow-xl p-6 border-2 border-[#477A0C]/20'>
          <h3 className='text-xl font-semibold text-[#477A0C] mb-4'>
            📋 Conditions Générales
          </h3>

          <div className='bg-gray-50 rounded-xl p-6 max-h-80 overflow-y-auto mb-4'>
            <div className='text-sm text-gray-700 leading-relaxed space-y-3'>
              <h4 className='font-semibold text-lg text-gray-800'>
                CONDITIONS GÉNÉRALES DE VENTE
              </h4>

              <p>
                <strong>Art. 1 - Livraison</strong>
                <br />
                Une fois la commande expédiée, vous serez contacté par SMS ou
                mail pour programmer la livraison en fonction de vos
                disponibilités (à la journée ou demi-journée). Le transporteur
                livre le produit au pas de porte ou en bas de l'immeuble.
                Veuillez vérifier que les dimensions du produit permettent son
                passage dans les escaliers, couloirs et portes. Aucun service
                d'installation ou de reprise de l'ancienne literie n'est prévu.
              </p>

              <p>
                <strong>Art. 2 - Délais de Livraison</strong>
                <br />
                Les délais de livraison sont donnés à titre indicatif et ne
                constituent pas un engagement ferme. En cas de retard, aucune
                indemnité ou annulation ne sera acceptée, notamment en cas de
                force majeure. Nous déclinons toute responsabilité en cas de
                délai dépassé.
              </p>

              <p>
                <strong>Art. 3 - Risques de Transport</strong>
                <br />
                Les marchandises voyagent aux risques du destinataire. En cas
                d'avarie ou de perte, il appartient au client de faire les
                réserves nécessaires obligatoire sur le bordereau du
                transporteur. En cas de non-respect de cette obligation on ne
                peut pas se retourner contre le transporteur.
              </p>

              <p>
                <strong>Art. 4 - Acceptation des Conditions</strong>
                <br />
                Toute livraison implique l'acceptation des présentes conditions.
                Le transporteur livre à l'adresse indiquée sans monter les
                étages. Le client est responsable de vérifier et d'accepter les
                marchandises lors de la livraison.
              </p>

              <p>
                <strong>Art. 5 - Réclamations</strong>
                <br />
                Les réclamations concernant la qualité des marchandises doivent
                être formulées par écrit dans les huit jours suivant la
                livraison, par lettre recommandée avec accusé de réception.
              </p>

              <p>
                <strong>Art. 6 - Retours</strong>
                <br />
                Aucun retour de marchandises ne sera accepté sans notre accord
                écrit préalable. Cet accord n'implique aucune reconnaissance.
              </p>

              <p>
                <strong>Art. 7 - Tailles des Matelas</strong>
                <br />
                Les dimensions des matelas peuvent varier de +/- 5 cm en raison
                de la thermosensibilité des mousses viscoélastiques. Les tailles
                standards sont données à titre indicatif et ne constituent pas
                une obligation contractuelle. Les matelas sur mesure doivent
                inclure les spécifications exactes du cadre de lit.
              </p>

              <p>
                <strong>Art. 8 - Odeur des Matériaux</strong>
                <br />
                Les mousses viscoélastiques naturelles (à base d'huile de ricin)
                et les matériaux de conditionnement peuvent émettre une légère
                odeur qui disparaît après déballage. Cela ne constitue pas un
                défaut.
              </p>

              <p>
                <strong>Art. 9 - Règlements et Remises</strong>
                <br />
                Sauf accord express, aucun rabais ou escompte ne sera appliqué
                pour paiement comptant. La garantie couvre les mousses, mais pas
                les textiles et accessoires.
              </p>

              <p>
                <strong>Art. 10 - Paiement</strong>
                <br />
                Les factures sont payables par chèque, virement, carte bancaire
                ou espèce à réception.
              </p>

              <p>
                <strong>Art. 11 - Pénalités de Retard</strong>
                <br />
                En cas de non-paiement, une majoration de 10% avec un minimum de
                300 € sera appliquée, sans préjudice des intérêts de retard.
                Nous nous réservons le droit de résilier la vente sans
                sommation.
              </p>

              <p>
                <strong>Art. 12 - Exigibilité en Cas de Non-Paiement</strong>
                <br />
                Le non-paiement d'une échéance rend immédiatement exigible le
                solde de toutes les échéances à venir.
              </p>

              <p>
                <strong>Art. 13 - Livraison Incomplète ou Non-Conforme</strong>
                <br />
                En cas de livraison endommagée ou non conforme, mentionnez-le
                sur le bon de livraison et refusez le produit. Si l'erreur est
                constatée après le départ du transporteur, contactez-nous sous
                72h ouvrables.
              </p>

              <p>
                <strong>Art. 14 - Litiges</strong>
                <br />
                Tout litige sera de la compétence exclusive du Tribunal de
                Commerce de Perpignan ou du tribunal compétent du prestataire.
              </p>

              <p>
                <strong>Art. 15 - Horaires de Livraison</strong>
                <br />
                Les livraisons sont effectuées du lundi au vendredi (hors jours
                fériés). Une personne majeure doit être présente à l'adresse
                lors de la livraison. Toute modification d'adresse après
                commande doit être signalée immédiatement à
                myconfort66@gmail.com.
              </p>

              <p className='text-xs text-gray-500 mt-4 pt-3 border-t border-gray-300'>
                <em>
                  Les présentes Conditions générales ont été mises à jour le 23
                  août 2025
                </em>
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-4'>
            <input
              type='checkbox'
              id='terms'
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className='w-6 h-6 text-[#477A0C] bg-gray-100 border-2 border-gray-300 rounded focus:ring-[#477A0C] focus:ring-2'
            />
            <label
              htmlFor='terms'
              className='text-gray-700 font-semibold cursor-pointer'
            >
              J'accepte les conditions générales de vente MyConfort *
            </label>
          </div>
        </div>

        {/* Validation et statut */}
        <div
          className={`rounded-2xl p-6 ${isValid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3
                className={`text-lg font-semibold ${isValid ? 'text-green-800' : 'text-orange-800'}`}
              >
                {isValid ? '✅ Signature complète' : '⚠️ Signature incomplète'}
              </h3>
              <p
                className={`text-sm ${isValid ? 'text-green-600' : 'text-orange-600'}`}
              >
                {isValid
                  ? 'Toutes les informations sont remplies, vous pouvez continuer'
                  : 'Veuillez remplir tous les champs requis : conseiller, signature et acceptation des CGV'}
              </p>
            </div>
            {isValid && (
              <button
                onClick={onNext}
                className='bg-[#477A0C] hover:bg-[#5A8F0F] text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all transform hover:scale-105 shadow-lg'
              >
                Voir le Récapitulatif →
              </button>
            )}
          </div>
        </div>

        {/* Messages d'erreur spécifiques */}
        {!isValid && (
          <div className='bg-red-50 rounded-xl p-4 border border-red-200'>
            <div className='text-red-800 font-semibold mb-2'>
              Éléments manquants :
            </div>
            <ul className='text-red-600 text-sm space-y-1'>
              {!(advisorName || '').trim() && <li>• Nom du conseiller</li>}
              {!hasDrawn && <li>• Signature du client</li>}
              {!termsAccepted && (
                <li>• Acceptation des conditions générales</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
