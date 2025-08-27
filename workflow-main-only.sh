#!/bin/bash

# 🎯 WORKFLOW MAIN-ONLY - MY COMFORT FACTURATION
# Script de confirmation: toutes les opérations se font sur la branche main

echo "🔍 VÉRIFICATION WORKFLOW MAIN-ONLY"
echo "=================================="

# Vérifier branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Branche actuelle: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERREUR: Vous n'êtes pas sur la branche main !"
    echo "➡️  Passage automatique sur main..."
    git checkout main
    echo "✅ Maintenant sur la branche main"
else
    echo "✅ Parfait ! Vous êtes sur la branche main"
fi

# Vérifier l'état
echo ""
echo "📊 ÉTAT DU REPOSITORY"
echo "===================="
git status --short

# Vérifier les fonctionnalités signature
echo ""
echo "🖊️  VÉRIFICATION SIGNATURE"
echo "=========================="
if [ -f "src/components/SignaturePadView.tsx" ]; then
    echo "✅ SignaturePadView.tsx présent"
else
    echo "❌ SignaturePadView.tsx manquant"
fi

if [ -f "src/services/signatureService.ts" ]; then
    echo "✅ signatureService.ts présent"
else
    echo "❌ signatureService.ts manquant"
fi

# Vérifier les optimisations
echo ""
echo "⚡ VÉRIFICATION OPTIMISATIONS"
echo "============================"
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "✅ Node.js version pinée: $NODE_VERSION"
else
    echo "❌ .nvmrc manquant"
fi

if [ -f ".vscode/settings.json" ]; then
    echo "✅ VS Code optimisé"
else
    echo "❌ Configuration VS Code manquante"
fi

if [ -f "src/services/pdfServiceOptimized.ts" ]; then
    echo "✅ Services PDF optimisés disponibles"
else
    echo "❌ Services PDF optimisés manquants"
fi

# Vérifier le serveur de développement
echo ""
echo "🚀 SERVEUR DE DÉVELOPPEMENT"
echo "=========================="
if pgrep -f "vite" > /dev/null; then
    echo "✅ Serveur Vite actif sur http://localhost:5173/"
else
    echo "⚠️  Serveur Vite non actif"
    echo "💡 Lancez: npm run dev:mem"
fi

# Branches existantes
echo ""
echo "🌿 BRANCHES DISPONIBLES"
echo "======================"
git branch -a | grep -v "remotes/origin/backup"

echo ""
echo "🎯 RÈGLE PRINCIPALE:"
echo "==================="
echo "✅ TOUTES les opérations se font sur la branche 'main'"
echo "✅ Plus de branches de fonctionnalités séparées"
echo "✅ Développement linéaire et simplifié"
echo ""
echo "📌 Application MY COMFORT prête pour le développement optimisé !"
