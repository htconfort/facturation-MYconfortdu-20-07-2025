# 🔐 VARIABLES D'ENVIRONNEMENT NETLIFY - MYCONFORT

## 📝 À CONFIGURER DANS NETLIFY DASHBOARD

### 1️⃣ Navigation
1. Aller sur [https://app.netlify.com](https://app.netlify.com)
2. Sélectionner votre site
3. Site settings → Environment variables
4. Cliquer sur "Add variable"

### 2️⃣ Variables requises

```bash
# 🔐 EMAILJS CONFIGURATION
VITE_EMAILJS_PUBLIC_KEY
Valeur: [Votre clé publique EmailJS]

VITE_EMAILJS_SERVICE_ID  
Valeur: [Votre service ID EmailJS]

VITE_EMAILJS_TEMPLATE_ID
Valeur: [Votre template ID EmailJS]

# 🔗 N8N WEBHOOK
VITE_N8N_WEBHOOK_URL
Valeur: https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a

# 🏢 INFORMATIONS ENTREPRISE
VITE_COMPANY_NAME
Valeur: HT CONFORT

VITE_COMPANY_PHONE
Valeur: +33 X XX XX XX XX

VITE_COMPANY_EMAIL
Valeur: contact@htconfort.com

VITE_COMPANY_ADDRESS
Valeur: [Votre adresse complète]

VITE_COMPANY_SIRET
Valeur: [Votre numéro SIRET]

# 🛠️ CONFIGURATION PRODUCTION
NODE_ENV
Valeur: production

VITE_DEBUG_MODE
Valeur: false

VITE_CONSOLE_LOGS
Valeur: false
```

### 3️⃣ Variables optionnelles

```bash
# 📄 PARAMÈTRES PDF
VITE_PDF_QUALITY
Valeur: 0.8

VITE_PDF_MAX_SIZE_MB
Valeur: 5

VITE_PDF_COMPRESSION
Valeur: true

# ⚙️ PARAMÈTRES GÉNÉRAUX
VITE_AUTO_SAVE_INTERVAL
Valeur: 60000

VITE_MAX_PRODUCTS_PER_INVOICE
Valeur: 50

VITE_DEFAULT_TAX_RATE
Valeur: 20

VITE_CURRENCY
Valeur: EUR
```

## ⚠️ IMPORTANT

1. **Toutes les variables doivent commencer par `VITE_`** pour être accessibles dans l'application
2. **Ne pas inclure de guillemets** dans les valeurs Netlify
3. **Redéployer** après ajout des variables
4. **Vérifier** que N8N webhook fonctionne avec la nouvelle URL

## 🔍 VALIDATION

Après déploiement, testez :
1. Création d'une facture
2. Génération PDF
3. Envoi email via N8N
4. Réception email avec PDF

---
*Guide Variables Netlify - Version 1.0*
