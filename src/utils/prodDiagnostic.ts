// Diagnostic pour identifier les problèmes en production
export const prodDiagnostic = () => {
  console.log('🔍 DIAGNOSTIC PRODUCTION');
  console.log('========================');
  
  // Variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('MODE:', import.meta.env.MODE);
  console.log('PROD:', import.meta.env.PROD);
  console.log('DEV:', import.meta.env.DEV);
  
  // Variables personnalisées
  console.log('🔗 N8N_WEBHOOK_URL:', import.meta.env.VITE_N8N_WEBHOOK_URL);
  console.log('📧 DEFAULT_EMAIL_FROM:', import.meta.env.VITE_DEFAULT_EMAIL_FROM);
  console.log('🏢 COMPANY_NAME:', import.meta.env.VITE_COMPANY_NAME);
  
  // Vérifications de base
  console.log('🌐 Location:', window.location.href);
  console.log('🖥️ UserAgent:', navigator.userAgent);
  console.log('📱 Screen:', `${screen.width}x${screen.height}`);
  
  // Test localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('💾 localStorage: OK');
  } catch (e) {
    console.error('💾 localStorage: ERREUR', e);
  }
  
  // Test IndexedDB
  try {
    if ('indexedDB' in window) {
      console.log('🗄️ IndexedDB: Disponible');
    } else {
      console.log('🗄️ IndexedDB: Non disponible');
    }
  } catch (e) {
    console.error('🗄️ IndexedDB: ERREUR', e);
  }
  
  console.log('========================');
};
