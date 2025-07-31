# 🔐 CONFIGURATION VARIABLES D'ENVIRONNEMENT NETLIFY

## 📍 ÉTAPES DE CONFIGURATION

### 1️⃣ Accès aux Variables Netlify
1. Aller sur [https://app.netlify.com](https://app.netlify.com)
2. Sélectionner votre site MyConfort
3. **Site settings** → **Environment variables**
4. Cliquer **"Add variable"** pour chaque variable

### 2️⃣ Variables OBLIGATOIRES

#### 🔗 N8N Webhook (ESSENTIEL)
```
Variable: VITE_N8N_WEBHOOK_URL
Valeur: https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a
```

#### 🏢 Informations Entreprise (REQUISES)
```
Variable: VITE_COMPANY_NAME
Valeur: MYCONFORT

Variable: VITE_COMPANY_PHONE  
Valeur: 06 61 48 60 23

Variable: VITE_COMPANY_EMAIL
Valeur: myconfort66@gmail.com

Variable: VITE_COMPANY_ADDRESS
Valeur: 88 Avenue des Ternes, 75017 Paris

Variable: VITE_COMPANY_SIRET
Valeur: 824 313 530 00027
```

#### 🛠️ Configuration Production (REQUISES)
```
Variable: NODE_ENV
Valeur: production

Variable: VITE_DEBUG_MODE
Valeur: false

Variable: VITE_CONSOLE_LOGS
Valeur: false
```

### 3️⃣ Variables OPTIONNELLES (mais recommandées)

#### 📄 Configuration PDF
```
Variable: VITE_PDF_QUALITY
Valeur: 0.8

Variable: VITE_PDF_MAX_SIZE_MB
Valeur: 5

Variable: VITE_PDF_COMPRESSION
Valeur: true
```

#### ⚙️ Paramètres Application
```
Variable: VITE_AUTO_SAVE_INTERVAL
Valeur: 60000

Variable: VITE_MAX_PRODUCTS_PER_INVOICE
Valeur: 50

Variable: VITE_DEFAULT_TAX_RATE
Valeur: 20

Variable: VITE_CURRENCY
Valeur: EUR
```

#### 🔄 Sauvegarde
```
Variable: VITE_BACKUP_ENABLED
Valeur: true

Variable: VITE_BACKUP_INTERVAL_HOURS
Valeur: 24
```

#### 🔐 N8N Sécurité (optionnel)
```
Variable: VITE_N8N_WEBHOOK_SECRET
Valeur: [laisser vide ou définir un secret]
```

### 4️⃣ Variables NON UTILISÉES (à ignorer)

Ces variables sont dans le fichier exemple mais ne sont pas utilisées :
- ❌ `VITE_EMAILJS_*` (EmailJS non implémenté)
- ❌ `VITE_GOOGLE_DRIVE_*` (Google Drive géré par N8N)
- ❌ `VITE_DEFAULT_EMAIL_*` (Email géré par N8N)

## 🎯 CONFIGURATION RAPIDE

### Copy-Paste pour Netlify (une par une) :

```bash
# Variables ESSENTIELLES (à copier une par une dans Netlify)

VITE_N8N_WEBHOOK_URL
https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a

VITE_COMPANY_NAME
MYCONFORT

VITE_COMPANY_PHONE
06 61 48 60 23

VITE_COMPANY_EMAIL
myconfort66@gmail.com

VITE_COMPANY_ADDRESS
88 Avenue des Ternes, 75017 Paris

VITE_COMPANY_SIRET
824 313 530 00027

NODE_ENV
production

VITE_DEBUG_MODE
false

VITE_CONSOLE_LOGS
false
```

## 🔍 VALIDATION POST-CONFIGURATION

### ✅ Vérifications après ajout des variables :

1. **Redéployer le site** (automatique ou manuel)
2. **Tester l'application** :
   - Créer une facture
   - Vérifier les informations entreprise
   - Tester l'envoi N8N
   - Vérifier la génération PDF

### ⚠️ Erreurs fréquentes :

- **Variables non préfixées `VITE_`** → Ne seront pas accessibles
- **Espaces dans les valeurs** → Attention aux espaces en début/fin
- **Redéploiement oublié** → Les variables ne prennent effet qu'après redéploiement

## 🔧 DÉPANNAGE

### Si l'application ne fonctionne pas :

1. **Vérifier les variables** dans Netlify Dashboard
2. **Redéployer** le site
3. **Ouvrir la console** du navigateur pour les erreurs
4. **Tester N8N** : vérifier que le webhook répond

### Variables critiques manquantes :

```javascript
// L'application utilisera ces valeurs par défaut :
VITE_COMPANY_NAME → "HT CONFORT"
VITE_COMPANY_PHONE → "+33 X XX XX XX XX"
VITE_N8N_WEBHOOK_URL → "https://n8n.srv765811.hstgr.cloud/webhook/..."
```

## ✨ RÉSULTAT ATTENDU

Avec ces variables configurées :
- ✅ Informations entreprise correctes dans PDF
- ✅ Webhook N8N fonctionnel
- ✅ Email automatique via N8N
- ✅ Performance optimisée (mode production)
- ✅ Logs désactivés en production

---
*Configuration Variables Netlify - Version 1.0*
