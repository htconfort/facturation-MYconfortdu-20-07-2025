// Test minimal d'IpadWizard
export default function IpadWizardTest() {
  console.log('🚀 IpadWizardTest chargé');
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        ✅ IpadWizard Fonctionne !
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        L'application React se charge correctement
      </p>
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '1rem', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <div>📅 Date: {new Date().toLocaleString()}</div>
        <div>🌐 URL: {window.location.href}</div>
        <div>⚡ Port: 5173</div>
      </div>
      
      <button 
        onClick={() => {
          console.log('🔄 Redirection vers IpadWizard complet...');
          window.location.href = '/ipad?restored=true';
        }}
        style={{
          marginTop: '2rem',
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
        🔄 Restaurer IpadWizard Complet
      </button>
    </div>
  );
}
