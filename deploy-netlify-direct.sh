#!/bin/bash

# 🚀 Déploiement direct Netlify - Alternative GitHub Actions

echo "🚀 DÉPLOIEMENT DIRECT NETLIFY"
echo "══════════════════════════════════"

echo ""
echo "📋 ÉTAPES À SUIVRE POUR DÉPLOYER IMMÉDIATEMENT :"
echo ""

echo "1️⃣ CRÉER LE SITE NETLIFY (une seule fois)"
echo "   • Allez sur : https://app.netlify.com"
echo "   • Connectez-vous avec votre compte"
echo "   • Cliquez 'Add new site' → 'Import an existing project'"
echo "   • Sélectionnez GitHub → Autorisez l'accès"
echo "   • Cherchez et sélectionnez : htconfort/facturation-MYconfortdu-20-07-2025"
echo ""

echo "2️⃣ CONFIGURATION DU SITE"
echo "   Branch to deploy : feature/boutons-suivant-ipad"
echo "   Build command : npm run build"
echo "   Publish directory : dist"
echo "   Site name : myconfort-facturation (ou autre)"
echo ""

echo "3️⃣ DÉPLOIEMENT AUTOMATIQUE"
echo "   • Une fois configuré, Netlify détectera automatiquement les pushs"
echo "   • Ou cliquez 'Deploy site' pour un déploiement immédiat"
echo ""

echo "🎯 ALTERNATIVE : UPLOAD MANUEL DU BUILD"
echo ""

# Vérifier si dist existe
if [ -d "dist" ]; then
    echo "   ✅ Dossier dist/ présent et prêt pour upload"
    
    # Créer un zip pour faciliter l'upload
    echo "   📦 Création d'un zip pour upload manuel..."
    cd dist && zip -r ../myconfort-facturation-build.zip . && cd ..
    
    if [ -f "myconfort-facturation-build.zip" ]; then
        echo "   ✅ Archive créée : myconfort-facturation-build.zip"
        echo ""
        echo "   📤 UPLOAD MANUEL :"
        echo "      1. Allez sur https://app.netlify.com"
        echo "      2. Glissez-déposez myconfort-facturation-build.zip"
        echo "      3. Ou utilisez 'Deploy manually' → 'Choose folder' → Sélectionnez dist/"
    fi
else
    echo "   ⚠️  Dossier dist/ non trouvé"
    echo "   Lancez d'abord : npm run build"
fi

echo ""
echo "🔧 SOLUTION RAPIDE - NETLIFY CLI (Optionnel)"
echo ""
echo "   # Installation Netlify CLI (si pas installé)"
echo "   npm install -g netlify-cli"
echo ""
echo "   # Connexion et déploiement"
echo "   netlify login"
echo "   netlify deploy --prod --dir=dist"
echo ""

echo "📊 AVANTAGES DÉPLOIEMENT DIRECT :"
echo "   ✅ Pas besoin de configurer secrets GitHub"
echo "   ✅ Déploiement immédiat"
echo "   ✅ Interface Netlify simple"
echo "   ✅ Même résultat final"
echo ""

echo "🎯 FONCTIONNALITÉS DÉPLOYÉES :"
echo "   📱 Interface iPad optimisée avec boutons flottants"
echo "   💳 Système de paiement complet (6 méthodes)"
echo "   📄 Génération PDF dynamique"
echo "   🔄 Proxy N8N configuré automatiquement"
echo "   🎨 Navigation 7 étapes fluide"
echo ""

echo "🌐 APRÈS DÉPLOIEMENT :"
echo "   • Votre site sera accessible via une URL Netlify"
echo "   • Ex: https://myconfort-facturation.netlify.app"
echo "   • Vous pourrez configurer un domaine personnalisé"
echo ""

echo "💡 RECOMMANDATION :"
echo "   Utilisez le déploiement direct Netlify (étapes 1-2-3)"
echo "   C'est plus simple et tout aussi efficace !"
echo ""

echo "📁 FICHIERS PRÊTS POUR DÉPLOIEMENT :"
ls -la dist/ 2>/dev/null | head -10 || echo "   ⚠️ Lancez npm run build d'abord"
