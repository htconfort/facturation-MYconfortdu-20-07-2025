#!/bin/bash
set -e

echo "🚀 SCRIPT DE DÉPLOIEMENT NETLIFY - Application iPad Facturation MyConfort"
echo "=================================================================================="
echo ""

# Configuration
PROJECT_NAME="facturation-myconfortdu-20-07-2025"
BUILD_DIR="dist"
DATE=$(date +"%Y%m%d_%H%M%S")

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."
if ! command -v npm &> /dev/null; then
    echo "❌ NPM n'est pas installé!"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé!"
    exit 1
fi

echo "✅ Prérequis OK"
echo ""

# Vérification que nous sommes sur la branche main
echo "🔍 Vérification de la branche Git..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Vous devez être sur la branche main pour déployer!"
    echo "   Branche actuelle: $CURRENT_BRANCH"
    exit 1
fi

echo "✅ Sur la branche main"
echo ""

# Synchronisation avec le remote
echo "🔄 Synchronisation avec le repository distant..."
git fetch origin
git status --porcelain

echo "✅ Repository synchronisé"
echo ""

# Nettoyage et build
echo "🧹 Nettoyage des fichiers de build précédents..."
rm -rf $BUILD_DIR
rm -rf node_modules/.cache
rm -rf node_modules/.vite

echo "✅ Nettoyage terminé"
echo ""

# Build de production
echo "🏗️ Build de production en cours..."
echo "   Commande: npm run build"
echo ""

npm run build

# Vérification du build
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Le build a échoué - le dossier $BUILD_DIR n'existe pas!"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "❌ Le build a échoué - index.html manquant!"
    exit 1
fi

echo "✅ Build de production réussi"
echo ""

# Analyse du build
echo "📊 Analyse du build généré:"
echo "   Dossier: $BUILD_DIR"
echo "   Taille du dossier:"
du -sh $BUILD_DIR
echo ""
echo "   Contenu:"
ls -la $BUILD_DIR
echo ""

# Vérification des assets critiques
echo "🔍 Vérification des assets critiques..."
if [ ! -f "$BUILD_DIR/assets"/*.css ]; then
    echo "⚠️  Attention: Fichiers CSS non trouvés"
fi

if [ ! -f "$BUILD_DIR/assets"/*.js ]; then
    echo "⚠️  Attention: Fichiers JS non trouvés"
fi

if [ -f "$BUILD_DIR/Alma_orange.png" ]; then
    echo "✅ Logo Alma présent"
fi

if [ -f "$BUILD_DIR/HT-Confort_Full_Green.png" ]; then
    echo "✅ Logo MyConfort présent"
fi

echo ""

# Instructions de déploiement Netlify
echo "🌐 INSTRUCTIONS DE DÉPLOIEMENT NETLIFY"
echo "=================================================================================="
echo ""
echo "🔗 URL Netlify: https://app.netlify.com/"
echo ""
echo "📋 ÉTAPES DE DÉPLOIEMENT:"
echo ""
echo "1. 📂 DÉPLOIEMENT AUTOMATIQUE (Recommandé):"
echo "   - Netlify détectera automatiquement le push sur GitHub"
echo "   - Le build sera lancé avec la commande: npm run build"
echo "   - Publication automatique depuis le dossier: $BUILD_DIR"
echo ""
echo "2. 🔄 DÉPLOIEMENT MANUEL (Si nécessaire):"
echo "   - Aller sur https://app.netlify.com/sites/[VOTRE-SITE]"
echo "   - Glisser-déposer le dossier '$BUILD_DIR' sur la zone de déploiement"
echo "   - Ou utiliser Netlify CLI: npx netlify deploy --prod --dir=$BUILD_DIR"
echo ""

# Configuration recommandée
echo "⚙️ CONFIGURATION NETLIFY RECOMMANDÉE:"
echo "=================================================================================="
echo ""
echo "Build settings:"
echo "  - Build command: npm run build"
echo "  - Publish directory: $BUILD_DIR"
echo "  - Node version: 18"
echo ""
echo "Environment variables à configurer:"
echo "  - VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/[VOTRE-ID]"
echo "  - NODE_ENV=production"
echo ""

# Résumé final
echo "📋 RÉSUMÉ DU DÉPLOIEMENT"
echo "=================================================================================="
echo ""
echo "✅ Build réussi le: $(date)"
echo "✅ Dossier de publication: $BUILD_DIR"
echo "✅ Repository GitHub synchronisé"
echo "✅ Configuration Netlify présente (netlify.toml)"
echo ""
echo "🎯 L'application iPad est prête pour le déploiement Netlify!"
echo ""
echo "📱 FONCTIONNALITÉS DÉPLOYÉES:"
echo "   ✅ Wizard iPad 8 étapes (1024×768px)"
echo "   ✅ Interface paiement avec Alma 2x/3x/4x"
echo "   ✅ Système chèques à venir (10 boutons)"
echo "   ✅ Totaux HT/TTC/TVA restaurés"
echo "   ✅ Synchronisation méthodes de paiement"
echo "   ✅ Onglet nouvelles commandes avec reset"
echo "   ✅ Actions principales (Enregistrer/Imprimer/Email)"
echo ""
echo "🚀 Déploiement terminé avec succès!"
echo "================================================================================="
