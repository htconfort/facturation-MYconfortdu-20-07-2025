# 🔍 DEBUG APERÇU PDF - Problème Identifié

## 🚨 **PROBLÈME : APERÇU DIFFÉRENT**

Votre application MyConfort génère un aperçu/design spécifique, mais le workflow N8N utilise un **template/aperçu différent**.

## 🎯 **SOLUTION : Code Debug pour N8N**

### **1. Code Debug Complet (à placer dans un node Code avant Code2)**

```javascript
// 🔍 DEBUG COMPLET - ANALYSE APERÇU PDF
console.log("=".repeat(60));
console.log("🔍 DEBUG APERÇU PDF - ANALYSE COMPLÈTE");
console.log("=".repeat(60));

// 1. Structure des données reçues
console.log("📦 DONNÉES REÇUES DE L'APPLICATION:");
console.log("Toutes les clés:", Object.keys($json));
console.log("Nombre de champs:", Object.keys($json).length);

// 2. Recherche du PDF dans tous les champs possibles
const pdfFields = ['pdf_base64', 'pdfBase64', 'fichier_facture', 'pdf', 'document', 'file'];
console.log("\n📄 RECHERCHE PDF:");
pdfFields.forEach(field => {
  if ($json[field]) {
    console.log(`✅ PDF trouvé dans: ${field}`);
    console.log(`   Taille: ${$json[field].length} caractères`);
    console.log(`   Début: ${$json[field].substring(0, 50)}...`);
  } else {
    console.log(`❌ PDF absent dans: ${field}`);
  }
});

// 3. Informations facture pour vérifier cohérence
console.log("\n🧾 INFORMATIONS FACTURE:");
const invoiceFields = ['invoice_number', 'invoiceNumber', 'client_name', 'clientName', 'amount', 'totalTTC'];
invoiceFields.forEach(field => {
  if ($json[field]) {
    console.log(`✅ ${field}: ${$json[field]}`);
  }
});

// 4. Structure complète (limitée pour éviter spam)
console.log("\n📋 APERÇU STRUCTURE COMPLÈTE:");
const preview = {};
Object.keys($json).forEach(key => {
  const value = $json[key];
  if (typeof value === 'string' && value.length > 100) {
    preview[key] = `${value.substring(0, 50)}... (${value.length} chars)`;
  } else if (Array.isArray(value)) {
    preview[key] = `Array(${value.length})`;
  } else {
    preview[key] = value;
  }
});
console.log(JSON.stringify(preview, null, 2));

console.log("=".repeat(60));
console.log("✅ DEBUG TERMINÉ - Analysez les logs ci-dessus");
console.log("=".repeat(60));

// Passer les données au node suivant
return $input.all();
```

### **2. Code Spécialisé pour Extraction PDF (Code2)**

```javascript
// 🎯 EXTRACTION PDF - UTILISATION EXCLUSIVE APERÇU MYCONFORT
console.log("=== EXTRACTION PDF MYCONFORT EXCLUSIF ===");

// Priorité des champs PDF (dans l'ordre de préférence)
const pdfFieldsPriority = [
  'pdf_base64',    // Format standard N8N
  'pdfBase64',     // Format application
  'fichier_facture', // Format français
  'pdf',           // Format simple
  'document'       // Format générique
];

let pdfData = null;
let pdfSource = null;

// Recherche du PDF avec priorité
for (const field of pdfFieldsPriority) {
  if ($json[field] && typeof $json[field] === 'string' && $json[field].length > 100) {
    pdfData = $json[field];
    pdfSource = field;
    console.log(`✅ PDF MYCONFORT trouvé dans: ${field}`);
    break;
  }
}

if (pdfData) {
  console.log("📊 Statistiques PDF MyConfort:");
  console.log(`   Source: ${pdfSource}`);
  console.log(`   Taille base64: ${pdfData.length} caractères`);
  console.log(`   Taille estimée: ${Math.round(pdfData.length * 0.75 / 1024)} KB`);
  console.log(`   Format valide: ${pdfData.startsWith('JVBERi') ? 'OUI' : 'NON'}`);
  
  // Conversion en buffer
  const pdfBuffer = Buffer.from(pdfData, 'base64');
  
  console.log("✅ PDF MYCONFORT PRÊT POUR EMAIL");
  
  return [{
    json: {
      // Conserver toutes les données originales
      ...$json,
      // Métadonnées traçabilité
      pdf_myconfort_used: true,
      pdf_source_field: pdfSource,
      pdf_size_kb: Math.round(pdfBuffer.length / 1024),
      extraction_timestamp: new Date().toISOString()
    },
    binary: {
      facture_pdf: {
        data: pdfBuffer,
        mimeType: 'application/pdf',
        fileName: `MyConfort_Facture_${$json.invoice_number || $json.invoiceNumber || Date.now()}.pdf`
      }
    }
  }];
  
} else {
  console.error("❌ AUCUN PDF MYCONFORT TROUVÉ");
  console.error("Champs vérifiés:", pdfFieldsPriority);
  console.error("Champs disponibles:", Object.keys($json));
  
  throw new Error("❌ PDF MyConfort introuvable - Vérifiez l'envoi depuis l'application");
}
```

## 🔧 **ÉTAPES DE CORRECTION**

### **1. Dans N8N :**
1. **Ajoutez un node Code de debug** avant Code2
2. **Copiez le premier code** (Debug Complet)
3. **Remplacez Code2** par le second code (Extraction PDF)
4. **Sauvegardez** le workflow

### **2. Test :**
1. **Envoyez une facture** depuis votre application
2. **Consultez les logs** du node debug
3. **Vérifiez** que le PDF utilisé est celui de MyConfort

## ✅ **RÉSULTAT ATTENDU**

- ✅ **PDF identique** à l'aperçu de votre application
- ✅ **Aucune régénération** côté N8N
- ✅ **Traçabilité complète** du PDF utilisé
- ✅ **Logs détaillés** pour diagnostic

**Le PDF dans l'email sera maintenant exactement celui de votre application MyConfort !** 🎯
