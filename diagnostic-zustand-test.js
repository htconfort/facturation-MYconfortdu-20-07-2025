// Test du store Zustand - diagnostic
console.log('🔍 === DIAGNOSTIC ZUSTAND STORE ===');

// Test d'import du store
import { useInvoiceWizard } from './src/store/useInvoiceWizard.js';

// Fonction de test du store
function testStore() {
    console.log('📋 Test du store useInvoiceWizard...');
    
    try {
        // Obtenir l'état actuel
        const store = useInvoiceWizard.getState();
        console.log('✅ Store accessible:', store);
        
        // Tester les fonctions clés
        console.log('🔧 Fonctions disponibles:', {
            setSignature: typeof store.setSignature,
            setTermsAccepted: typeof store.setTermsAccepted,
            signature: store.signature,
            termsAccepted: store.termsAccepted
        });
        
        // Test de setSignature
        if (typeof store.setSignature === 'function') {
            console.log('🖊️ Test setSignature...');
            store.setSignature({ 
                dataUrl: 'data:image/png;base64,test123', 
                timestamp: new Date().toISOString() 
            });
            console.log('✅ setSignature fonctionne, nouvelle signature:', store.signature);
        } else {
            console.error('❌ setSignature n\'est pas une fonction!');
        }
        
        // Test de setTermsAccepted
        if (typeof store.setTermsAccepted === 'function') {
            console.log('📋 Test setTermsAccepted...');
            store.setTermsAccepted(true);
            console.log('✅ setTermsAccepted fonctionne, termsAccepted:', store.termsAccepted);
        } else {
            console.error('❌ setTermsAccepted n\'est pas une fonction!');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du test du store:', error);
        return false;
    }
}

// Exécuter le test
if (typeof window !== 'undefined') {
    // En mode navigateur
    window.testZustandStore = testStore;
    console.log('🌐 Test disponible via: window.testZustandStore()');
} else {
    // En mode Node.js
    testStore();
}

export { testStore };
