# 🚨 RÉSOLUTION ERREUR RÉSEAU - ENVOI EMAIL NETLIFY

## ❌ PROBLÈME

Erreur de réseau lors de l'envoi d'email sur Netlify :
- "Failed to fetch"
- "Network error"
- "CORS error"
- "Connection refused"

## 🔍 DIAGNOSTIC

L'erreur survient car l'application tente d'accéder directement au serveur N8N depuis le navigateur, ce qui est bloqué par les politiques CORS.

## ✅ SOLUTION APPLIQUÉE

### 1️⃣ Création du système de proxy automatique

**Fichier créé** : `src/utils/webhookUrlHelper.ts`
- Détecte automatiquement l'environnement (dev vs prod)
- Utilise le proxy Netlify `/api/n8n/*` en production
- Utilise l'URL directe en développement

### 2️⃣ Configuration proxy Netlify améliorée

**Dans `netlify.toml`** :
```toml
[[redirects]]
  from = "/api/n8n/*"
  to = "https://n8n.srv765811.hstgr.cloud/:splat"
  status = 200
  force = true
  headers = {
    Access-Control-Allow-Origin = "*",
    Access-Control-Allow-Methods = "GET,POST,PUT,DELETE,OPTIONS", 
    Access-Control-Allow-Headers = "Content-Type,Authorization"
  }
```

### 3️⃣ Modification service N8N

**Avant** :
```typescript
private static readonly WEBHOOK_URL = 'https://n8n.srv765811.hstgr.cloud/webhook/...'
```

**Après** :
```typescript
private static get WEBHOOK_URL() {
  return WebhookUrlHelper.getWebhookUrl('webhook/facture-universelle');
}
```

## 🔄 REDÉPLOIEMENT NÉCESSAIRE

Après ces modifications :
1. **Commit** et **push** des changements
2. **Redéploiement automatique** Netlify
3. **Test** de l'envoi d'email

## 🧪 TESTS DE VALIDATION

### Test 1 : Vérification du proxy
1. Ouvrir la console développeur (F12)
2. Créer une facture et tenter l'envoi
3. Vérifier dans l'onglet Network :
   - URL utilisée : `/api/n8n/webhook/facture-universelle`
   - Status : 200 (au lieu d'erreur CORS)

### Test 2 : Envoi email complet
1. Créer une facture complète
2. Cliquer "Envoyer par email"
3. Vérifier :
   - ✅ Pas d'erreur réseau
   - ✅ Message de succès
   - ✅ Email reçu avec PDF

### Test 3 : Debug des URL
Console développeur :
```javascript
// Voir les URLs utilisées
console.log('Environment:', import.meta.env.PROD ? 'production' : 'development');
// En production, doit afficher /api/n8n/webhook/facture-universelle
```

## 🔧 DÉPANNAGE AVANCÉ

### Si l'erreur persiste :

1. **Vérifier le redéploiement** :
   - Netlify Dashboard → Deploys
   - S'assurer que le dernier commit est déployé

2. **Tester le proxy manuellement** :
   ```bash
   curl -X POST https://votre-site.netlify.app/api/n8n/webhook/facture-universelle \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **Vérifier les logs Netlify** :
   - Netlify Dashboard → Functions → View logs
   - Chercher les erreurs de proxy

4. **Headers CORS manquants** :
   - Vérifier que tous les headers sont présents
   - Redéployer si nécessaire

### Si le développement local ne fonctionne plus :

Le code est conçu pour utiliser l'URL directe en développement, donc cela ne devrait pas affecter le local.

## 📊 FLUX DE REDIRECTION

```
🌐 Netlify Production:
App → /api/n8n/webhook/facture-universelle → n8n.srv765811.hstgr.cloud

💻 Local Development:
App → https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
```

## ✅ VALIDATION POST-CORRECTION

1. **Pas d'erreur CORS** dans la console
2. **URL proxy** utilisée en production
3. **Email envoyé** avec succès
4. **PDF reçu** en pièce jointe

## 🔍 DEBUG SUPPLÉMENTAIRE

Si besoin de plus d'informations :
```javascript
// Dans la console développeur
import WebhookUrlHelper from './src/utils/webhookUrlHelper';
console.log(WebhookUrlHelper.getDebugInfo());
```

---
*Correction Erreur Réseau - Version 1.0 - 28 juillet 2025*
