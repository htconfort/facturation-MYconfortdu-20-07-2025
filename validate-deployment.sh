#!/bin/bash
# Script de validation complète avant déploiement
# Usage: ./validate-deployment.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[VALIDATE]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

log "🔍 Validation complète du projet MyConfort"

# Vérification des fichiers essentiels
log "📁 Vérification des fichiers de configuration..."

REQUIRED_FILES=(
    "package.json"
    "netlify.toml"
    ".env.example"
    "src/main.tsx"
    "src/App.tsx"
    "vite.config.ts"
    "tsconfig.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "✅ $file"
    else
        error "❌ $file manquant"
        exit 1
    fi
done

# Vérification des dépendances
log "📦 Vérification des dépendances..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Tests TypeScript
log "🔍 Vérification TypeScript..."
if npm run type-check; then
    success "✅ TypeScript OK"
else
    error "❌ Erreurs TypeScript"
    exit 1
fi

# Test de build
log "🔨 Test de build..."
if npm run build; then
    success "✅ Build réussi"
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "📊 Taille: $BUILD_SIZE"
else
    error "❌ Échec du build"
    exit 1
fi

# Vérification du contenu du build
log "🔍 Vérification du contenu du build..."
if [ -f "dist/index.html" ]; then
    success "✅ index.html présent"
else
    error "❌ index.html manquant"
    exit 1
fi

if [ -d "dist/assets" ]; then
    success "✅ Dossier assets présent"
    ASSETS_COUNT=$(find dist/assets -type f | wc -l)
    log "📊 $ASSETS_COUNT fichiers d'assets"
else
    warning "⚠️ Dossier assets manquant"
fi

# Vérification des variables d'environnement
log "🔧 Vérification des variables d'environnement..."
ENV_VARS=(
    "VITE_N8N_WEBHOOK_URL"
    "VITE_EMAILJS_SERVICE_ID"
    "VITE_EMAILJS_TEMPLATE_ID"
    "VITE_EMAILJS_PUBLIC_KEY"
)

ENV_FILE=".env.example"
for var in "${ENV_VARS[@]}"; do
    if grep -q "$var" "$ENV_FILE"; then
        success "✅ $var documenté"
    else
        warning "⚠️ $var non documenté dans .env.example"
    fi
done

# Vérification de la configuration Netlify
log "🌐 Vérification de la configuration Netlify..."
if grep -q "publish = \"dist\"" netlify.toml; then
    success "✅ Publish directory configuré"
else
    error "❌ Publish directory mal configuré"
    exit 1
fi

if grep -q "command = " netlify.toml; then
    success "✅ Build command configuré"
else
    error "❌ Build command manquant"
    exit 1
fi

# Vérification des redirections SPA
if grep -q "from = \"/\*\"" netlify.toml; then
    success "✅ Redirections SPA configurées"
else
    warning "⚠️ Redirections SPA manquantes"
fi

# Test du preview local
log "🚀 Test du preview local..."
npm run preview &
PREVIEW_PID=$!
sleep 5

if ps -p $PREVIEW_PID > /dev/null; then
    success "✅ Preview local démarré"
    kill $PREVIEW_PID
else
    warning "⚠️ Échec du preview local"
fi

# Vérification Git
log "📝 Vérification Git..."
if [ -n "$(git status --porcelain)" ]; then
    warning "⚠️ Modifications non commitées présentes"
    git status --short
else
    success "✅ Répertoire Git propre"
fi

# Rapport final
log "📊 Rapport de validation:"
echo "===================="
echo "✅ Fichiers de configuration : OK"
echo "✅ Dépendances : OK"
echo "✅ TypeScript : OK"
echo "✅ Build : OK ($BUILD_SIZE)"
echo "✅ Configuration Netlify : OK"
echo "===================="

success "🎉 Validation terminée - Prêt pour le déploiement !"
log "💡 Commandes suivantes :"
log "   ./deploy-netlify.sh preview  # Déploiement de test"
log "   ./deploy-netlify.sh production  # Déploiement production"
