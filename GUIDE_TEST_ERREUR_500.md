# 🔧 GUIDE DE TEST - RÉSOLUTION ERREUR 500 N8N

## 🎯 **PROBLÈMES IDENTIFIÉS**

1. **Validation échouée** - Facture incomplète (champs manquants)
2. **Erreur 500 N8N** - Le workflow reçoit les données mais erreur de traitement
3. **Workflow actif** - Pas d'erreur 404, donc le webhook est enregistré

## 🧪 **TESTS À EFFECTUER (dans l'ordre)**

### **Étape 1: Créer une facture complète**

1. **Ouvrez l'application** : http://localhost:5173
2. **Remplissez TOUS les champs obligatoires** :
   - ✅ Nom, email, téléphone client
   - ✅ **Adresse complète** (rue, ville, code postal)
   - ✅ **Au moins 1 produit**
   - ✅ **Méthode de paiement**
   - ✅ Signature

### **Étape 2: Tests de diagnostic**

1. **Cliquez sur "Debug"** dans l'en-tête
2. **Dans le DebugCenter, testez dans l'ordre** :
   - 🟡 **"Diagnostic 500"** → Pour comprendre l'erreur N8N
   - 🔵 **"Test Connection"** → Après avoir créé une facture complète
   - 🟠 **"Test Simple"** → Avec données simplifiées

### **Étape 3: Console JavaScript** (optionnel)

Si vous voulez tester avec des données parfaites :

```javascript
// 1. Copiez-collez dans la console du navigateur
const testInvoice = {
  invoiceNumber: "TEST-2025-001",
  invoiceDate: "2025-07-27",
  eventLocation: "lyon",
  clientName: "Jean Dupont",
  clientEmail: "jean.dupont@test.com", 
  clientPhone: "0123456789",
  clientAddress: "123 Rue de la Paix",
  clientCity: "Lyon",
  clientPostalCode: "69000",
  clientHousingType: "Maison",
  clientDoorCode: "A1234",
  clientSiret: "",
  advisorName: "Marie Martin",
  products: [{
    name: "Matelas Test",
    category: "Matelas",
    quantity: 1,
    unitPriceHT: 400,
    unitPriceTTC: 480,
    discount: 0,
    discountType: "percentage",
    totalTTC: 480
  }],
  totalHT: 400,
  totalTTC: 480,
  totalTVA: 80,
  taxRate: 20,
  paymentMethod: "Carte bancaire",
  depositAmount: 200,
  remainingAmount: 280,
  deliveryMethod: "Livraison standard",
  deliveryNotes: "",
  invoiceNotes: "",
  termsAccepted: true,
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
};

// 2. Testez avec cette facture
N8nWebhookService.testSimplifiedPayload(testInvoice);
```

## 📊 **LOGS À SURVEILLER**

### **Console navigateur :**
- 🔍 Logs de validation du payload
- 📦 Taille du payload généré
- 📥 Réponse détaillée de N8N

### **Terminal serveur :**
- 🔄 Logs du proxy Vite
- 📊 Status codes des réponses

## ⚠️ **ERREURS POSSIBLES & SOLUTIONS**

| Erreur | Cause | Solution |
|--------|-------|----------|
| Validation échouée | Champs manquants | Remplir tous les champs obligatoires |
| 404 N8N | Workflow inactif | Activer le workflow dans N8N |
| 500 N8N | Format payload incorrect | Utiliser "Diagnostic 500" |
| CORS | Test direct en dev | Utiliser le proxy (boutons normaux) |

## 🎯 **OBJECTIF**

Faire en sorte que **"Test Connection"** retourne **✅ Success** avec une facture complète.

---

**Testez maintenant et rapportez les résultats !**
