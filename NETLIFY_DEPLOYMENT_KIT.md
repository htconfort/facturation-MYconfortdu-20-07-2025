# 🚀 Kit de Déploiement Netlify - MyConfort Facturation

## 📋 Prérequis
- [ ] Compte Netlify configuré
- [ ] Accès au repository GitHub
- [ ] Variables d'environnement N8N disponibles
- [ ] URL webhook N8N de production

## 📁 Fichiers du kit de déploiement

### 1. Configuration Netlify (`netlify.toml`)
✅ **Présent** - Configuration complète avec :
- Build command optimisée avec nettoyage
- Proxy N8N configuré
- Redirections SPA
- Headers de sécurité et CORS

### 2. Variables d'environnement (`.env.example`)
✅ **Présent** - Template avec toutes les variables nécessaires

### 3. Scripts de déploiement
- `deploy-netlify.sh` - Script de déploiement automatique
- `validate-env-vars.sh` - Validation des variables d'environnement
- `test-post-deploy.sh` - Tests post-déploiement

## 🎯 Étapes de déploiement

### Étape 1 : Préparation
```bash
# 1. Cloner ou se positionner dans le projet
git clone https://github.com/htconfort/facturation-MYconfortdu-20-07-2025.git
cd facturation-MYconfortdu-20-07-2025

# 2. Vérifier les dépendances
npm install

# 3. Tester le build local
npm run build
```

### Étape 2 : Configuration Netlify

#### A. Via l'interface Netlify (recommandé)
1. **Se connecter à Netlify** : https://app.netlify.com
2. **Nouveau site** : "Import from Git"
3. **Connecter GitHub** et sélectionner le repository
4. **Configuration automatique** :
   - Build command : `rm -rf node_modules package-lock.json && npm install && npx vite build`
   - Publish directory : `dist`
   - Build settings : Détectées automatiquement via `netlify.toml`

#### B. Variables d'environnement (OBLIGATOIRE)
Dans Netlify → Site settings → Environment variables :

```bash
# N8N Configuration
VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/facture-myconfort
VITE_N8N_BASE_URL=https://n8n.srv765811.hstgr.cloud

# Application Settings
VITE_APP_NAME=MyConfort Facturation
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Features (optionnel)
VITE_DEBUG_MODE=false
VITE_ANALYTICS_ENABLED=true
```

### Étape 3 : Déploiement
```bash
# Option A : Push vers GitHub (déploiement automatique)
git add .
git commit -m "🚀 Ready for Netlify deployment"
git push origin main

# Option B : Déploiement direct avec Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Étape 4 : Vérification post-déploiement
```bash
# Lancer les tests automatiques
chmod +x test-post-deploy.sh
./test-post-deploy.sh https://votre-site.netlify.app
```

## 🔧 Configuration avancée

### Redirections et Proxy
Le fichier `netlify.toml` configure automatiquement :
- **Proxy N8N** : `/api/n8n/*` → `https://n8n.srv765811.hstgr.cloud/*`
- **SPA Routing** : `/*` → `/index.html` (pour React Router)
- **CORS Headers** : Pour les appels API N8N

### Optimisations de performance
- **Cache static assets** : 1 an pour `/assets/*`
- **Headers de sécurité** : X-Frame-Options, XSS Protection, etc.
- **Compression Gzip** : Automatique sur Netlify

### Domaine personnalisé (optionnel)
1. Netlify → Domain settings → Add custom domain
2. Configurer les DNS chez votre registrar
3. SSL automatique via Let's Encrypt

## 🛠️ Troubleshooting

### Erreurs communes

#### Build Failed
```bash
# Vérifier les dépendances
npm ci
npm run build

# Nettoyer le cache
rm -rf node_modules package-lock.json dist
npm install
```

#### Variables d'environnement manquantes
```bash
# Valider la configuration
./validate-env-vars.sh
```

#### Erreurs N8N/API
- Vérifier l'URL webhook N8N
- Tester la connectivité : `curl https://n8n.srv765811.hstgr.cloud/health`
- Vérifier les logs Netlify → Functions → Edge logs

#### Problèmes de routing
- Vérifier que `netlify.toml` contient les redirections SPA
- Tester les routes directement : `https://site.netlify.app/ipad`

## 📊 Monitoring et maintenance

### Logs et métriques
- **Netlify Analytics** : Trafic et performance
- **Function logs** : Erreurs proxy N8N
- **Uptime monitoring** : https://uptimerobot.com

### Mises à jour
```bash
# Mise à jour automatique via GitHub
git pull origin main
# Le déploiement se déclenche automatiquement

# Force rebuild sans changement de code
netlify deploy --trigger
```

## 🎯 URLs importantes

### Après déploiement
- **Application** : `https://votre-site.netlify.app`
- **Mode iPad** : `https://votre-site.netlify.app/ipad`
- **Admin Netlify** : `https://app.netlify.com/sites/votre-site`

### APIs
- **Webhook N8N** : `https://votre-site.netlify.app/api/n8n/webhook/facture-myconfort`
- **Health Check** : `https://n8n.srv765811.hstgr.cloud/health`

## ✅ Checklist finale

- [ ] Repository GitHub connecté
- [ ] Variables d'environnement configurées
- [ ] Build successful (vert dans Netlify)
- [ ] Application accessible
- [ ] Mode iPad fonctionnel
- [ ] Test création facture complet
- [ ] Email N8N reçu
- [ ] PDF généré correctement

## 📞 Support

En cas de problème :
1. Consulter les logs Netlify
2. Vérifier les variables d'environnement
3. Tester l'URL N8N directement
4. Vérifier la configuration DNS (si domaine personnalisé)

---

**🎉 Votre application MyConfort Facturation est maintenant déployée sur Netlify !**
