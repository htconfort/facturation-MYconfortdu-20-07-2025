# 🚀 Variables d'Environnement Netlify - MYCONFORT Facturation

## 📋 Variables Obligatoires pour Netlify

### � N8N Webhook (Obligatoire pour l'envoi d'emails)
```bash
VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"
VITE_N8N_WEBHOOK_SECRET="votre_secret_webhook"
```
**Note :** L'application utilise N8N pour l'envoi d'emails, plus EmailJS.

### 📧 Configuration Email
```bash
VITE_DEFAULT_EMAIL_FROM="noreply@myconfort.com"
VITE_DEFAULT_EMAIL_REPLY_TO="contact@myconfort.com"
```

### 🏢 Informations Entreprise (Obligatoire pour PDF)
```bash
VITE_COMPANY_NAME="HT CONFORT"
VITE_COMPANY_PHONE="+33 X XX XX XX XX"
VITE_COMPANY_EMAIL="contact@htconfort.com"
VITE_COMPANY_ADDRESS="Votre adresse complète"
VITE_COMPANY_SIRET="824 313 530 00027"
```

---

## 🔗 Variables Optionnelles (Fonctionnalités Avancées)

### ☁️ Google Drive API (Optionnel - Upload automatique)
```bash
VITE_GOOGLE_DRIVE_API_KEY="votre_google_drive_api_key"
VITE_GOOGLE_DRIVE_CLIENT_ID="votre_client_id"
VITE_GOOGLE_DRIVE_FOLDER_ID="votre_dossier_principal_id"
```

### 🔗 N8N Webhook (Déjà configuré en production)
```bash
VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"
VITE_N8N_WEBHOOK_SECRET="votre_secret_webhook"
```

### 🛠️ Configuration Production
```bash
NODE_ENV="production"
VITE_DEBUG_MODE="false"
VITE_CONSOLE_LOGS="false"
```

### 📄 Paramètres PDF (Optionnel - Valeurs par défaut OK)
```bash
VITE_PDF_QUALITY="0.8"
VITE_PDF_MAX_SIZE_MB="5"
VITE_PDF_COMPRESSION="true"
```

### ⚙️ Paramètres Généraux (Optionnel - Valeurs par défaut OK)
```bash
VITE_AUTO_SAVE_INTERVAL="60000"
VITE_MAX_PRODUCTS_PER_INVOICE="50"
VITE_DEFAULT_TAX_RATE="20"
VITE_CURRENCY="EUR"
VITE_BACKUP_ENABLED="true"
VITE_BACKUP_INTERVAL_HOURS="24"
```

---

## 🎯 Configuration Minimale pour Netlify

### Pour un déploiement fonctionnel de base :

```bash
# OBLIGATOIRE - N8N Webhook
VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"
VITE_N8N_WEBHOOK_SECRET="votre_secret_webhook"

# OBLIGATOIRE - Emails
VITE_DEFAULT_EMAIL_FROM="noreply@myconfort.com"
VITE_DEFAULT_EMAIL_REPLY_TO="contact@myconfort.com"

# OBLIGATOIRE - Entreprise
VITE_COMPANY_NAME="HT CONFORT"
VITE_COMPANY_PHONE="+33 X XX XX XX XX"
VITE_COMPANY_EMAIL="contact@htconfort.com"
VITE_COMPANY_ADDRESS="Votre adresse complète"
VITE_COMPANY_SIRET="824 313 530 00027"

# PRODUCTION
NODE_ENV="production"
VITE_DEBUG_MODE="false"
VITE_CONSOLE_LOGS="false"
```

---

## 📝 Guide de Configuration Netlify

### 1. Accéder aux Variables d'Environnement
1. Aller sur [Netlify Dashboard](https://app.netlify.com/)
2. Sélectionner votre site
3. Aller dans **Site settings** → **Environment variables**

### 2. Ajouter les Variables
Pour chaque variable, cliquer sur **Add a variable** et saisir :
- **Key** : Le nom de la variable (ex: `VITE_COMPANY_NAME`)
- **Value** : La valeur correspondante
- **Scopes** : Laisser par défaut (All scopes)

### 3. Variables Sensibles
⚠️ **Ne jamais exposer dans le code :**
- Clés API privées
- Secrets de webhook
- Mots de passe

✅ **Safe pour Vite (préfixe VITE_) :**
- Configuration publique
- URLs publiques
- Paramètres d'interface

---

## 🧪 Test des Variables

### Vérifier que les variables sont bien chargées :
```javascript
// Dans la console développeur du site déployé
console.log('N8N Webhook URL:', import.meta.env.VITE_N8N_WEBHOOK_URL);
console.log('Company Name:', import.meta.env.VITE_COMPANY_NAME);
```

---

## 🔄 Redéploiement

Après avoir ajouté/modifié les variables d'environnement :
1. Aller dans **Deploys**
2. Cliquer sur **Trigger deploy** → **Deploy site**
3. Ou faire un nouveau push Git (redéploiement automatique)

---

## ✅ Checklist Déploiement Netlify

### Variables Obligatoires :
- [ ] `VITE_N8N_WEBHOOK_URL`
- [ ] `VITE_N8N_WEBHOOK_SECRET`
- [ ] `VITE_DEFAULT_EMAIL_FROM`
- [ ] `VITE_DEFAULT_EMAIL_REPLY_TO`
- [ ] `VITE_COMPANY_NAME`
- [ ] `VITE_COMPANY_PHONE`
- [ ] `VITE_COMPANY_EMAIL`
- [ ] `VITE_COMPANY_ADDRESS`
- [ ] `VITE_COMPANY_SIRET`
- [ ] `NODE_ENV="production"`
- [ ] `VITE_DEBUG_MODE="false"`

### Fonctionnalités Activées :
- [ ] ✅ Génération de factures PDF
- [ ] ✅ Envoi d'emails avec N8N
- [ ] ✅ Mode iPad optimisé
- [ ] ✅ Icônes de paiement
- [ ] ✅ Validation des formulaires
- [ ] ✅ Signature électronique
- [ ] ⏸️ Upload Google Drive (optionnel)

---

**🎉 Avec cette configuration, votre application MYCONFORT sera pleinement fonctionnelle sur Netlify !**
