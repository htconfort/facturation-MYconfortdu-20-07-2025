# 🔐 VARIABLES D'ENVIRONNEMENT NETLIFY
## Configuration Requise pour Déploiement Production

---

## 📋 VARIABLES OBLIGATOIRES

### 1. **N8N Webhook Configuration**
```bash
VITE_N8N_WEBHOOK_URL=https://myconfort.app.n8n.cloud/webhook/facture-universelle
```
> ⚠️ **Important** : Utilisez l'URL exacte de votre webhook N8N

### 2. **Environnement de Production**
```bash
VITE_ENV=production
NODE_ENV=production
```

### 3. **Version Node.js**
```bash
NODE_VERSION=18.19.0
NPM_VERSION=9.8.1
```

---

## 🌐 COMMENT CONFIGURER DANS NETLIFY

### Via Interface Web Netlify

1. **Accéder aux Variables**
   - Aller sur [app.netlify.com](https://app.netlify.com)
   - Sélectionner votre site
   - Site Settings → Environment Variables

2. **Ajouter les Variables**
   - Cliquer "Add Variable"
   - Entrer Nom + Valeur
   - Sauvegarder

### Configuration Étape par Étape

```bash
# Variable 1: URL Webhook N8N
Key: VITE_N8N_WEBHOOK_URL
Value: https://myconfort.app.n8n.cloud/webhook/facture-universelle

# Variable 2: Environnement
Key: VITE_ENV
Value: production

# Variable 3: Version Node
Key: NODE_VERSION
Value: 18.19.0

# Variable 4: Version NPM
Key: NPM_VERSION
Value: 9.8.1
```

---

## 🔧 VARIABLES OPTIONNELLES (AMÉLIORATIONS)

### Email Configuration
```bash
VITE_DEFAULT_EMAIL_FROM=noreply@myconfort.com
VITE_DEFAULT_EMAIL_REPLY_TO=contact@myconfort.com
```

### Informations Entreprise
```bash
VITE_COMPANY_NAME=MYCONFORT
VITE_COMPANY_PHONE=+33 6 61 48 60 23
VITE_COMPANY_EMAIL=htconfort@gmail.com
VITE_COMPANY_SIRET=824 313 530 00027
```

### Paramètres PDF
```bash
VITE_PDF_QUALITY=0.8
VITE_PDF_MAX_SIZE_MB=5
VITE_PDF_COMPRESSION=true
```

### Debug et Logs
```bash
VITE_DEBUG_MODE=false
VITE_CONSOLE_LOGS=false
```

---

## 📊 VÉRIFICATION CONFIGURATION

### Via Build Logs Netlify
```bash
# Les variables apparaissent dans les logs comme :
✓ VITE_N8N_WEBHOOK_URL: https://myconfort.app.n8n.cloud/webhook/facture-universelle
✓ VITE_ENV: production
✓ NODE_VERSION: 18.19.0
```

### Test Variables dans l'Application
```javascript
// Dans la console du navigateur (après déploiement)
console.log(import.meta.env.VITE_N8N_WEBHOOK_URL);
console.log(import.meta.env.VITE_ENV);
```

---

## 🚨 VARIABLES SENSIBLES

### ⚠️ À NE PAS EXPOSER
```bash
# Ces variables ne doivent PAS commencer par VITE_
DATABASE_PASSWORD=secret
API_SECRET_KEY=secret
WEBHOOK_SECRET=secret
```

### ✅ Variables Publiques (OK avec VITE_)
```bash
# Ces variables sont visibles côté client
VITE_N8N_WEBHOOK_URL=https://...
VITE_ENV=production
VITE_COMPANY_NAME=MYCONFORT
```

---

## 🔄 REDÉPLOIEMENT APRÈS MODIFICATION

### Méthode 1: Auto-Deploy
- Modifier les variables dans Netlify UI
- Netlify redéploie automatiquement

### Méthode 2: Manuel
```bash
# Dans Netlify UI
Site Overview → Trigger Deploy → Deploy Site
```

### Méthode 3: Git Push
```bash
# Pousser un commit vide
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 🎯 CONFIGURATION MINIMALE POUR DÉMARRER

```bash
# CES 4 VARIABLES SUFFISENT POUR DÉPLOYER
VITE_N8N_WEBHOOK_URL=https://myconfort.app.n8n.cloud/webhook/facture-universelle
VITE_ENV=production
NODE_VERSION=18.19.0
NPM_VERSION=9.8.1
```

---

## 📞 SUPPORT

### En cas de problème :

1. **Vérifier les logs Netlify**
   - Site Overview → Production deploys → View logs

2. **Tester en local**
   ```bash
   npm install
   npm run build
   npm run preview
   ```

3. **Vérifier les variables**
   - Site Settings → Environment variables
   - Confirmer que toutes les variables sont présentes

---

**🚀 PRÊT POUR CONFIGURATION !**

*Copiez ces variables dans votre interface Netlify*  
*Le déploiement se fera automatiquement après configuration*

---

*Guide créé le 23 août 2025*  
*Version: Production v2.0*
