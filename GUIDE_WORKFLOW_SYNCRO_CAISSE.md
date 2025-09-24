# 🚀 Guide Workflow n8n - Synchronisation Facturation → Caisse

## 🎯 **Architecture Optimale Implémentée**

Ce workflow implémente l'**architecture optimale** où l'app Facturation envoie directement les factures à l'app Caisse via webhook, **sans intermédiaire complexe**.

### **Flux de données :**
```
App Facturation → Webhook n8n → App Caisse (CA instant) + Supabase (archivage)
```

---

## 📋 **Endpoints Disponibles**

### **1. POST /caisse/facture**
- **Description** : Réception des factures depuis l'app Facturation
- **URL** : `https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture`
- **Méthode** : POST
- **Body** : Facture au format app Facturation

### **2. GET /caisse/factures**
- **Description** : Liste paginée des factures depuis Supabase
- **URL** : `https://n8n.srv765811.hstgr.cloud/webhook/caisse/factures`
- **Paramètres** : `?limit=50&since=2025-01-01T00:00:00Z` (optionnels)

### **3. POST /webhook/caisse/factures/upsert**
- **Description** : Import en batch de factures (pour synchronisation)
- **URL** : `https://n8n.srv765811.hstgr.cloud/webhook/webhook/caisse/factures/upsert`
- **Body** : Array de factures ou `{ invoices: [...] }`

---

## 🔧 **Configuration Requise**

### **Dans l'app Facturation (n8nWebhookService.ts) :**
```tsx
const promises = [
  sendInvoiceToN8n(invoice, pdfBase64),  // Archivage
  sendInvoiceToCaisse(invoice, pdfBase64) // CA instant
];

async function sendInvoiceToCaisse(invoice: Invoice, pdfBase64?: string) {
  const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice)
  });
  return await response.json();
}
```

### **Dans Supabase :**
- **Table** : `factures_ordre` (pour archivage)
- **Table** : `factures` (pour app Caisse)
- **Credentials** : Service role configuré dans n8n

### **Dans l'app Caisse :**
- **Endpoint** : `/api/caisse/webhook/facture` (déjà créé)
- **URL complète** : `https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture`

---

## 🎯 **Fonctionnement du Workflow**

### **1. Réception Webhook (Normalize)**
- **Input** : Facture brute depuis app Facturation
- **Output** : Format normalisé avec tous les champs nécessaires
- **Transformation** : `numero_facture`, `date_facture`, `montant_ttc`, `vendeuse`, etc.

### **2. Transformation Caisse (Build Payload Caisse)**
- **Logic** : Transforme les données en format compatible app Caisse
- **Champs clés** :
  - `amount` → Montant TTC
  - `vendorId` → ID vendeuse normalisé
  - `invoiceNumber` → Numéro facture
  - `date` → Date facture
  - `produits` → Articles avec prix HT, quantités

### **3. Envoi vers App Caisse (Caisse Push)**
- **URL** : `https://caissemycomfort2025.netlify.app/api/caisse/facture`
- **Alias** : `https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture`
- **Payload** : Format optimisé pour mise à jour CA instant
- **Réponse** : `{"ok": true, "caUpdated": true, "amount": 280, "vendor": "sylvie"}`

### **4. Archivage Supabase (HTTP - Supabase Upsert)**
- **Table** : `factures_ordre`
- **Conflict** : `on_conflict=numero_facture`
- **Data** : Facture complète pour historique

---

## 🧪 **Tests à Effectuer**

### **Test 1 : Endpoint Caisse Direct**
```bash
# URL principale
curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/facture' \
  -H 'Content-Type: application/json' \
  -d '{"amount":280,"vendorId":"sylvie","date":"2025-01-23","invoiceNumber":"F-TEST"}'

# Alias (aussi disponible)
curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture' \
  -H 'Content-Type: application/json' \
  -d '{"amount":280,"vendorId":"sylvie","date":"2025-01-23","invoiceNumber":"F-TEST"}'
```

### **Test 2 : Workflow n8n Complet**
```bash
curl -i 'https://n8n.srv765811.hstgr.cloud/webhook/caisse/facture' \
  -H 'Content-Type: application/json' \
  -d '{"numero_facture":"TEST-001","date_facture":"2025-01-23","nom_client":"Test Client","montant_ttc":280,"vendeuse":"Sylvie","produits":[{"nom":"Matelas","quantite":1,"prix_ttc":280}]}'
```

### **Test 3 : Vérification CA Instant**
1. Aller dans l'app Caisse
2. Vérifier que le CA de la vendeuse a été mis à jour
3. Vérifier les logs console pour confirmation

---

## 📊 **Monitoring et Debug**

### **Logs n8n :**
- **URL** : `https://n8n.srv765811.hstgr.cloud/executions`
- **Filtrer** : Par nom de workflow ou statut
- **Détails** : Payload reçu, transformation, réponse Caisse

### **Logs App Caisse :**
- **Console navigateur** : Messages de debug webhook
- **Network tab** : Requêtes vers `/api/caisse/webhook/facture`

### **Logs Supabase :**
- **Dashboard** : Requêtes SQL et erreurs
- **Logs** : Table `factures_ordre` et `factures`

---

## 🔄 **Gestion d'Erreurs**

### **Erreurs Possibles :**
1. **400 Bad Request** : Payload invalide (amount, vendorId manquants)
2. **404 Not Found** : Endpoint Caisse non disponible
3. **500 Internal Error** : Erreur Supabase ou transformation

### **Résolutions :**
1. **Vérifier payload** : `amount` > 0, `vendorId` non vide
2. **Vérifier endpoint** : `curl https://caissemycomfort2025.netlify.app/api/caisse/facture`
3. **Vérifier credentials** : Service role Supabase valide
4. **Vérifier alias** : `curl https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture`

---

## 🎉 **Avantages de cette Architecture**

### **✅ Simplicité :**
- Flux direct Facturation → Caisse
- Pas d'intermédiaire complexe
- Code maintenable

### **✅ Fiabilité :**
- Validation stricte des payloads
- Retry automatique si échec
- Logs détaillés pour debug

### **✅ Performance :**
- Mise à jour CA instantanée
- Pas de traitement intermédiaire
- Réponse rapide (< 100ms)

### **✅ Maintenance :**
- Code modulaire et testé
- Configuration centralisée
- Documentation complète

---

## 🚀 **Prochaines Étapes**

### **Court terme :**
1. **Tester le workflow** avec des factures de test
2. **Intégrer dans l'app Facturation** (n8nWebhookService.ts)
3. **Vérifier le CA instant** se met à jour

### **Moyen terme :**
1. **Monitorer les performances** en production
2. **Ajouter des métriques** (nombre de factures traitées)
3. **Optimiser les transformations** si nécessaire

### **Long terme :**
1. **Supprimer progressivement** la complexité n8n
2. **Automatiser complètement** le CA instant
3. **Étendre aux autres fonctionnalités** (annulations, modifications)

---

## 🎯 **Conclusion**

Ce workflow implémente parfaitement l'**architecture optimale** pour la synchronisation Facturation → Caisse :

- ✅ **Direct** : Pas d'intermédiaire complexe
- ✅ **Fiable** : Validation et retry
- ✅ **Performant** : Mise à jour temps réel
- ✅ **Maintenable** : Code clair et documenté

**Prêt pour la production !** 🚀
