# 🔧 TROUBLESHOOTING NETLIFY - MYCONFORT

## 🚨 PROBLÈMES COURANTS ET SOLUTIONS

### ❌ 1. Erreur de Build

#### Symptôme
```
Build failed: Command failed with exit code 1
```

#### Solutions
1. **Vérifier Node.js version**
   ```bash
   # Dans netlify.toml
   [build.environment]
   NODE_VERSION = "18"
   ```

2. **Nettoyer les dépendances**
   ```bash
   npm ci
   npm run build
   ```

3. **Vérifier les imports**
   - Imports avec la bonne casse
   - Extensions de fichiers présentes

---

### ❌ 2. Erreur 404 sur refresh

#### Symptôme
- Page fonctionne au premier chargement
- Erreur 404 en rafraîchissant

#### Solution
Vérifier `public/_redirects` :
```
/*    /index.html   200
```

---

### ❌ 3. Variables d'environnement non reconnues

#### Symptôme
```
Error: VITE_EMAILJS_PUBLIC_KEY is not defined
```

#### Solutions
1. **Préfixe VITE_** obligatoire
2. **Redéployer** après ajout variables
3. **Vérifier orthographe** exacte

---

### ❌ 4. Erreurs CORS avec N8N

#### Symptôme
```
CORS error when calling N8N webhook
```

#### Solutions
1. **Vérifier proxy dans netlify.toml**
   ```toml
   [[redirects]]
   from = "/api/n8n/*"
   to = "https://n8n.srv765811.hstgr.cloud/:splat"
   status = 200
   force = true
   ```

2. **Utiliser URL relative**
   ```javascript
   // ✅ Bon
   fetch('/api/n8n/webhook/...')
   
   // ❌ Éviter
   fetch('https://n8n.srv765811.hstgr.cloud/...')
   ```

---

### ❌ 5. PDF ne se génère pas

#### Symptôme
- Bouton PDF ne répond pas
- Erreur dans la console

#### Solutions
1. **Vérifier dépendances PDF**
   ```bash
   npm list html2pdf.js jspdf
   ```

2. **Tester en local d'abord**
   ```bash
   npm run dev
   ```

3. **Vérifier la console du navigateur**

---

### ❌ 6. Emails ne s'envoient pas

#### Symptôme
- N8N webhook fonctionne
- Mais pas de réception email

#### Solutions
1. **Vérifier configuration N8N**
   - Clés correctes dans Netlify
   - Service activé
   - Template configuré

2. **Tester payload N8N**
   ```bash
   # Utiliser les outils de debug N8N
   ```

3. **Vérifier format email**
   - Adresses valides
   - Pas de caractères spéciaux

---

### ❌ 7. Application lente

#### Symptôme
- Chargement > 5 secondes
- Interface qui rame

#### Solutions
1. **Optimiser les assets**
   ```bash
   # Vérifier la taille du bundle
   npm run build
   ```

2. **Code splitting**
   ```javascript
   // Lazy loading des composants
   const LazyComponent = lazy(() => import('./Component'))
   ```

3. **Optimiser les images**
   - Format WebP
   - Compression

---

### ❌ 8. Signature ne fonctionne pas

#### Symptôme
- Pad de signature vide
- Erreurs tactiles

#### Solutions
1. **Vérifier signature_pad**
   ```bash
   npm list signature_pad
   ```

2. **Tester sur différents devices**
   - Desktop
   - Mobile
   - Tablette

3. **Vérifier les events touch**

---

### ❌ 9. Styles cassés

#### Symptôme
- Interface mal affichée
- CSS manquant

#### Solutions
1. **Vérifier Tailwind**
   ```bash
   npm run build
   # Vérifier que CSS est généré
   ```

2. **Purge CSS**
   ```javascript
   // tailwind.config.js
   content: [
     "./src/**/*.{js,ts,jsx,tsx}",
   ],
   ```

---

### ❌ 10. Données non sauvegardées

#### Symptôme
- Formaire se vide
- Données perdues

#### Solutions
1. **Vérifier localStorage**
   ```javascript
   // Test dans console
   localStorage.getItem('invoice-data')
   ```

2. **Vérifier les states React**

---

## 🔍 MÉTHODES DE DEBUG

### 1️⃣ Console Netlify
```bash
# Logs de build
Site overview → Deploys → [Deploy] → Deploy log
```

### 2️⃣ Console navigateur
```javascript
// Activer tous les logs
localStorage.setItem('debug', 'true')
```

### 3️⃣ Netlify CLI
```bash
npm install -g netlify-cli
netlify dev  # Test local avec environnement Netlify
```

### 4️⃣ Test curl
```bash
# Tester les redirections
curl -I https://votre-site.netlify.app/api/n8n/test
```

---

## 📞 CONTACT SUPPORT

### 🆘 Si problème persiste
1. **Documentation Netlify**: https://docs.netlify.com
2. **Support Netlify**: https://support.netlify.com
3. **Community Forum**: https://community.netlify.com

### 📋 Informations à fournir
- URL du site
- Message d'erreur exact
- Logs de build
- Steps to reproduce

---

*Guide Troubleshooting Netlify - Version 1.0*
