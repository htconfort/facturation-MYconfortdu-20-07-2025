// Test rapide du diagnostic N8N 500 depuis la console
console.log('🔬 Lancement du diagnostic N8N Error 500');

// Vérifier si le service est disponible
if (typeof N8nWebhookService !== 'undefined') {
  // Tester directement la méthode de diagnostic
  N8nWebhookService.diagnoseN8nError500()
    .then(result => {
      console.log('📊 RÉSULTAT DIAGNOSTIC COMPLET:', result);
      
      console.log('\n📋 RÉSUMÉ DIAGNOSTIC:');
      console.log('Success:', result.success);
      console.log('Message:', result.message);
      
      console.log('\n🧪 DÉTAIL DES TESTS:');
      result.diagnostics.forEach((diagnostic, index) => {
        console.log(`\nTest ${index + 1}: ${diagnostic.test}`);
        if (diagnostic.status) {
          console.log(`  Status: ${diagnostic.status}`);
          console.log(`  Response: ${diagnostic.response}`);
        }
        if (diagnostic.error) {
          console.log(`  Error: ${diagnostic.error}`);
        }
      });
      
      // Analyser les patterns
      const statuses = result.diagnostics.map(d => d.status).filter(s => s);
      const uniqueStatuses = [...new Set(statuses)];
      
      console.log('\n📈 ANALYSE:');
      console.log('Status codes reçus:', uniqueStatuses);
      
      if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 500) {
        console.log('🔍 CONCLUSION: Tous les tests donnent 500 -> Problème dans le workflow N8N lui-même');
        console.log('💡 SOLUTION: Vérifier la configuration du workflow dans N8N');
      } else if (uniqueStatuses.includes(200)) {
        console.log('🔍 CONCLUSION: Certains tests réussissent -> Problème de format de données');
        console.log('💡 SOLUTION: Ajuster le format du payload selon les tests qui marchent');
      } else {
        console.log('🔍 CONCLUSION: Pattern mixte, nécessite une analyse plus poussée');
      }
    })
    .catch(error => {
      console.error('❌ Erreur lors du diagnostic:', error);
    });
} else {
  console.warn('⚠️ N8nWebhookService non disponible. Assurez-vous d\'être sur la page de l\'application.');
  console.log('💡 Pour utiliser ce script:');
  console.log('1. Ouvrez http://localhost:5174');
  console.log('2. Collez ce script dans la console');
  console.log('3. Pressez Entrée');
}
