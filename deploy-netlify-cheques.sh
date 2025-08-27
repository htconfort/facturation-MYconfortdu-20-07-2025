#!/bin/bash

# 🚀 Script de Déploiement Netlify - Facturation MyConfort
# Date: 27 août 2025
# Objectif: Déployer les nouvelles fonctionnalités des chèques à venir

echo "🎯 === DÉPLOIEMENT NETLIFY - CHÈQUES À VENIR ==="
echo ""

# 1. Vérification Node.js
echo "📋 1. Vérification de l'environnement..."
node --version
npm --version
echo ""

# 2. Installation des dépendances avec mémoire optimisée
echo "📦 2. Installation des dépendances (mode optimisé)..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm ci --only=production
echo ""

# 3. Build de production avec mémoire étendue
echo "🔨 3. Build de production..."
npm run build:mem
echo ""

# 4. Vérification du build
echo "✅ 4. Vérification du build..."
if [ -d "dist" ]; then
    echo "✓ Dossier dist créé avec succès"
    echo "✓ Taille du build: $(du -sh dist | cut -f1)"
    echo "✓ Fichiers principaux:"
    ls -la dist/ | head -10
else
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi
echo ""

# 5. Préparation des fichiers de configuration Netlify
echo "⚙️ 5. Configuration Netlify..."

# Création du fichier _redirects pour SPA
cat > dist/_redirects << 'EOF'
# Redirections pour Single Page Application
/*    /index.html   200

# Redirections spécifiques
/ipad    /index.html   200
/ipad/*  /index.html   200
EOF

# Création du fichier netlify.toml
cat > netlify.toml << 'EOF'
[build]
  publish = "dist"
  command = "npm run build:mem"

[build.environment]
  NODE_VERSION = "20.11.1"
  NPM_VERSION = "10.9.3"
  NODE_OPTIONS = "--max-old-space-size=4096"
  CI = "false"
  GENERATE_SOURCEMAP = "false"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev:mem"
  port = 5173
  publish = "dist"
  autoLaunch = false
EOF

echo "✓ Fichier netlify.toml créé"
echo "✓ Fichier _redirects créé"
echo ""

# 6. Validation des nouvelles fonctionnalités
echo "🔍 6. Validation des fonctionnalités chèques à venir..."

# Vérifier que les fichiers modifiés sont présents
files_to_check=(
    "dist/assets/index-*.js"
    "dist/index.html"
)

for file_pattern in "${files_to_check[@]}"; do
    if ls $file_pattern 1> /dev/null 2>&1; then
        echo "✓ Build contient: $file_pattern"
    else
        echo "⚠️  Attention: $file_pattern non trouvé"
    fi
done
echo ""

# 7. Instructions de déploiement
echo "🌐 7. Instructions de déploiement Netlify:"
echo ""
echo "Option A - Déploiement automatique (si configuré):"
echo "  → git push origin main (déjà fait)"
echo "  → Netlify détectera automatiquement les changements"
echo ""
echo "Option B - Déploiement manuel via CLI:"
echo "  → npm install -g netlify-cli"
echo "  → netlify login"
echo "  → netlify deploy --prod --dir=dist"
echo ""
echo "Option C - Déploiement par drag & drop:"
echo "  → Aller sur https://app.netlify.com"
echo "  → Glisser-déposer le dossier 'dist'"
echo ""

# 8. Vérifications post-déploiement
echo "🧪 8. Tests post-déploiement recommandés:"
echo ""
echo "  1. Accéder à l'application iPad"
echo "  2. Créer une facture complète"
echo "  3. Sélectionner 'Chèques à venir' (onglet jaune)"
echo "  4. Configurer 9 chèques"
echo "  5. Vérifier l'affichage à l'étape 7:"
echo "     - Mode: 'Chèque à venir'"
echo "     - Chèques à venir: '9 chèques de 186.00 €'"
echo "     - Montant total: '1674.00 €'"
echo "  6. Imprimer PDF et vérifier les informations"
echo ""

# 9. URLs de test
echo "🔗 9. URLs de test après déploiement:"
echo ""
echo "  • Page principale: https://[votre-site].netlify.app/"
echo "  • Application iPad: https://[votre-site].netlify.app/ipad"
echo "  • Test direct: https://[votre-site].netlify.app/ipad?step=facture"
echo ""

echo "🎉 === DÉPLOIEMENT PRÊT ==="
echo ""
echo "💡 Conseil: Testez d'abord avec 'netlify deploy' (sans --prod)"
echo "   puis déployez en production avec 'netlify deploy --prod --dir=dist'"
echo ""
echo "📞 Support: En cas de problème, vérifiez les logs Netlify"
echo "   dans la section 'Deploys' de votre dashboard"
echo ""

# Affichage des changements récents
echo "📋 Changements inclus dans ce déploiement:"
echo "  ✅ Correction sauvegarde chèques à venir (StepPaymentNoScroll)"
echo "  ✅ Affichage récapitulatif étape 7 (StepRecapIpad)"
echo "  ✅ Intégration PDF facture (pdfService)"
echo "  ✅ Guide d'implémentation complet"
echo ""
