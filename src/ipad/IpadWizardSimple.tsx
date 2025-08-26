import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoiceWizard, type WizardStep } from '../store/useInvoiceWizard';

export default function IpadWizardSimple() {
  const navigate = useNavigate();
  const { search } = useLocation();
  
  const urlStep = (new URLSearchParams(search).get('step') || 'facture') as WizardStep;
  const setStep = useInvoiceWizard(s => s.setStep);
  const step = useInvoiceWizard(s => s.step);
  const reset = useInvoiceWizard(s => s.reset);

  useEffect(() => {
    setStep(urlStep);
    
    if (urlStep === 'facture' && search.includes('step=facture')) {
      reset();
    }
  }, [urlStep, setStep, reset, search]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        ✅ Application iPad Fonctionnelle !
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Étape actuelle: <strong>{step}</strong>
      </p>
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '1rem', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <div>📅 Date: {new Date().toLocaleString()}</div>
        <div>🌐 URL: {window.location.href}</div>
        <div>⚡ Étape URL: {urlStep}</div>
        <div>⚡ Étape Store: {step}</div>
      </div>
      
      <button 
        onClick={() => navigate('/ipad?step=client')}
        style={{
          marginTop: '1rem',
          padding: '12px 24px',
          background: '#fff',
          color: '#333',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        ➡️ Tester Navigation
      </button>
    </div>
  );
}
