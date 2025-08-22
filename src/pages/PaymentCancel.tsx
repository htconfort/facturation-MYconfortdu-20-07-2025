import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInvoiceWizard } from '../store/useInvoiceWizard';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setPaymentStatus, setStep, setPaymentData } = useInvoiceWizard();
  const [countdown, setCountdown] = useState(15);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Update payment status
    setPaymentStatus('cancelled');
    setPaymentData({ 
      paymentError: 'Paiement annulé par l\'utilisateur' 
    });

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep('paiement');
          navigate('/ipad');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setPaymentStatus, setPaymentData, setStep, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        {/* Cancel Icon */}
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Cancel Message */}
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          ❌ Paiement Annulé
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Le paiement pour la commande <strong>#{orderId}</strong> a été annulé.
        </p>

        {/* Reassurance */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Pas de problème !</h3>
          <ul className="text-blue-700 space-y-2 text-left">
            <li>💡 Vos données ont été sauvegardées</li>
            <li>🔄 Vous pouvez réessayer le paiement</li>
            <li>💬 Ou choisir un autre mode de paiement</li>
          </ul>
        </div>

        {/* Auto redirect */}
        <p className="text-gray-500 mb-6">
          Retour au paiement dans <span className="font-bold text-red-600">{countdown}</span> secondes...
        </p>

        {/* Manual actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              setStep('paiement');
              navigate('/ipad');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            ← Retour au paiement
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
