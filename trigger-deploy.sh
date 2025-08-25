#!/bin/bash

# 🚀 Déclencheur de déploiement automatique Netlify
# Ce script commit et push pour déclencher le déploiement automatique

echo "🚀 DÉCLENCHEMENT DÉPLOIEMENT AUTOMATIQUE NETLIFY"
echo "══════════════════════════════════════════════════"

# Vérifier s'il y a des changements
if [[ -z $(git status --porcelain) ]]; then
    echo "📝 Aucun changement détecté. Création d'un commit de déploiement..."
    
    # Mettre à jour la date dans le DEPLOYMENT_GUIDE
    sed -i.bak "s/Dernière mise à jour : .*/Dernière mise à jour : $(date +'%d\/%m\/%Y à %H:%M')/" DEPLOYMENT_GUIDE.md 2>/dev/null || true
    rm -f DEPLOYMENT_GUIDE.md.bak 2>/dev/null || true
    
    git add DEPLOYMENT_GUIDE.md
    git commit -m "trigger: Déploiement automatique $(date +'%d/%m/%Y %H:%M')

🚀 Mise à jour automatique de l'application
📱 Interface iPad optimisée
💳 Système de paiement complet
🔄 Intégration N8N fonctionnelle"
else
    echo "📝 Changements détectés. Ajout et commit..."
    git add -A
    git commit -m "feat: Mise à jour application - Déploiement $(date +'%d/%m/%Y %H:%M')

✨ Nouvelles fonctionnalités et corrections
📱 Interface iPad optimisée avec boutons flottants
💳 Système de paiement complet (Alma, Chèques, CB, etc.)
🔄 Workflow N8N intégré
🚀 Déploiement automatique configuré"
fi

echo ""
echo "📡 Push vers GitHub (déclenchera le déploiement automatique)..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PUSH RÉUSSI !"
    echo "🔄 Le déploiement automatique va se déclencher dans quelques secondes..."
    echo ""
    echo "📊 SUIVI DU DÉPLOIEMENT :"
    echo "   • GitHub Actions : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/actions"
    echo "   • Netlify Dashboard : https://app.netlify.com"
    echo ""
    echo "⏱️  Temps estimé : 2-4 minutes"
    echo "🌐 Le site sera automatiquement mis à jour une fois terminé"
    echo ""
    echo "🎯 FONCTIONNALITÉS DÉPLOYÉES :"
    echo "   ✅ Interface iPad avec boutons flottants optimisés"
    echo "   ✅ Système de paiement complet (6 méthodes)"
    echo "   ✅ Génération PDF dynamique"
    echo "   ✅ Intégration N8N pour emails automatiques"
    echo "   ✅ Navigation 7 étapes fluide"
    echo ""
else
    echo "❌ ERREUR lors du push"
    echo "Vérifiez votre connexion et les permissions GitHub"
    exit 1
fi
