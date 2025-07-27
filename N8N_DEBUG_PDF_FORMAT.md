# 🔍 DEBUG PDF - Vérification Format MyConfort

## 🚨 **PROBLÈME CONFIRMÉ**

Votre workflow fonctionne et vous recevez les emails, MAIS :
- ❌ **Le PDF reçu** ne correspond pas à l'aperçu de votre application
- ❌ **Les produits ne sont pas affichés** dans le PDF de l'email
- ❌ **Le format/design est différent**

## 🔍 **CODE DEBUG POUR N8N**

**Ajoutez ce code dans un nouveau node "Debug PDF" AVANT Code2 :**

```javascript
// 🔍 DEBUG COMPLET - ANALYSE DU PDF REÇU
console.log("=== DEBUG PDF APPLICATION MYCONFORT ===");
console.log("Toutes les clés reçues:", Object.keys($json));

// Recherche de tous les champs PDF possibles
const pdfFields = ['pdf_base64', 'pdfBase64', 'fichier_facture', 'pdf', 'base64'];
const foundPdfFields = [];

pdfFields.forEach(field => {
  if ($json[field]) {
    foundPdfFields.push({
      field: field,
      length: $json[field].length,
      preview: $json[field].substring(0, 50) + "..."
    });
  }
});

console.log("🔍 Champs PDF trouvés:", foundPdfFields);

// Analyse des données de produits
console.log("🛍️ ANALYSE DES PRODUITS:");
console.log("Items:", $json.items ? $json.items.length : "ABSENT");
console.log("Products:", $json.products ? $json.products.length : "ABSENT");

if ($json.items) {
  console.log("Détail items:", $json.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    price: item.unit_price
  })));
}

if ($json.products) {
  console.log("Détail products:", $json.products.map(product => ({
    name: product.name,
    quantity: product.quantity,
    price: product.unitPriceTTC
  })));
}

// Analyse des données client
console.log("👤 DONNÉES CLIENT:");
console.log("Nom:", $json.client_name || $json.clientName);
console.log("Email:", $json.client_email || $json.clientEmail);
console.log("Montant:", $json.amount || $json.totalTTC);

// Test de conversion PDF
const pdfData = $json.pdf_base64 || $json.pdfBase64;
if (pdfData) {
  try {
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    console.log("✅ PDF convertible - Taille:", pdfBuffer.length, "bytes");
    console.log("📊 Taille estimée:", Math.round(pdfBuffer.length / 1024), "KB");
  } catch (error) {
    console.error("❌ Erreur conversion PDF:", error.message);
  }
}

console.log("=== FIN DEBUG PDF ===");

// Passer les données au node suivant
return $input.all();
```

## 🧪 **TEST DE VÉRIFICATION**

1. **Ajoutez ce node debug** dans votre workflow N8N
2. **Envoyez une facture** depuis votre application  
3. **Consultez les logs** dans N8N pour voir :
   - ✅ Si le PDF est bien reçu
   - ✅ Si les produits sont dans les données
   - ✅ La taille et structure du PDF

## 🎯 **SOLUTION PROBABLE**

Si le debug montre que :
- ✅ **Le PDF est reçu** mais avec le mauvais contenu
- ❌ **Les produits sont absents** du PDF

Alors le problème est que **votre application n'envoie pas le bon PDF** ou **génère un PDF incomplet**.

## 🔧 **ACTIONS POSSIBLES**

### **Option 1: Vérifier l'application**
Testez dans votre application :
1. **Créez une facture complète** avec produits
2. **Regardez l'aperçu** (doit montrer les produits)
3. **Envoyez vers N8N** et vérifiez les logs debug

### **Option 2: Forcer la régénération**
Si l'application envoie un PDF incomplet, on peut forcer N8N à utiliser les données pour créer le bon PDF.

Les logs debug nous diront exactement où est le problème ! 🔍
