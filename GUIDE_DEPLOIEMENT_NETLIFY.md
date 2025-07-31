# 🚀 GUIDE DE DÉPLOIEMENT NETLIFY - MYCONFORT FACTURATION

## 📋 PRÉREQUIS

### ✅ Vérifications avant déploiement
- [x] Application testée localement (`npm run dev`)
- [x] Build de production réussi (`npm run build`)
- [x] Tests de paiement, PDF et signature validés
- [x] Configuration N8N validée en production

### 🔧 Fichiers de configuration Netlify
- `netlify.toml` - Configuration principale
- `public/_headers` - Headers de sécurité
- `public/_redirects` - Redirections SPA et API

## 🌐 ÉTAPES DE DÉPLOIEMENT

### 1️⃣ Connexion à Netlify
1. Ouvrir [https://app.netlify.com](https://app.netlify.com)
2. Se connecter avec GitHub/GitLab/Bitbucket
3. Cliquer sur "New site from Git"

### 2️⃣ Configuration du repository
1. Sélectionner le provider Git (GitHub)
2. Choisir le repository : `htconfort/Myconfort`
3. Sélectionner la branche : `main` ou `master`

### 3️⃣ Configuration de build
```
Build command: npm run build
Publish directory: dist
```

### 4️⃣ Variables d'environnement
Dans Netlify Dashboard > Site settings > Environment variables :

```bash
# 🔐 EMAILJS CONFIGURATION
VITE_EMAILJS_PUBLIC_KEY="your_public_key"
VITE_EMAILJS_SERVICE_ID="your_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_template_id"

# 🔗 N8N WEBHOOK
VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a"

# 🏢 INFORMATIONS ENTREPRISE
VITE_COMPANY_NAME="HT CONFORT"
VITE_COMPANY_PHONE="+33 X XX XX XX XX"
VITE_COMPANY_EMAIL="contact@htconfort.com"
VITE_COMPANY_ADDRESS="Votre adresse complète"
VITE_COMPANY_SIRET="Votre numéro SIRET"

# 🛠️ CONFIGURATION PRODUCTION
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_CONSOLE_LOGS=false
```

### 5️⃣ Configuration du domaine (optionnel)
1. Site settings > Domain management
2. Add custom domain
3. Configurer les DNS selon les instructions

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### ✅ Tests à effectuer
1. **Chargement de l'application** : Site accessible et interface utilisateur
2. **Création de facture** : Tous les champs fonctionnels
3. **Modes de paiement** : Espèces, Chèques, Acompte
4. **Génération PDF** : Download et affichage correct
5. **Signature** : Pad de signature fonctionnel
6. **Envoi N8N** : Webhook reçu et traité
7. **Email automatique** : Reception d'email avec PDF

### 🔧 Tests spécifiques
```bash
# Test 1: Facture simple avec espèces
- Créer une facture
- Mode paiement: Espèces
- Vérifier: montant_restant = 0 dans le PDF

# Test 2: Facture avec chèques
- Créer une facture
- Mode paiement: Chèques
- Ajouter plusieurs chèques
- Vérifier: affichage des chèques dans le PDF

# Test 3: Facture avec acompte
- Créer une facture
- Mode paiement: Acompte
- Définir montant acompte
- Vérifier: calcul montant restant correct

# Test 4: Signature
- Créer une facture
- Signer dans le pad
- Vérifier: signature apparaît dans le PDF
- Vérifier: signature envoyée à N8N (base64)
```

## 🚨 PROBLÈMES COURANTS

### ❌ Erreurs de build
```bash
# Si erreur de dépendances
npm ci
npm run build

# Si erreur TypeScript
npm run lint
```

### ❌ Problèmes de CORS
- Vérifier la configuration proxy dans `netlify.toml`
- S'assurer que N8N accepte les requêtes depuis le domaine Netlify

### ❌ Variables d'environnement manquantes
- Vérifier que toutes les variables `VITE_*` sont définies
- Redéployer après ajout de variables

### ❌ Problèmes de routage SPA
- Vérifier `_redirects` dans `public/`
- S'assurer de la redirection `/* /index.html 200`

## 📊 MONITORING

### 📈 Métriques à surveiller
1. **Performance** : Lighthouse score > 90
2. **Disponibilité** : Uptime > 99.9%
3. **Erreurs** : Pas d'erreurs 5xx
4. **Webhooks N8N** : Taux de succès > 95%

### 🔔 Alertes recommandées
- Build failures
- Déploiement échoués
- Erreurs 5xx répétées
- Webhook N8N en échec

## 🔄 DÉPLOIEMENTS AUTOMATIQUES

### 🎯 Configuration recommandée
1. **Production** : déploiement automatique sur `main`
2. **Preview** : déploiement sur pull requests
3. **Branch deploys** : Activé pour testing

### 🚀 Commandes de déploiement manuel
```bash
# Push vers production
git add .
git commit -m "feat: deployment ready"
git push origin main

# Déploiement Netlify CLI (optionnel)
npm install -g netlify-cli
netlify deploy --prod
```

## 📋 CHECKLIST FINAL

- [ ] Site accessible via l'URL Netlify
- [ ] Toutes les fonctionnalités testées
- [ ] N8N webhook fonctionnel
- [ ] Email automatique reçu
- [ ] PDF généré correctement
- [ ] Signature sauvegardée
- [ ] Performance acceptable (< 3s load)
- [ ] Mobile responsive
- [ ] Domaine personnalisé configuré (si nécessaire)

## 🎉 SUCCÈS !

Une fois tous les tests passés, l'application MyConfort Facturation est déployée avec succès sur Netlify !

URL de production : `https://[site-name].netlify.app`

---
*Guide créé le 28 juillet 2025 - Version 1.0*
