# 🚀 GUIDE FINAL - DÉPLOIEMENT NETLIFY AVEC FIX CORS

## ✅ MODIFICATIONS APPLIQUÉES

Toutes les corrections nécessaires ont été intégrées à votre projet :

### 1. **netlify.toml optimisé** ✅
- ✅ Proxy N8N placé AVANT la règle SPA (ordre critique)
- ✅ Headers CORS complets configurés
- ✅ Redirection vers `https://n8n.srv765811.hstgr.cloud`

### 2. **WebhookUrlHelper** ✅
- ✅ Fichier `src/utils/webhookUrlHelper.ts` créé
- ✅ Détection automatique environnement dev/prod
- ✅ Utilise `/api/n8n/*` en production

### 3. **Service N8N adapté** ✅
- ✅ `src/services/n8nWebhookService.ts` utilise WebhookUrlHelper
- ✅ URLs générées automatiquement selon l'environnement

### 4. **Code committé et pushé** ✅
- ✅ Tous les changements sont sur GitHub
- ✅ Prêt pour le déploiement automatique Netlify

---

## 🌐 ÉTAPES DE DÉPLOIEMENT NETLIFY

### Étape 1 : Connectez-vous à Netlify
1. Allez sur [https://app.netlify.com](https://app.netlify.com)
2. Connectez-vous avec votre compte

### Étape 2 : Créer un nouveau site (si pas déjà fait)
1. Cliquez "Add new site" → "Import an existing project"
2. Choisissez "Deploy with GitHub"
3. Sélectionnez votre repository `facturation-MYconfortdu-20-07-2025`
4. **Les paramètres de build sont déjà configurés automatiquement :**
   - Build command : `npm ci && npm run build`
   - Publish directory : `dist`

### Étape 3 : Configurer les variables d'environnement
1. Site settings → Environment variables
2. Ajoutez ces variables **UNE PAR UNE** :

```bash
# 🔗 N8N WEBHOOK (OBLIGATOIRE)
VITE_N8N_WEBHOOK_URL
https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a

# 🏢 INFORMATIONS ENTREPRISE
VITE_COMPANY_NAME
HT CONFORT

VITE_COMPANY_PHONE
+33 X XX XX XX XX

VITE_COMPANY_EMAIL
contact@htconfort.com

VITE_COMPANY_ADDRESS
[Votre adresse complète]

VITE_COMPANY_SIRET
[Votre numéro SIRET]
```

### Étape 4 : Déclencher le déploiement
1. Cliquez "Deploy site" (ou il se déploie automatiquement)
2. Attendez que le statut passe à "Published" ✅

---

## 🧪 TEST DU FIX CORS

### Une fois déployé, testez :

1. **Ouvrez votre site Netlify**
2. **Ouvrez F12 → Network tab**
3. **Créez et envoyez une facture**
4. **Vérifiez dans Network :**

✅ **SUCCÈS attendu :**
```
URL: https://votre-app.netlify.app/api/n8n/webhook/facture-universelle
Status: 200 OK
```

❌ **Si problème :**
```
URL: https://n8n.srv765811.hstgr.cloud/... (URL directe = erreur)
Console: CORS error
```

---

## 🛠️ RÉSOLUTION DE PROBLÈMES

### Si l'erreur CORS persiste :

1. **Vérifiez l'ordre des redirections** :
   - Le proxy N8N doit être AVANT la règle SPA dans netlify.toml
   - **C'est critique !**

2. **Videz le cache** :
   - Browser : Ctrl+Shift+R
   - Netlify : Site settings → Build & deploy → Clear cache

3. **Vérifiez les variables d'environnement** :
   - Toutes doivent commencer par `VITE_`
   - `VITE_N8N_WEBHOOK_URL` est obligatoire

4. **Test direct du proxy** :
   ```
   https://votre-app.netlify.app/api/n8n/
   ```
   Doit rediriger vers N8N, pas 404

---

## 📋 CHECKLIST FINALE

- [ ] Site déployé sur Netlify
- [ ] Variables d'environnement configurées
- [ ] Test d'envoi d'email réussi
- [ ] URL proxy visible dans Network tab (`/api/n8n/*`)
- [ ] Status 200 pour l'envoi
- [ ] Email reçu avec PDF

---

## 🎯 RÉSULTAT FINAL

Après ce déploiement, votre application :
- ✅ **Fonctionnera en production** sans erreur CORS
- ✅ **Enverra les emails** avec PDF via N8N
- ✅ **Utilisera le proxy Netlify** automatiquement
- ✅ **Sera prête** pour vos clients

🎉 **Félicitations ! L'erreur "network error" sera définitivement résolue !**
