#!/bin/bash

echo "🔧 Script de déploiement Netlify avec correction proxy N8N"
echo "============================================================"

# Vérification de la présence de netlify-cli
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI n'est pas installé. Installation..."
    npm install -g netlify-cli
fi

# Nettoyage et rebuild
echo "🧹 Nettoyage et reconstruction..."
rm -rf dist/
npm run build

# Vérification des fichiers de configuration
echo "✅ Vérification des fichiers de configuration..."
echo "Contenu de dist/_redirects:"
cat dist/_redirects
echo -e "\n---\nContenu de dist/_headers:"
cat dist/_headers

# Test local rapide du proxy (si possible)
echo -e "\n🔍 Test de l'URL N8N directe..."
curl -I https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle

# Déploiement sur Netlify
echo -e "\n🚀 Déploiement sur Netlify..."
echo "Site ID: willowy-nougat-0a4af3"

# Déploiement en production
netlify deploy --prod --dir=dist --site=willowy-nougat-0a4af3

echo -e "\n✅ Déploiement terminé!"
echo "🌐 Site: https://willowy-nougat-0a4af3.netlify.app"
echo "🔗 Test proxy: https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle"

# Test automatique du proxy après déploiement
echo -e "\n🧪 Test du proxy N8N après déploiement (attente 10 secondes)..."
sleep 10

echo "Test GET sur le proxy:"
curl -I https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle

echo -e "\n✅ Script terminé! Vérifiez que le proxy retourne un code 2xx et non du HTML."
