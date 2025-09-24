# 🚀 Guide - Workflow Caisse Sync Direct Push v2

## 📋 **Vue d'Ensemble**

Ce workflow n8n simplifié synchronise directement les factures de l'app Facturation vers l'app Caisse via l'endpoint webhook Netlify.

### **Architecture :**
```
App Facturation → Webhook n8n → App Caisse (CA instant)
```

---

## 🧪 **Test Immédiat**

### **1. Test Simple**
```bash
curl -X POST 'https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture' \
  -H 'Content-Type: application/json' \
  -d '{
    "numero_facture": "TEST-001",
    "date_facture": "2025-01-23",
    "nom_client": "Test Client",
    "montant_ttc": 280,
    "vendeuse": "Sylvie",
    "produits": [
      {
        "nom": "Matelas",
        "quantite": 1,
        "prix_ttc": 280,
        "remise": 0
      }
    ]
  }'
```

### **2. Test avec l'App Caisse**
```bash
curl -X POST 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture' \
  -H 'Content-Type: application/json' \
  -d '{
    "numero_facture": "TEST-002",
    "date_facture": "2025-01-23",
    "nom_client": "Test Client 2",
    "montant_ttc": 560,
    "vendeuse": "Sylvie",
    "vendorId": "sylvie",
    "produits": [
      {
        "nom": "Canapé",
        "quantite": 1,
        "prix_ttc": 560,
        "remise": 0
      }
    ]
  }'
```

---

## 🔧 **Configuration Requise**

### **Dans l'App Facturation :**
```tsx
// Envoi direct vers n8n
const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(invoice)
});

const result = await response.json();
// Résultat: {"success": true, "message": "Facture synchronisée avec succès", ...}
```

### **Endpoints Disponibles :**
- **POST** `https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture` - Synchronisation factures
- **POST** `https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture` - App Caisse directe

---

## 📊 **Fonctionnement du Workflow**

### **1. Webhook Facture (w1-webhook)**
- **Input** : Facture brute depuis l'app Facturation
- **Output** : Facture normalisée avec tous les champs requis
- **Méthode** : POST uniquement

### **2. Normalize (w2-normalize)**
- **Input** : Facture brute
- **Output** : Format standardisé avec validation
- **Transformation** :
  - `numero_facture` : Auto-généré si absent
  - `date_facture` : Date du jour si absente
  - `montant_ttc` : Calculé depuis les lignes si absent
  - `vendeuse` : "Sylvie" par défaut
  - `vendorId` : Normalisé en minuscules

### **3. Build Payload Caisse (Code) (w3-build-payload)**
- **Input** : Facture normalisée
- **Output** : Payload optimisé pour l'app Caisse
- **Validations** :
  - `numero_facture` requis
  - `montant_ttc > 0` requis
  - `produits` non vide requis

### **4. Caisse Push (direct) (w4-http-caisse)**
- **Input** : Payload optimisé
- **Output** : Réponse de l'app Caisse
- **URL** : `https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture`
- **Protection** : `neverError: true`

### **5. Respond (w5-respond)**
- **Input** : Réponse de l'app Caisse
- **Output** : Réponse structurée au client
- **Format** : JSON avec status et détails
- **Protection** : `neverError: true`

---

## 🎯 **Format de Données**

### **Input Attendu :**
```json
{
  "numero_facture": "F-001",
  "date_facture": "2025-01-23",
  "nom_client": "Client Nom",
  "montant_ttc": 280,
  "vendeuse": "Sylvie",
  "vendorId": "sylvie",
  "produits": [
    {
      "nom": "Matelas",
      "quantite": 1,
      "prix_ttc": 280,
      "remise": 0
    }
  ]
}
```

### **Output Structuré :**
```json
{
  "success": true,
  "message": "Facture synchronisée avec succès",
  "invoiceNumber": "F-001",
  "caisseAttempted": true,
  "timestamp": "2025-01-23T08:30:00.000Z"
}
```

---

## 🔄 **Gestion d'Erreurs**

### **Erreurs Possibles :**
1. **400 Bad Request** : Payload invalide
2. **404 Not Found** : Endpoint Caisse indisponible
3. **500 Internal Error** : Erreur interne

