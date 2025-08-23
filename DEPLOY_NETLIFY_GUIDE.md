# 🚀 Guide Déploiement Netlify - Variables d'Environnement

## ⚡ CONFIGURATION RAPIDE NETLIFY

### 🔥 Variables OBLIGATOIRES minimum :

```env
# SYSTÈME EMAIL (OBLIGATOIRE)
VITE_EMAILJS_PUBLIC_KEY=votre_public_key_emailjs
VITE_EMAILJS_SERVICE_ID=votre_service_id_emailjs
VITE_EMAILJS_TEMPLATE_ID=votre_template_id_emailjs

# ENTREPRISE (OBLIGATOIRE)
VITE_COMPANY_NAME=HT CONFORT
VITE_COMPANY_SIRET=824 313 530 00027
VITE_COMPANY_EMAIL=contact@htconfort.com
VITE_COMPANY_PHONE=+33 X XX XX XX XX

# ENVIRONNEMENT (OBLIGATOIRE)
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_CONSOLE_LOGS=false
```

### 🎯 Variables RECOMMANDÉES :

```env
# WEBHOOK N8N (Automation)
VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a

# PDF OPTIMISÉ
VITE_PDF_QUALITY=0.8
VITE_PDF_COMPRESSION=true

# PARAMÈTRES GÉNÉRAUX
VITE_DEFAULT_TAX_RATE=20
VITE_CURRENCY=EUR
```

---

## 📋 ÉTAPES NETLIFY

### 1. **Connecter le Repository**
- Aller sur https://app.netlify.com
- "New site from Git"
- Connecter votre repository GitHub

### 2. **Configuration Build**
```
Build command: npm run build
Publish directory: dist
```

### 3. **Variables d'Environnement**
Site Settings → Environment Variables → Add variable

**⚡ Copier-coller directement :**
```
VITE_EMAILJS_PUBLIC_KEY
VITE_EMAILJS_SERVICE_ID  
VITE_EMAILJS_TEMPLATE_ID
VITE_COMPANY_NAME
VITE_COMPANY_SIRET
NODE_ENV
VITE_DEBUG_MODE
```

### 4. **Deploy !**
Netlify va automatiquement builder et déployer.

---

## 🔧 Fichiers de Configuration Inclus

### ✅ `public/_redirects`
```
/*    /index.html   200
```
→ Gère les routes React Router

### ✅ `netlify.toml` (optionnel)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🧪 Test Post-Déploiement

1. **✅ Application se charge**
2. **✅ Mode iPad fonctionne** 
3. **✅ Génération PDF** 
4. **✅ Envoi email**
5. **✅ Icônes paiement affichées**
6. **✅ Validation boutons rouge/vert**

---

## 🆘 En cas de problème

### Build Error :
- Vérifier `npm run build` en local
- Vérifier toutes les variables `VITE_` 

### Email ne marche pas :
- Vérifier les 3 variables EmailJS
- Tester sur https://www.emailjs.com/

### PDF vide :
- Variables entreprise manquantes
- Vérifier `VITE_COMPANY_*`

---

**🎉 URL finale :** `https://votre-app.netlify.app`

**⚡ Temps de déploiement :** ~2-3 minutes

**💡 Pro tip :** Utiliser un domaine personnalisé pour plus de professionnalisme !
