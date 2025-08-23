#!/bin/bash

# 🚀 Script de mise à jour déploiement Netlify
# Force le redéploiement avec les dernières modifications

echo "🚀 MISE À JOUR DÉPLOIEMENT NETLIFY - MyConfort"
echo "=============================================="

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction d'erreur
error_exit() {
    echo -e "${RED}❌ Erreur: $1${NC}" >&2
    exit 1
}

# Fonction de succès
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction d'info
info_msg() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Vérification de l'environnement
info_msg "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    error_exit "Node.js n'est pas installé"
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    error_exit "npm n'est pas installé"
fi

# Vérifier Git
if ! command -v git &> /dev/null; then
    error_exit "Git n'est pas installé"
fi

success_msg "Environnement vérifié"

# 2. Vérification du dépôt Git
info_msg "Vérification du dépôt Git..."

if [ ! -d ".git" ]; then
    error_exit "Pas un dépôt Git"
fi

# Vérifier qu'on est sur main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error_exit "Vous devez être sur la branche main pour déployer"
fi

# Vérifier qu'il n'y a pas de modifications non commitées
if [ -n "$(git status --porcelain)" ]; then
    error_exit "Il y a des modifications non commitées. Commitez d'abord."
fi

success_msg "Dépôt Git vérifié"

# 3. Installation des dépendances
info_msg "Installation des dépendances..."
npm ci || error_exit "Échec de l'installation des dépendances"
success_msg "Dépendances installées"

# 4. Nettoyage et build
info_msg "Nettoyage du cache..."
npm run clean 2>/dev/null || true
rm -rf dist/ || true

info_msg "Build de production..."
npm run build || error_exit "Échec du build"
success_msg "Build réussi"

# 5. Test de production local
info_msg "Test de production local..."
timeout 10s npm run preview &>/dev/null || true
success_msg "Test de production terminé"

# 6. Vérification des fichiers critiques
info_msg "Vérification des fichiers critiques..."

CRITICAL_FILES=(
    "dist/index.html"
    "dist/assets"
    "package.json"
    "netlify.toml"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        error_exit "Fichier critique manquant: $file"
    fi
done

success_msg "Fichiers critiques vérifiés"

# 7. Mise à jour du timestamp pour forcer le redéploiement
info_msg "Mise à jour du timestamp de déploiement..."
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
echo "# Dernière mise à jour: $TIMESTAMP" > DEPLOYMENT_TIMESTAMP.txt

# 8. Commit de la mise à jour si nécessaire
if [ -n "$(git status --porcelain)" ]; then
    info_msg "Commit de la mise à jour..."
    git add .
    git commit -m "🔄 DEPLOYMENT UPDATE: Force redeploy $(date -u +"%Y-%m-%d %H:%M")"
fi

# 9. Push vers GitHub (déclenche Netlify)
info_msg "Push vers GitHub pour déclencher Netlify..."
git push origin main || error_exit "Échec du push"

success_msg "Push réussi - Déploiement Netlify en cours"

# 10. Informations finales
echo ""
echo "📊 INFORMATIONS DE DÉPLOIEMENT"
echo "=============================="
echo "🕒 Timestamp: $TIMESTAMP"
echo "🌿 Branche: main"
echo "🔗 Commit: $(git rev-parse --short HEAD)"
echo "📝 Message: $(git log -1 --pretty=format:'%s')"
echo ""
echo "🔗 Surveillez le déploiement sur:"
echo "   https://app.netlify.com/sites/[votre-site]/deploys"
echo ""
echo "🎯 Une fois déployé, testez:"
echo "   - Bouton impression (step 7)"
echo "   - Affichage remises"
echo "   - Synchronisation livraison/emporter"
echo "   - Interface Alma"
echo ""

success_msg "Mise à jour déployée avec succès!"
