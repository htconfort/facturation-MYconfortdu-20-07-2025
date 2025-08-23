#!/bin/bash

# 🚀 SCRIPT DÉPLOIEMENT NETLIFY AUTOMATIQUE
# Application MyConfort - Facturation optimisée

echo "🚀 DÉPLOIEMENT NETLIFY - MYCONFORT"
echo "=================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'erreur
error_exit() {
    echo -e "${RED}❌ ERREUR: $1${NC}"
    exit 1
}

# Fonction de succès
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction d'info
info_msg() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Fonction d'alerte
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
info_msg "Étape 1: Vérification de l'environnement"
echo "----------------------------------------"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error_exit "Node.js n'est pas installé"
fi

NODE_VERSION=$(node -v)
info_msg "Node.js version: $NODE_VERSION"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error_exit "npm n'est pas installé"
fi

NPM_VERSION=$(npm -v)
info_msg "npm version: $NPM_VERSION"

# Vérifier Git
if ! command -v git &> /dev/null; then
    error_exit "Git n'est pas installé"
fi

success_msg "Environnement validé"

echo ""
info_msg "Étape 2: Vérification du repository"
echo "-----------------------------------"

# Vérifier si on est dans un repo Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error_exit "Pas dans un repository Git"
fi

# Vérifier la branche
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warning_msg "Vous n'êtes pas sur la branche 'main' (actuellement: $CURRENT_BRANCH)"
    read -p "Continuer quand même ? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        error_exit "Déploiement annulé"
    fi
fi

# Vérifier l'état Git
if ! git diff --quiet || ! git diff --cached --quiet; then
    warning_msg "Il y a des modifications non commitées"
    git status --short
    read -p "Commiter automatiquement ? (y/N): " commit_confirm
    if [[ $commit_confirm == [yY] ]]; then
        git add -A
        git commit -m "🚀 Préparation déploiement Netlify $(date '+%Y-%m-%d %H:%M')"
        success_msg "Modifications commitées"
    else
        error_exit "Veuillez commiter vos modifications d'abord"
    fi
fi

success_msg "Repository prêt"

echo ""
info_msg "Étape 3: Installation des dépendances"
echo "-------------------------------------"

# Nettoyage et installation propre
info_msg "Nettoyage node_modules et package-lock.json..."
rm -rf node_modules package-lock.json

info_msg "Installation des dépendances..."
if ! npm install; then
    error_exit "Échec de l'installation des dépendances"
fi

success_msg "Dépendances installées"

echo ""
info_msg "Étape 4: Build de production"
echo "----------------------------"

info_msg "Génération du build..."
if ! npm run build; then
    error_exit "Échec du build"
fi

# Vérifier que le dossier dist existe
if [ ! -d "dist" ]; then
    error_exit "Le dossier 'dist' n'a pas été créé"
fi

# Afficher la taille du build
BUILD_SIZE=$(du -sh dist | cut -f1)
info_msg "Taille du build: $BUILD_SIZE"

success_msg "Build généré avec succès"

echo ""
info_msg "Étape 5: Tests de validation"
echo "----------------------------"

# Test des fichiers critiques
if [ ! -f "dist/index.html" ]; then
    error_exit "index.html manquant dans dist/"
fi

if [ ! -f "dist/assets/index-*.js" ]; then
    error_exit "Fichiers JavaScript manquants dans dist/assets/"
fi

if [ ! -f "public/HT-Confort_Full_Green.png" ]; then
    error_exit "Logo HT Confort manquant"
fi

# Vérifier la taille du logo
LOGO_SIZE=$(wc -c < "public/HT-Confort_Full_Green.png")
if [ $LOGO_SIZE -gt 50000 ]; then
    warning_msg "Logo volumineux (${LOGO_SIZE} bytes). Optimisation recommandée."
fi

success_msg "Tests de validation passés"

echo ""
info_msg "Étape 6: Vérification de la configuration Netlify"
echo "-------------------------------------------------"

# Vérifier netlify.toml
if [ ! -f "netlify.toml" ]; then
    error_exit "netlify.toml manquant"
fi

# Vérifier les variables d'environnement locales
if [ -f ".env" ]; then
    info_msg "Fichier .env trouvé (pour développement)"
    if grep -q "VITE_N8N_WEBHOOK_URL" .env; then
        success_msg "Variable N8N configurée"
    else
        warning_msg "Variable N8N manquante dans .env"
    fi
fi

success_msg "Configuration Netlify validée"

echo ""
info_msg "Étape 7: Push vers GitHub"
echo "------------------------"

# Push vers GitHub
info_msg "Push vers GitHub..."
if ! git push origin main; then
    error_exit "Échec du push vers GitHub"
fi

success_msg "Code pushé vers GitHub"

echo ""
info_msg "Étape 8: Instructions finales"
echo "-----------------------------"

echo ""
echo "🎉 ${GREEN}PRÉPARATION TERMINÉE AVEC SUCCÈS !${NC}"
echo ""
echo "📋 ${BLUE}PROCHAINES ÉTAPES SUR NETLIFY:${NC}"
echo "1. Se connecter à https://netlify.com"
echo "2. 'New site from Git' → 'GitHub'"
echo "3. Sélectionner: htconfort/facturation-MYconfortdu-20-07-2025"
echo "4. Configurer:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - Node version: 18.19.0"
echo "5. Variables d'environnement:"
echo "   - VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/facture"
echo "   - VITE_ENV=production"
echo "   - NODE_VERSION=18.19.0"
echo ""
echo "📄 ${YELLOW}DOCUMENTATION:${NC}"
echo "- Guide complet: DEPLOIEMENT_NETLIFY_GUIDE.md"
echo "- Rapport final: RAPPORT_FINAL_PRODUCTION.md"
echo ""
echo "🧪 ${BLUE}TESTS DISPONIBLES:${NC}"
echo "- node test-logo-optimise.mjs"
echo "- node test-facture-finale-optimisee.mjs"
echo "- node test-visual-pdf.mjs"
echo ""
echo "🚀 ${GREEN}READY FOR PRODUCTION DEPLOYMENT!${NC}"
