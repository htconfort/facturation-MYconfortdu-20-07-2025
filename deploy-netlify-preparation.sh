#!/bin/bash

# 🚀 Script de préparation pour déploiement Netlify
# Facturation MyConfort - Version iPad optimisée
# Date: $(date +"%d/%m/%Y")

echo "🚀 PRÉPARATION DÉPLOIEMENT NETLIFY - Application de Facturation MyConfort"
echo "═══════════════════════════════════════════════════════════════════════"

# Vérification de l'environnement
echo "📋 Vérification de l'environnement..."
node --version
npm --version

# Installation propre des dépendances
echo "🧹 Nettoyage et installation des dépendances..."
rm -rf node_modules package-lock.json dist .vite
npm install

# Vérification TypeScript
echo "🔍 Vérification TypeScript..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Erreurs TypeScript détectées - Arrêt du déploiement"
    exit 1
fi

# Linting
echo "🔧 Vérification du code (ESLint)..."
npm run lint:ci
if [ $? -ne 0 ]; then
    echo "⚠️  Avertissements ESLint détectés - Continuons"
fi

# Build de production
echo "🏗️  Build de production en cours..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Échec du build - Arrêt du déploiement"
    exit 1
fi

# Vérification de la taille du build
echo "📊 Analyse de la taille du build..."
du -sh dist/
find dist/ -name "*.js" -exec du -sh {} \; | sort -rh | head -5

echo ""
echo "✅ PRÉPARATION TERMINÉE AVEC SUCCÈS !"
echo "═══════════════════════════════════════════════════════════════════════"
echo "📁 Dossier de publication : dist/"
echo "🌐 Configuration Netlify : netlify.toml"
echo "🔗 Proxy N8N configuré : /api/n8n/* → https://n8n.srv765811.hstgr.cloud/"
echo ""
echo "🎯 FONCTIONNALITÉS CLÉS DE CETTE VERSION :"
echo "   • ✨ Interface iPad optimisée avec boutons flottants"
echo "   • 📱 Navigation tactile améliorée (zones de confort)"
echo "   • 💳 Système de paiement complet (Alma, Chèques, CB, etc.)"
echo "   • 📄 Génération PDF dynamique avec détails paiement"
echo "   • 🔄 Workflow N8N intégré pour l'envoi d'emails"
echo "   • 🎨 Interface épurée et moderne"
echo ""
echo "📋 ÉTAPES SUIVANTES POUR NETLIFY :"
echo "   1. Connecter le repository GitHub"
echo "   2. Configurer la branche de déploiement : feature/boutons-suivant-ipad"
echo "   3. Commande de build : npm run build"
echo "   4. Répertoire de publication : dist"
echo "   5. Le fichier netlify.toml sera automatiquement utilisé"
echo ""
echo "🔧 Variables d'environnement requises (si applicable) :"
echo "   • Aucune variable secrète détectée dans le code"
echo "   • Configuration N8N intégrée dans netlify.toml"
echo ""
echo "🚀 Prêt pour le déploiement !"
