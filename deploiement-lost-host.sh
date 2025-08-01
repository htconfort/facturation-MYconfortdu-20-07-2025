#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT AUTOMATIQUE - LOST HOST
# Déploie l'application MyConfort sur une plateforme d'hébergement public

echo "🌐 DÉPLOIEMENT MYCONFORT - ACCÈS VISUEL PUBLIC"
echo "=============================================="

# Vérification du build
if [ ! -d "dist" ]; then
    echo "📦 Build de production..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors du build"
        exit 1
    fi
fi

echo ""
echo "🎯 Choisissez votre plateforme d'hébergement :"
echo "1) Vercel (Recommandé - Ultra-rapide)"
echo "2) Surge.sh (Ultra-simple)"
echo "3) Netlify Drop (Drag & Drop)"
echo "4) GitHub Pages"
echo ""

read -p "Votre choix (1-4) : " choice

case $choice in
    1)
        echo "🚀 Déploiement Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installation Vercel CLI..."
            npm install -g vercel
        fi
        echo "🔐 Connectez-vous à Vercel si ce n'est pas déjà fait"
        vercel --prod
        ;;
    2)
        echo "⚡ Déploiement Surge.sh..."
        if ! command -v surge &> /dev/null; then
            echo "📦 Installation Surge..."
            npm install -g surge
        fi
        cd dist
        surge
        ;;
    3)
        echo "📂 Préparation pour Netlify Drop..."
        if [ ! -f "myconfort-netlify-drop.zip" ]; then
            echo "📦 Création du ZIP pour Netlify..."
            cd dist
            zip -r ../myconfort-netlify-drop.zip .
            cd ..
        fi
        echo "✅ Fichier ZIP créé : myconfort-netlify-drop.zip"
        echo "🌐 Allez sur https://app.netlify.com/drop"
        echo "📁 Glissez-déposez le fichier myconfort-netlify-drop.zip"
        ;;
    4)
        echo "📚 Déploiement GitHub Pages..."
        if ! command -v gh-pages &> /dev/null; then
            echo "📦 Installation gh-pages..."
            npm install -g gh-pages
        fi
        gh-pages -d dist
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ DÉPLOIEMENT TERMINÉ !"
echo "🌐 Votre application est maintenant accessible publiquement"
echo "📱 Compatible iPad et tous appareils mobiles"
echo ""
echo "📋 FONCTIONNALITÉS DISPONIBLES :"
echo "  - ✅ Création de factures optimisée iPad"
echo "  - ✅ Gestion clients/produits"
echo "  - ✅ Aperçu PDF en temps réel"
echo "  - ✅ Interface tactile friendly"
echo "  - ✅ Saisie numérique optimisée"
echo "  - ✅ Envoi via N8N (si configuré)"
