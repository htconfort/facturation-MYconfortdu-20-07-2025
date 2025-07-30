/**
 * 🧪 TEST ROBUSTESSE NUMÉROTATION FACTURES
 * 
 * Ce script teste la nouvelle approche avec ID de session
 * pour éviter la génération multiple de numéros de facture.
 */

// Reset initial
console.log('🔄 DÉBUT DU TEST - Reset de la numérotation');
localStorage.setItem('lastInvoiceNumber', '2025-000');

// Simulation du cache de session (pour le test en browser uniquement)
let sessionInvoiceNumbers = new Map();
let lastGeneratedTimestamp = 0;

function generateInvoiceNumber(sessionId) {
  const now = Date.now();
  const year = new Date().getFullYear();
  
  // Si un sessionId est fourni, vérifier le cache de session
  if (sessionId && sessionInvoiceNumbers.has(sessionId)) {
    const cachedNumber = sessionInvoiceNumbers.get(sessionId);
    console.log(`🔒 Réutilisation numéro de session [${sessionId}]: ${cachedNumber}`);
    return cachedNumber;
  }
  
  // Protection temporelle renforcée (5 secondes entre les générations)
  if (!sessionId && (now - lastGeneratedTimestamp) < 5000) {
    console.log('⚠️ Génération bloquée - trop rapide après la précédente');
    return getNextInvoiceNumber();
  }
  
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    const newNumber = `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    
    // ✅ ATOMIC: Sauvegarder seulement si c'est une vraie génération
    localStorage.setItem('lastInvoiceNumber', newNumber);
    lastGeneratedTimestamp = now;
    
    // Sauvegarder dans le cache de session si ID fourni
    if (sessionId) {
      sessionInvoiceNumbers.set(sessionId, newNumber);
    }
    
    console.log(`🔢 Génération facture [${sessionId || 'direct'}]: ${lastInvoiceNumber} → ${newNumber}`);
    return newNumber;
  } catch (error) {
    const fallbackNumber = `${year}-001`;
    localStorage.setItem('lastInvoiceNumber', fallbackNumber);
    lastGeneratedTimestamp = now;
    
    if (sessionId) {
      sessionInvoiceNumbers.set(sessionId, fallbackNumber);
    }
    
    console.log(`🔢 Fallback génération facture [${sessionId || 'direct'}]: ${fallbackNumber}`);
    return fallbackNumber;
  }
}

function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    return `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (error) {
    return `${year}-001`;
  }
}

// 🧪 TEST 1: Appels multiples SANS sessionId (doit être protégé)
console.log('\n🧪 TEST 1: Appels multiples sans sessionId');
const result1a = generateInvoiceNumber();
const result1b = generateInvoiceNumber(); // Doit être bloqué
const result1c = generateInvoiceNumber(); // Doit être bloqué

console.log('Résultats sans sessionId:', { result1a, result1b, result1c });

// 🧪 TEST 2: Appels multiples AVEC le même sessionId (doit réutiliser)
console.log('\n🧪 TEST 2: Appels multiples avec le même sessionId');
const sessionId1 = 'session-test-1';
const result2a = generateInvoiceNumber(sessionId1);
const result2b = generateInvoiceNumber(sessionId1); // Doit réutiliser
const result2c = generateInvoiceNumber(sessionId1); // Doit réutiliser

console.log('Résultats avec même sessionId:', { result2a, result2b, result2c });

// 🧪 TEST 3: Sessions différentes (doit incrémenter)
console.log('\n🧪 TEST 3: Sessions différentes');
const sessionId2 = 'session-test-2';
const sessionId3 = 'session-test-3';

// Attendre pour contourner la protection temporelle
setTimeout(() => {
  const result3a = generateInvoiceNumber(sessionId2);
  
  setTimeout(() => {
    const result3b = generateInvoiceNumber(sessionId3);
    console.log('Résultats sessions différentes:', { result3a, result3b });
    
    // 🧪 TEST 4: État final
    console.log('\n📊 ÉTAT FINAL:');
    console.log('LocalStorage:', localStorage.getItem('lastInvoiceNumber'));
    console.log('Cache sessions:', Array.from(sessionInvoiceNumbers.entries()));
    console.log('Prochain numéro (sans incrémenter):', getNextInvoiceNumber());
    
  }, 100);
}, 6000); // Attendre 6 secondes pour contourner la protection de 5s

console.log('\n✅ Tests programmés. Vérifiez les résultats dans 10 secondes...');
