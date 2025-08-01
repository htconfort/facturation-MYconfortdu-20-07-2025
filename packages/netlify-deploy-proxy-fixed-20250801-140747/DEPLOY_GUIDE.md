# Guide de déploiement Netlify - Correction Proxy N8N

## Problème résolu
- **Erreur 404 du proxy N8N** : Les requêtes vers `/api/n8n/*` retournaient du HTML au lieu d'être proxifiées
- **Cause** : Dans `_redirects`, la règle SPA `/*` était placée AVANT la règle proxy `/api/n8n/*`

## Corrections apportées

### 1. Fichier `_redirects` (ordre corrigé)
```
# Redirection pour l'API N8N (DOIT ÊTRE AVANT LA RÈGLE SPA)
/api/n8n/*  https://n8n.srv765811.hstgr.cloud/:splat  200

# Redirection pour Single Page Application  
/*    /index.html   200
```

### 2. Fichier `_headers` (CORS ajouté)
```
/api/n8n/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
  Access-Control-Max-Age: 86400
```

## Déploiement

### Option 1: Drag & Drop Netlify
1. Allez sur https://app.netlify.com/sites/willowy-nougat-0a4af3/deploys
2. Glissez-déposez ce dossier dans la zone "Drag and drop your site output folder here"

### Option 2: Netlify CLI
```bash
# Installer Netlify CLI si nécessaire
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=. --site=willowy-nougat-0a4af3
```

## Tests après déploiement

### Test automatique
```bash
# Attendre 10-30 secondes après déploiement puis tester
curl -I https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle
```

**Résultat attendu :**
- Status: 404 (normal car GET sur webhook)
- Content-Type: application/json (et NOT text/html)
- Headers CORS présents

**Si le problème persiste :**
- Status: 200 avec Content-Type: text/html → Problème de cache Netlify
- Solution: Vider le cache Netlify ou attendre 5-10 minutes

### Test depuis l'application
1. Ouvrir https://willowy-nougat-0a4af3.netlify.app
2. Créer une facture test
3. Envoyer via email
4. Vérifier dans le Debug Center que l'URL N8N utilisée est bien `/api/n8n/webhook/facture-universelle`

## URL importantes
- **Site**: https://willowy-nougat-0a4af3.netlify.app
- **Proxy N8N**: https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle  
- **N8N direct**: https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
