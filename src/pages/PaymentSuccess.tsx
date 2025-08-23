import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Auto-redirection après 5 secondes
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <div className='text-6xl mb-6'>✅</div>

        <h1 className='text-2xl font-bold text-green-800 mb-4'>
          Paiement réussi !
        </h1>

        <p className='text-gray-600 mb-6'>
          Votre paiement a été traité avec succès. Vous allez recevoir un email
          de confirmation.
        </p>

        <div className='space-y-4'>
          {searchParams.get('amount') && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='text-sm text-green-700'>Montant</div>
              <div className='text-xl font-bold text-green-800'>
                {searchParams.get('amount')} €
              </div>
            </div>
          )}

          {searchParams.get('transaction_id') && (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
              <div className='text-sm text-gray-600'>Transaction ID</div>
              <div className='text-sm font-mono text-gray-800'>
                {searchParams.get('transaction_id')}
              </div>
            </div>
          )}
        </div>

        <div className='mt-8 space-y-3'>
          <button
            onClick={() => navigate('/')}
            className='w-full bg-[#477A0C] hover:bg-[#3A6A0A] text-white font-semibold py-3 px-4 rounded-lg transition-colors'
          >
            Retour à l'accueil
          </button>

          <p className='text-xs text-gray-500'>
            Redirection automatique dans 5 secondes...
          </p>
        </div>
      </div>
    </div>
  );
}
