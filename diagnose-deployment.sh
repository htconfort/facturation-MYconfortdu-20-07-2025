#!/bin/bash

# 🔍 Diagnostic du déploiement Netlify

echo "🔍 DIAGNOSTIC DÉPLOIEMENT NETLIFY"
echo "════════════════════════════════════"

echo ""
echo "📊 STATUT REPOSITORY :"
echo "   Repository : $(git remote get-url origin)"
echo "   Branche : $(git branch --show-current)"
echo "   Dernier commit : $(git log --oneline -n 1)"

echo ""
echo "🔧 VÉRIFICATION FICHIERS AUTOMATISATION :"

# Vérifier les fichiers clés
files=(
    ".github/workflows/netlify-deploy.yml"
    "netlify.toml"
    "package-lock.json"
    "package.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file présent"
    else
        echo "   ❌ $file MANQUANT"
    fi
done

echo ""
echo "📋 WORKFLOW GITHUB ACTIONS :"
echo "   URL à vérifier : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/actions"
echo ""
echo "🔍 CAUSES POSSIBLES DU PROBLÈME :"
echo ""

echo "1️⃣ SECRETS GITHUB MANQUANTS"
echo "   Vérifiez : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/settings/secrets/actions"
echo "   Secrets requis :"
echo "   • NETLIFY_AUTH_TOKEN"
echo "   • NETLIFY_SITE_ID"
echo ""

echo "2️⃣ SITE NETLIFY NON CRÉÉ"
echo "   Allez sur : https://app.netlify.com"
echo "   Créez un nouveau site depuis GitHub"
echo "   Repository : htconfort/facturation-MYconfortdu-20-07-2025"
echo "   Branche : feature/boutons-suivant-ipad"
echo ""

echo "3️⃣ GITHUB ACTIONS DÉSACTIVÉ"
echo "   Vérifiez : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/settings/actions"
echo "   Activez 'Allow all actions and reusable workflows'"
echo ""

echo "4️⃣ WORKFLOW NON DÉCLENCHÉ"
echo "   Le workflow se déclenche sur :"
echo "   • Push vers main ou feature/boutons-suivant-ipad"
echo "   • Pull Request vers main"
echo ""

echo "🚀 SOLUTIONS RAPIDES :"
echo ""

echo "Solution A : DÉPLOIEMENT NETLIFY DIRECT"
echo "   1. Allez sur https://app.netlify.com"
echo "   2. 'Add new site' → 'Import an existing project'"
echo "   3. Connectez GitHub → Sélectionnez le repository"
echo "   4. Configuration :"
echo "      - Branch: feature/boutons-suivant-ipad"
echo "      - Build command: npm run build"
echo "      - Publish directory: dist"
echo "   5. Déployez !"
echo ""

echo "Solution B : FORCER REDÉCLENCHEMENT GITHUB ACTIONS"
echo "   git commit --allow-empty -m 'trigger: Force déploiement GitHub Actions'"
echo "   git push"
echo ""

echo "Solution C : BUILD MANUEL + UPLOAD"
echo "   npm run build"
echo "   # Puis uploadez le dossier dist/ manuellement sur Netlify"
echo ""

echo "🔗 LIENS UTILES :"
echo "   • GitHub Actions : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/actions"
echo "   • Netlify Dashboard : https://app.netlify.com"
echo "   • Settings GitHub : https://github.com/htconfort/facturation-MYconfortdu-20-07-2025/settings"
echo ""

echo "💡 PROCHAINE ÉTAPE RECOMMANDÉE :"
echo "   1. Vérifiez d'abord GitHub Actions (lien ci-dessus)"
echo "   2. Si pas d'exécution → Configurez les secrets ou créez le site Netlify"
echo "   3. Si échec d'exécution → Consultez les logs pour diagnostiquer"
echo ""

echo "🎯 POUR TESTER RAPIDEMENT :"
echo "   ./trigger-deploy.sh"
echo "   Ou utilisez la Solution A pour un déploiement Netlify direct"
