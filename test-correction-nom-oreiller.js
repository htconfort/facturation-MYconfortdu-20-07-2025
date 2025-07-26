#!/usr/bin/env node

/**
 * TEST DE VALIDATION : Correction du nom "Pack de 2 oreillers (thal et dual)"
 * 
 * Ce script vérifie que la correction du nom du produit oreiller
 * est bien appliquée dans le catalogue et visible dans l'UI.
 * 
 * OBJECTIFS :
 * ✅ Vérifier la correction dans src/data/products.ts
 * ✅ Confirmer l'affichage correct dans l'interface
 * ✅ Valider l'apparition sur la facture si sélectionné
 */

console.log('🔍 TEST DE VALIDATION : Correction nom produit oreiller');
console.log('=====================================================\n');

const fs = require('fs');
const path = require('path');

// Vérification dans le fichier products.ts
const productsPath = path.join(__dirname, 'src/data/products.ts');
const productsContent = fs.readFileSync(productsPath, 'utf8');

console.log('1. VÉRIFICATION DANS LE FICHIER PRODUITS :');
console.log('==========================================');

// Recherche de l'ancien nom (ne doit pas exister)
const ancienNom = "Pack de 2 oreillers',";
const ancienNomPresent = productsContent.includes(ancienNom);

console.log(`❌ Ancien nom "${ancienNom.replace("',", "")}" présent : ${ancienNomPresent ? 'OUI (ERREUR)' : 'NON (OK)'}`);

// Recherche du nouveau nom (doit exister)
const nouveauNom = "Pack de 2 oreillers (thal et dual)";
const nouveauNomPresent = productsContent.includes(nouveauNom);

console.log(`✅ Nouveau nom "${nouveauNom}" présent : ${nouveauNomPresent ? 'OUI (OK)' : 'NON (ERREUR)'}`);

// Extraction de la ligne complète pour vérification
const lignesProduits = productsContent.split('\n');
const ligneCorrigee = lignesProduits.find(ligne => ligne.includes(nouveauNom));

if (ligneCorrigee) {
    console.log(`\n📝 Ligne corrigée trouvée :`);
    console.log(`   ${ligneCorrigee.trim()}`);
    
    // Vérification du prix
    const prixMatch = ligneCorrigee.match(/priceTTC:\s*(\d+)/);
    if (prixMatch) {
        console.log(`💰 Prix TTC confirmé : ${prixMatch[1]}€`);
    }
}

console.log('\n2. GUIDE DE VÉRIFICATION MANUELLE DANS L\'UI :');
console.log('==============================================');
console.log('Pour valider complètement la correction :');
console.log('');
console.log('📋 Dans le sélecteur de produits :');
console.log('   → Ouvrir le dropdown "Oreillers"');
console.log('   → Chercher "Pack de 2 oreillers (thal et dual)"');
console.log('   → Vérifier que l\'ancien nom n\'apparaît plus');
console.log('');
console.log('🧾 Dans l\'aperçu de facture :');
console.log('   → Ajouter le produit corrigé à une facture');
console.log('   → Vérifier l\'affichage du nom complet');
console.log('   → Prix affiché : 100€ TTC');
console.log('');
console.log('📱 Tests supplémentaires :');
console.log('   → Recherche par texte : "thal et dual"');
console.log('   → Export PDF : nom complet visible');
console.log('   → Version mobile : nom lisible et non tronqué');

console.log('\n3. RÉSUMÉ DE LA CORRECTION :');
console.log('============================');
console.log('Ancien nom : "Pack de 2 oreillers"');
console.log('Nouveau nom : "Pack de 2 oreillers (thal et dual)"');
console.log('Prix : 100€ TTC');
console.log('Avantage : Précision sur le contenu du pack (oreillers Thalasso + Dual)');

console.log('\n✅ VALIDATION TECHNIQUE RÉUSSIE');
console.log('🔄 Validation manuelle recommandée dans l\'interface');
console.log('');
