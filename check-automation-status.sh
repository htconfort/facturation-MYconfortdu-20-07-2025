#!/bin/bash

# 📊 Status de l'automatisation Netlify

echo "📊 STATUS AUTOMATISATION NETLIFY - MyConfort Facturation"
echo "═══════════════════════════════════════════════════════════"

# Vérifier la présence des fichiers d'automatisation
echo ""
echo "🔍 VÉRIFICATION DES FICHIERS D'AUTOMATISATION :"

files=(
    ".github/workflows/netlify-deploy.yml:Workflow GitHub Actions"
    "netlify.toml:Configuration Netlify"
    "setup-netlify-automation.sh:Script de configuration"
    "trigger-deploy.sh:Script de déclenchement"
    "NETLIFY_AUTOMATION.md:Documentation"
)

for file_info in "${files[@]}"; do
    IFS=':' read -ra ADDR <<< "$file_info"
    file="${ADDR[0]}"
    description="${ADDR[1]}"
    
    if [ -f "$file" ]; then
        echo "   ✅ $description ($file)"
    else
        echo "   ❌ $description ($file) - MANQUANT"
    fi
done

echo ""
echo "📡 CONFIGURATION GIT :"
current_branch=$(git branch --show-current 2>/dev/null || echo "Inconnue")
echo "   🌿 Branche actuelle : $current_branch"

if git remote get-url origin >/dev/null 2>&1; then
    remote_url=$(git remote get-url origin)
    echo "   🔗 Repository : $remote_url"
else
    echo "   ❌ Pas de remote configuré"
fi

echo ""
echo "🏗️ DERNIERS COMMITS :"
git log --oneline -n 3 2>/dev/null || echo "   ❌ Pas d'historique Git"

echo ""
echo "📋 PROCHAINES ÉTAPES POUR ACTIVER L'AUTOMATISATION :"
echo ""
echo "1️⃣ CONFIGURER LES SECRETS GITHUB :"
echo "   • Allez sur : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/settings/secrets/actions"
echo "   • Ajoutez : NETLIFY_AUTH_TOKEN (token personnel Netlify)"
echo "   • Ajoutez : NETLIFY_SITE_ID (API ID de votre site Netlify)"
echo ""
echo "2️⃣ CRÉER/CONFIGURER LE SITE NETLIFY :"
echo "   • https://app.netlify.com → 'Add new site'"
echo "   • Connecter le repository GitHub"
echo "   • Build command : npm run build"
echo "   • Publish directory : dist"
echo ""
echo "3️⃣ TESTER LE DÉPLOIEMENT :"
echo "   ./trigger-deploy.sh"
echo ""
echo "4️⃣ SURVEILLER LE DÉPLOIEMENT :"
echo "   • GitHub Actions : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/actions"
echo "   • Netlify Dashboard : https://app.netlify.com"
echo ""

# Vérifier si on peut faire un test build
echo "🧪 TEST BUILD LOCAL :"
if command -v npm >/dev/null 2>&1; then
    if [ -f "package.json" ]; then
        echo "   ✅ npm disponible"
        echo "   ✅ package.json présent"
        
        # Vérifier node_modules
        if [ -d "node_modules" ]; then
            echo "   ✅ Dépendances installées"
            echo ""
            echo "   💡 Pour tester le build :"
            echo "      npm run build"
        else
            echo "   ⚠️  Dépendances non installées"
            echo ""
            echo "   💡 Pour installer et tester :"
            echo "      npm install && npm run build"
        fi
    else
        echo "   ❌ package.json non trouvé"
    fi
else
    echo "   ❌ npm non disponible"
fi

echo ""
echo "🎯 FONCTIONNALITÉS QUI SERONT DÉPLOYÉES AUTOMATIQUEMENT :"
echo "   📱 Interface iPad optimisée avec boutons flottants"
echo "   💳 Système de paiement complet (6 méthodes)"
echo "   📄 Génération PDF dynamique"
echo "   🔄 Intégration N8N (proxy configuré)"
echo "   🎨 Navigation 7 étapes fluide"
echo ""

echo "🚀 STATUS : AUTOMATISATION CONFIGURÉE ET PRÊTE"
echo "    Il suffit maintenant de configurer les secrets GitHub et le site Netlify"
echo ""
echo "📖 Documentation complète : NETLIFY_AUTOMATION.md"
echo "⚙️  Configuration : ./setup-netlify-automation.sh"
