#!/bin/bash

echo "📦 Création du package de déploiement Netlify avec correction proxy N8N"
echo "======================================================================="

# Nom du package
PACKAGE_NAME="netlify-deploy-proxy-fixed-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="packages/${PACKAGE_NAME}"

# Création du dossier
mkdir -p "$PACKAGE_DIR"

# Copie des fichiers de build
echo "📁 Copie des fichiers de build..."
cp -r dist/* "$PACKAGE_DIR/"

# Création d'un guide de déploiement
cat > "$PACKAGE_DIR/DEPLOY_GUIDE.md" << 'EOF'
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
EOF

# Création d'un script de test
cat > "$PACKAGE_DIR/test-proxy.sh" << 'EOF'
#!/bin/bash
echo "🧪 Test du proxy N8N après déploiement"
echo "====================================="

echo "1. Test N8N direct..."
curl -I https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle

echo -e "\n2. Test proxy Netlify..."
curl -I https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle

echo -e "\n✅ Si proxy retourne 404 avec application/json → SUCCESS"
echo "❌ Si proxy retourne 200 avec text/html → FAILURE (cache?)"
EOF

chmod +x "$PACKAGE_DIR/test-proxy.sh"

# Affichage des infos de configuration pour vérification
echo -e "\n📋 Vérification des fichiers de configuration:"
echo "============================================="
echo "Contenu de _redirects:"
cat "$PACKAGE_DIR/_redirects"
echo -e "\n---\nContenu de _headers (extrait API):"
grep -A 5 "/api/n8n/\*" "$PACKAGE_DIR/_headers"

echo -e "\n✅ Package créé: $PACKAGE_DIR"
echo "📁 Contenu:"
ls -la "$PACKAGE_DIR/"

echo -e "\n🚀 Instructions de déploiement:"
echo "1. Glissez-déposez le dossier '$PACKAGE_NAME' sur Netlify"
echo "2. Ou utilisez: cd '$PACKAGE_DIR' && netlify deploy --prod --dir=. --site=willowy-nougat-0a4af3"
echo "3. Testez avec: ./'$PACKAGE_NAME'/test-proxy.sh"
