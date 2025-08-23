# 🔗 Mise à Jour URL Webhook N8N Production

## ✅ Nouvelle URL Production Configurée

**URL N8N Production :** `https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle`

---

## 📝 Fichiers Mis à Jour

### 1. `.env.example`
```env
VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"
```

### 2. `DEPLOY_NETLIFY_GUIDE.md`
```env
VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
```

### 3. `NETLIFY_ENV_VARIABLES.md`
```
VITE_N8N_WEBHOOK_URL
Valeur: https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
```

### 4. `src/services/configService.ts`
✅ **Déjà configuré** avec la bonne URL

---

## 🌐 Configuration Netlify

Pour déployer sur Netlify avec cette URL, ajouter la variable :

```
VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
```

Dans : **Site Settings** → **Environment Variables**

---

## 🧪 Test du Webhook

Une fois déployé, le webhook N8N recevra les données de facture sur :
- **Step 7 (Récapitulatif)** : Envoi automatique des données
- **Bouton "Envoyer par Email"** : Trigger manuel

### Données envoyées :
- Informations client
- Produits et services
- Modalités de paiement
- PDF généré (base64)
- Signature client

---

## ✨ Avantages URL Production

- ✅ **URL sémantique** : `/webhook/facture-universelle`
- ✅ **Plus facile à retenir**
- ✅ **Logs N8N plus clairs**
- ✅ **Maintenance simplifiée**

---

**Status :** ✅ **URL PRODUCTION CONFIGURÉE**
**Date :** 23 août 2025
**Ready for Netlify :** 🚀 **OUI**
