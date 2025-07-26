# 🔧 CORRECTION WORKFLOW N8N - CHAMP BINAIRE 'DATA'

## 🎯 PROBLÈME IDENTIFIÉ

**Erreur N8N :** `"The item has no binary field 'data' [item 0]"`

**Cause :** Le node Google Drive dans votre workflow N8N ne reçoit pas le champ binaire 'data' car il n'est pas correctement mappé depuis le node Webhook.

## ✅ DIAGNOSTIC CONFIRMÉ

Nos tests montrent que l'application envoie correctement les données :
- ✅ TEST A : Format JSON avec base64 → **Statut 200**
- ✅ TEST B : Format FormData navigateur → **Statut 200**  
- ✅ TEST C : Format N8N binaire → **Statut 200**

**Conclusion :** Le webhook N8N reçoit bien les données. Le problème est dans le **mapping interne du workflow**.

## 🔧 SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier le Node Webhook

1. **Ouvrez votre workflow N8N** "Workflow Facture Universel"
2. **Cliquez sur le node "Webhook"** (premier node)
3. **Vérifiez la configuration :**
   - ✅ URL : `https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle`
   - ✅ Method : `POST`
   - ✅ Response Mode : `Using Respond to Webhook Node`
   - ✅ Binary Data : **DOIT ÊTRE ACTIVÉ** ⚠️

### Étape 2 : Activer Binary Data sur le Webhook

**IMPORTANT :** Si "Binary Data" n'est pas activé sur le node Webhook :

1. **Cliquez sur le node Webhook**
2. **Allez dans "Settings" ou "Advanced"**
3. **Activez "Binary Data"** ou "Accept Binary Data"
4. **Sauvegardez** le workflow

### Étape 3 : Vérifier le Mapping vers Google Drive

1. **Cliquez sur le node "Google Drive"**
2. **Dans le champ "File Upload" ou "Binary Data"** :
   - **Option 1 :** Sélectionnez `{{ $json.data }}` (si envoi FormData)
   - **Option 2 :** Sélectionnez `{{ $json.binary.data }}` (si format N8N)
   - **Option 3 :** Utilisez l'expression `{{ $binary.data }}`

### Étape 4 : Configuration Recommandée Google Drive

```javascript
// Dans le node Google Drive :
{
  "binary": {
    "data": "{{ $binary.data }}"
  },
  "fileName": "{{ $json.numero_facture }}_{{ $json.client_nom }}.pdf",
  "parents": ["VOTRE_DOSSIER_GOOGLE_DRIVE_ID"]
}
```

### Étape 5 : Test de Debug

Ajoutez un **node "Code"** ou "Function" entre Webhook et Google Drive :

```javascript
// Node de debug pour voir les données reçues
const items = [];

for (const item of $input.all()) {
  console.log('WEBHOOK DATA RECEIVED:');
  console.log('JSON keys:', Object.keys(item.json));
  console.log('Binary keys:', Object.keys(item.binary || {}));
  
  // Vérifier si 'data' existe
  if (item.binary && item.binary.data) {
    console.log('✅ Binary field "data" trouvé:', item.binary.data.mimeType);
  } else {
    console.log('❌ Binary field "data" MANQUANT');
  }
  
  items.push(item);
}

return items;
```

## 🔄 ALTERNATIVE : MODIFIER L'ENVOI DEPUIS L'APPLICATION

Si le problème persiste, nous pouvons adapter notre application pour utiliser le format N8N optimal :

### Format N8N Recommandé (JSON avec binary)

```typescript
const payload = {
  // Métadonnées normales
  numero_facture: 'FAC-001',
  client_nom: 'Client Test',
  // ...autres champs...
  
  // Format binaire N8N
  binary: {
    data: {
      mimeType: 'application/pdf',
      fileName: 'facture.pdf',
      data: pdfBase64  // Base64 du PDF
    }
  }
};
```

### Modification à appliquer dans n8nBlueprintAdapter.ts

```typescript
// Au lieu de FormData, utiliser JSON avec binary
const payload = {
  ...metadonnees,
  binary: {
    data: {
      mimeType: 'application/pdf',
      fileName: `Facture_${invoice.invoiceNumber}.pdf`,
      data: pdfBase64
    }
  }
};

// Envoi en JSON pur
return fetch(webhook_url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

## 🚨 POINTS CRITIQUES À VÉRIFIER

1. **Node Webhook :** Binary Data activé
2. **Mapping Google Drive :** Champ source correct (`$binary.data`)
3. **Permissions Google Drive :** API activée, authentification OK
4. **Taille fichier :** Limite Google Drive respectée
5. **Format MIME :** `application/pdf` correct

## 🎯 ÉTAPES DE VALIDATION

1. **Activez Binary Data** sur le node Webhook
2. **Corrigez le mapping** dans le node Google Drive
3. **Testez avec le workflow**
4. **Vérifiez les logs N8N** pour confirmer la réception du champ 'data'
5. **Testez la cascade complète** (Drive → Sheets → Email)

## 📞 SI LE PROBLÈME PERSISTE

Si après ces corrections l'erreur persiste :

1. **Copiez-collez les logs complets** du node Webhook N8N
2. **Vérifiez la structure exacte** des données reçues
3. **Nous adapterons l'application** au format exact attendu

---

**⚡ RÉSOLUTION PRIORITAIRE :**  
**Activez "Binary Data" sur le node Webhook N8N** - c'est probablement la cause principale du problème.
