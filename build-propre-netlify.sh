#!/bin/bash

# 🚨 BUILD PROPRE ET PACKAGE NETLIFY

echo "🚨 === BUILD PROPRE COMPLET ==="
echo ""

# 1. Nettoyer complètement
echo "🧹 Nettoyage complet..."
rm -rf dist/
rm -rf node_modules/.vite
rm -rf .vite

# 2. Installer dépendances propres
echo "📦 Installation dépendances propres..."
npm ci

# 3. Build avec cache effacé
echo "🔨 Build avec cache effacé..."
npm run build

# 4. Vérifier le build
echo ""
echo "📋 Vérification du build:"
if [ -d "dist" ]; then
    echo "✅ Build généré: $(du -sh dist/ | cut -f1)"
    echo "📅 Date: $(stat -f "%Sm" dist/index.html)"
    echo "📁 Fichiers: $(find dist -type f | wc -l | tr -d ' ') fichiers"
else
    echo "❌ ERREUR: Build échoué"
    exit 1
fi

# 5. Créer un ZIP pour Netlify
echo ""
echo "📦 Création package Netlify..."
cd dist
zip -r ../myconfort-netlify-$(date +%Y%m%d-%H%M).zip . > /dev/null
cd ..

echo "✅ Package créé: myconfort-netlify-$(date +%Y%m%d-%H%M).zip"

# 6. Vérifications finales
echo ""
echo "🔍 Vérifications finales dans le build:"

# Vérifier EmailJS supprimé
if grep -r "EmailSender" dist/ > /dev/null 2>&1; then
    echo "❌ ERREUR: EmailSender encore dans le build"
else
    echo "✅ EmailJS supprimé du build"
fi

# Vérifier présence des boutons retour
if grep -r "Retour" dist/ > /dev/null 2>&1; then
    echo "✅ Boutons retour présents dans le build"
else
    echo "❌ ERREUR: Boutons retour manquants"
fi

echo ""
echo "🎯 === RÉSULTAT ==="
echo "📦 Build propre généré dans dist/"
echo "📋 Package ZIP créé pour Netlify"
echo "🚀 Prêt pour déploiement manuel"

echo ""
echo "📤 DÉPLOIEMENT NETLIFY:"
echo "1. Aller sur https://app.netlify.com"
echo "2. Sites > Add new site > Deploy manually"
echo "3. Glisser le fichier ZIP ou le dossier dist/"
echo "4. Tester immédiatement"

echo ""
echo "🔍 Test local disponible sur:"
echo "http://localhost:8000"
