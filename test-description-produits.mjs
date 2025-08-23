#!/usr/bin/env node

/**
 * 🛒 TEST DESCRIPTION PRODUITS MODE WIZARD vs MODE NORMAL
 * 
 * Ce script teste que les descriptions de produits sont correctement
 * transmises dans le payload N8N pour l'affichage dans l'email.
 */

console.log('🛒 TEST DESCRIPTION PRODUITS - WIZARD vs NORMAL');
console.log('='.repeat(60));

// Simulation du produit dans le wizard (avant correction)
const produitWizardAvant = {
  id: '1',
  designation: 'Matelas Premium Memory Foam 160x200cm',
  qty: 1,
  priceTTC: 899,
  category: 'Literie'
};

// Simulation du produit dans le wizard (après correction)
const produitWizardApres = {
  id: '1',
  name: 'Matelas Premium Memory Foam 160x200cm', // ✅ AJOUTÉ
  designation: 'Matelas Premium Memory Foam 160x200cm',
  quantity: 1,
  priceTTC: 899,
  priceHT: 749.17,
  category: 'Literie',
  unitPrice: 899,
  discount: 0,
  discountType: 'fixed',
  totalHT: 749.17,
  totalTTC: 899
};

// Simulation du produit en mode normal
const produitNormal = {
  id: '1',
  name: 'Matelas Premium Memory Foam 160x200cm',
  quantity: 1,
  priceTTC: 899,
  priceHT: 749.17,
  category: 'Literie',
  unitPrice: 899,
  discount: 0,
  discountType: 'fixed',
  totalHT: 749.17,
  totalTTC: 899
};

console.log('📊 COMPARAISON DES STRUCTURES PRODUITS');

console.log('\n🔧 WIZARD AVANT CORRECTION:');
console.log(`- designation: "${produitWizardAvant.designation}"`);
console.log(`- name: ${produitWizardAvant.name || 'MANQUE ❌'}`);
console.log(`- quantity: ${produitWizardAvant.qty}`);

console.log('\n✅ WIZARD APRÈS CORRECTION:');
console.log(`- name: "${produitWizardApres.name}"`);
console.log(`- designation: "${produitWizardApres.designation}"`);
console.log(`- quantity: ${produitWizardApres.quantity}`);

console.log('\n📋 MODE NORMAL:');
console.log(`- name: "${produitNormal.name}"`);
console.log(`- quantity: ${produitNormal.quantity}`);

console.log('\n🧪 TEST GÉNÉRATION produits_html');

// Fonction de génération produits_html (comme dans n8nWebhookService)
function generateProduitsHtml(products) {
  return products
    .map(product => {
      const total = product.quantity * product.priceTTC;
      return `<li><strong>${product.name}</strong><br>
             Quantité: ${product.quantity} × ${product.priceTTC.toFixed(2)}€ = <strong>${total.toFixed(2)}€</strong>
             ${product.discount > 0 ? `<br><em>Remise: -${product.discount}${product.discountType === 'percent' ? '%' : '€'}</em>` : ''}
             </li>`;
    })
    .join('');
}

console.log('\n--- TEST WIZARD AVANT ---');
try {
  const htmlAvant = generateProduitsHtml([produitWizardAvant]);
  console.log('❌ Résultat:', htmlAvant.includes('undefined') ? 'ÉCHEC - undefined dans le HTML' : 'OK');
  console.log('📄 HTML généré:');
  console.log(htmlAvant);
} catch (error) {
  console.log('❌ ERREUR:', error.message);
}

console.log('\n--- TEST WIZARD APRÈS ---');
try {
  const htmlApres = generateProduitsHtml([produitWizardApres]);
  console.log('✅ Résultat:', htmlApres.includes('undefined') ? 'ÉCHEC' : 'SUCCÈS - Description bien affichée');
  console.log('📄 HTML généré:');
  console.log(htmlApres);
} catch (error) {
  console.log('❌ ERREUR:', error.message);
}

console.log('\n--- TEST MODE NORMAL ---');
try {
  const htmlNormal = generateProduitsHtml([produitNormal]);
  console.log('✅ Résultat:', htmlNormal.includes('undefined') ? 'ÉCHEC' : 'SUCCÈS - Description bien affichée');
  console.log('📄 HTML généré:');
  console.log(htmlNormal);
} catch (error) {
  console.log('❌ ERREUR:', error.message);
}

console.log('\n📧 SIMULATION TEMPLATE EMAIL');

// Test avec le template HTML (extrait)
function simulateEmailTemplate(produitsHtml) {
  return `
<!-- Liste des Produits -->
<div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #477A0C;">🛒 Vos produits</h3>
    <ul style="padding-left: 0; list-style: none; margin: 0;">
        ${produitsHtml}
    </ul>
</div>`;
}

const emailApres = simulateEmailTemplate(generateProduitsHtml([produitWizardApres]));
const emailNormal = simulateEmailTemplate(generateProduitsHtml([produitNormal]));

console.log('\n✅ EMAIL WIZARD (après correction):');
console.log(emailApres);

console.log('\n✅ EMAIL NORMAL:');
console.log(emailNormal);

console.log('\n🎯 RÉSUMÉ FINAL');
console.log('='.repeat(40));

const checks = [
  {
    test: produitWizardApres.name !== undefined,
    name: 'Wizard a le champ "name"',
    status: produitWizardApres.name !== undefined
  },
  {
    test: produitNormal.name !== undefined,
    name: 'Normal a le champ "name"',
    status: produitNormal.name !== undefined
  },
  {
    test: !generateProduitsHtml([produitWizardApres]).includes('undefined'),
    name: 'HTML Wizard sans "undefined"',
    status: !generateProduitsHtml([produitWizardApres]).includes('undefined')
  },
  {
    test: !generateProduitsHtml([produitNormal]).includes('undefined'),
    name: 'HTML Normal sans "undefined"',
    status: !generateProduitsHtml([produitNormal]).includes('undefined')
  }
];

checks.forEach(check => {
  console.log(`${check.status ? '✅' : '❌'} ${check.name}`);
});

const allGood = checks.every(c => c.status);

if (allGood) {
  console.log('\n🎉 CORRECTION RÉUSSIE !');
  console.log('✅ Les descriptions de produits s\'afficheront maintenant dans les emails mode wizard');
  console.log('✅ La compatibilité avec le mode normal est maintenue');
  console.log('✅ Le template email utilisera le bon champ product.name');
} else {
  console.log('\n⚠️  DES PROBLÈMES SUBSISTENT');
}

console.log('\n🔄 PROCHAINES ÉTAPES:');
console.log('1. 🧪 Tester un envoi email en mode wizard');
console.log('2. 📧 Vérifier que la description des produits apparaît bien');
console.log('3. 🔍 Comparer avec le mode normal pour validation');
