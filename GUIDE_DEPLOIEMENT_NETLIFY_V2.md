# 🚀 GUIDE DÉPLOIEMENT NETLIFY - MYCONFORT v2.0
## Application de Facturation avec Bon de Commande Email

---

## ✅ PRÉREQUIS VALIDÉS

### 🔧 Modifications Récentes (23 août 2025)
- ✅ Logo sur fond blanc dans PDF corrigé
- ✅ Nouveaux champs "Bon de commande" dans email ajoutés
- ✅ PDF reste "Facture" en pièce jointe
- ✅ Même numéro utilisé pour email et PDF
- ✅ Workflow N8N mis à jour
- ✅ Build optimisé et testé

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1. **Préparation du Repository**

```bash
# Vérifier l'état du code
cd /Users/brunopriem/github.com:htconfort:Myconfort/facturation-MYconfortdu-20-07-2025-1

# Status du projet
git status
git log --oneline -5

# Build final de vérification
npm run build
```

### 2. **Push des Dernières Modifications**

```bash
# Ajouter les nouveaux fichiers
git add .

# Commit des modifications bon de commande
git commit -m "feat: Ajout distinction Bon de commande email vs Facture PDF

- Ajout champs type_document_email et type_document_pdf
- Email affiche 'Bon de commande' avec même numéro
- PDF reste 'Facture' en pièce jointe
- Tests validés et workflow opérationnel"

# Push vers GitHub
git push origin main
```

### 3. **Configuration Netlify**

#### Variables d'Environnement Requises
```bash
VITE_N8N_WEBHOOK_URL=https://myconfort.app.n8n.cloud/webhook/facture-universelle
VITE_ENV=production
NODE_VERSION=18.19.0
NPM_VERSION=9.8.1
```

#### Build Settings
```bash
# Commande de build
npm run build

# Répertoire de publication
dist

# Node.js version
18.19.0
```

---

## 🧪 TESTS PRÉ-DÉPLOIEMENT

### Test 1: Build Local
```bash
npm run build
# ✅ Doit réussir sans erreurs
# ✅ Dossier dist/ créé
# ✅ Assets optimisés
```

### Test 2: Workflow Bon de Commande
```bash
node test-workflow-bon-commande.mjs
# ✅ Email configure "Bon de commande"
# ✅ PDF reste "Facture"
# ✅ Même numéro utilisé
```

### Test 3: Optimisations PDF
```bash
node test-logo-optimise.mjs
# ✅ Logo optimisé fond blanc
# ✅ Compression fonctionnelle
# ✅ Taille < 50KB
```

### Test 4: Envoi N8N
```bash
node test-facture-finale-optimisee.mjs
# ✅ Payload < 100KB
# ✅ Webhook fonctionnel
# ✅ Réponse 200 OK
```

---

## 🚀 DÉPLOIEMENT NETLIFY

### Option A: Déploiement Automatique (Recommandé)

1. **Connecter Repository GitHub**
   - Aller sur [netlify.com](https://app.netlify.com)
   - New site from Git → GitHub
   - Sélectionner le repository `facturation-MYconfortdu-20-07-2025-1`

2. **Configuration Build**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Branch: `main`

3. **Variables d'Environnement**
   - Site settings → Environment variables
   - Ajouter les variables listées ci-dessus

4. **Deploy Site**
   - Netlify détecte automatiquement les pushs
   - Build et déploiement automatiques

### Option B: Déploiement Manuel

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login Netlify
netlify login

# Build local
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

---

## 📊 VALIDATION POST-DÉPLOIEMENT

### 1. **Tests Fonctionnels**
- [ ] Site accessible via URL Netlify
- [ ] Interface utilisateur fonctionne
- [ ] Génération de facture OK
- [ ] Logo apparaît sur fond blanc
- [ ] Envoi email fonctionne

### 2. **Tests Email**
- [ ] Email reçu avec objet "Bon de commande n° XXX"
- [ ] Corps email affiche "Bon de commande"
- [ ] PDF en pièce jointe nommé "Facture_MYCONFORT_XXX"
- [ ] PDF contient logo sur fond blanc
- [ ] Même numéro dans email et PDF

### 3. **Tests Performance**
- [ ] Temps de chargement < 3s
- [ ] Build size optimisé
- [ ] Assets compressés
- [ ] Pas d'erreurs console

### 4. **Tests N8N Workflow**
- [ ] Webhook reçoit données
- [ ] Email envoyé automatiquement
- [ ] PDF sauvegardé sur Drive
- [ ] Tous les champs renseignés

---

## 🎯 URLS ET ACCÈS

### URLs de Production
- **Site principal**: `https://[site-name].netlify.app`
- **Webhook N8N**: `https://myconfort.app.n8n.cloud/webhook/facture-universelle`
- **Repository**: `https://github.com/[username]/facturation-MYconfortdu-20-07-2025-1`

---

## 🎉 CHECKLIST FINALE

### Avant Déploiement
- [x] Code committé et pushé
- [x] Tests passent tous
- [x] Build réussit
- [x] Variables d'env définies
- [x] Logo fond blanc validé
- [x] Champs bon de commande ajoutés

### Après Déploiement
- [ ] Site accessible
- [ ] Workflow email testé
- [ ] PDF généré correct
- [ ] N8N reçoit données
- [ ] Monitoring actif

---

**🚀 PRÊT POUR DÉPLOIEMENT !**

*Toutes les modifications sont validées et testées.*  
*L'application est optimisée pour la production.*  
*Le workflow bon de commande est fonctionnel.*

---

*Guide créé le 23 août 2025*  
*Version: Production v2.0 avec Bon de Commande*