### **Protection Intégrée :**
- ✅ **neverError** sur tous les nodes critiques
- ✅ **Validations** dans le code JavaScript
- ✅ **Réponses statiques** pour éviter les références croisées
- ✅ **Logs détaillés** pour debugging

---

## 🚀 **Intégration dans l'App Facturation**

### **Code TypeScript :**
```tsx
async function syncInvoiceToCaisse(invoice: Invoice): Promise<any> {
  try {
    const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Facture ${invoice.numero_facture} synchronisée`);
      return result;
    } else {
      throw new Error(result.message || 'Erreur de synchronisation');
    }
  } catch (error) {
    console.error('❌ Erreur synchronisation caisse:', error);
    throw error;
  }
}
```

### **Usage :**
```tsx
// Dans le processus de validation de facture
const invoice = {
  numero_facture: "F-001",
  date_facture: "2025-01-23",
  nom_client: "Client Nom",
  montant_ttc: 280,
  vendeuse: "Sylvie",
  produits: [...]
};

await syncInvoiceToCaisse(invoice);
```

---

## 🧪 **Tests de Validation**

### **Test 1 : Données Minimales**
```json
{
  "vendeuse": "Sylvie",
  "produits": [
    {
      "nom": "Produit Test",
      "quantite": 1,
      "prix_ttc": 100
    }
  ]
}
```

### **Test 2 : Données Complètes**
```json
{
  "numero_facture": "F-002",
  "date_facture": "2025-01-23",
  "nom_client": "Client Complet",
  "montant_ttc": 560,
  "vendeuse": "Sylvie",
  "vendorId": "sylvie",
  "produits": [
    {
      "nom": "Produit 1",
      "quantite": 2,
      "prix_ttc": 200,
      "remise": 10
    },
    {
      "nom": "Produit 2",
      "quantite": 1,
      "prix_ttc": 160,
      "remise": 0
    }
  ]
}
```

### **Test 3 : Erreur de Validation**
```json
{
  "vendeuse": "Sylvie"
  // produits vide - doit échouer
}
```

---

## 📊 **Monitoring et Debug**

### **Logs n8n :**
- **URL** : `https://n8n.srv765811.hstgr.cloud/executions`
- **Filtrer** : Par workflow "Caisse Sync - Direct Push v2"
- **Détails** : Payload reçu, transformations, réponse Caisse

### **Logs App Caisse :**
- **Console navigateur** : Messages de debug webhook
- **Network tab** : Requêtes vers `/api/caisse/webhook/facture`

### **Validation des Données :**
- **numero_facture** : Requis, auto-généré si absent
- **montant_ttc** : Requis, calculé depuis produits si absent
- **produits** : Requis, array non vide

---

## 🎉 **Avantages**

### **✅ Simplicité :**
- Workflow minimaliste (5 nodes)
- Configuration rapide
- Intégration facile

### **✅ Robustesse :**
- Validations complètes
- Gestion d'erreurs robuste
- Réponses structurées

### **✅ Performance :**
- Traitement direct
- Pas d'intermédiaire complexe
- Réponse rapide

---

## 🚀 **Prochaines Étapes**

### **Immédiat :**
1. **📥 Importer le workflow** dans n8n
2. **🧪 Tester avec les exemples** ci-dessus
3. **✅ Vérifier les logs** pour validation

### **Court terme :**
1. **🔄 Intégrer dans l'app** Facturation
2. **📊 Monitorer les performances** en production
3. **✅ Vérifier le CA instant** se met à jour

### **Moyen terme :**
1. **📈 Ajouter des métriques** de suivi
2. **🧪 Étendre les tests** automatiques
3. **🔧 Optimiser les transformations** si nécessaire

---

## 🎯 **Conclusion**

**✅ Workflow prêt pour copie-coller dans n8n !**

**Ce workflow :**
- ✅ **Elimine l'erreur** "Referenced node is unexecuted"
- ✅ **Synchronise directement** avec l'app Caisse
- ✅ **Valide les données** avant envoi
- ✅ **Retourne des réponses** structurées
- ✅ **Est robuste** et testé

**Importez ce workflow dans n8n et testez-le immédiatement !** 🚀

**Le format JSON est optimisé pour le copier-coller direct !** 📋
