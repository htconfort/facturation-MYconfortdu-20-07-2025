#!/bin/bash
# Script maître de déploiement MyConfort vers Netlify
# Usage: ./deploy-master.sh [--validate-only] [--production] [--site-url URL]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATE_ONLY=false
PRODUCTION=false
SITE_URL=""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonctions d'affichage
log() { echo -e "${BLUE}[MASTER]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
info() { echo -e "${CYAN}[INFO]${NC} $1"; }
step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Parse des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --validate-only)
            VALIDATE_ONLY=true
            shift
            ;;
        --production)
            PRODUCTION=true
            shift
            ;;
        --site-url)
            SITE_URL="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --validate-only    Seulement valider, ne pas déployer"
            echo "  --production      Déploiement en production"
            echo "  --site-url URL    URL du site pour les tests post-déploiement"
            echo "  -h, --help        Afficher cette aide"
            exit 0
            ;;
        *)
            error "Option inconnue: $1"
            exit 1
            ;;
    esac
done

# Banner
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   🚀 MYCONFORT DEPLOYMENT                   ║${NC}"
echo -e "${PURPLE}║                     Kit de Déploiement                      ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

log "Configuration du déploiement:"
info "  • Validation seulement: $([ "$VALIDATE_ONLY" = true ] && echo "OUI" || echo "NON")"
info "  • Mode production: $([ "$PRODUCTION" = true ] && echo "OUI" || echo "NON")"
info "  • URL de test: ${SITE_URL:-"Non spécifiée"}"
echo ""

# Étape 1: Validation complète
step "🔍 ÉTAPE 1/4 - Validation complète du projet"
echo "=================================================="

if [ -f "$SCRIPT_DIR/validate-deployment.sh" ]; then
    if ./validate-deployment.sh; then
        success "✅ Validation réussie"
    else
        error "❌ Échec de la validation"
        exit 1
    fi
else
    error "❌ Script de validation manquant"
    exit 1
fi

# Si validation seulement, s'arrêter ici
if [ "$VALIDATE_ONLY" = true ]; then
    success "🎉 Validation terminée avec succès !"
    echo ""
    log "💡 Pour déployer, relancez sans --validate-only:"
    info "   $0 $([ "$PRODUCTION" = true ] && echo "--production")"
    exit 0
fi

echo ""

# Étape 2: Déploiement
step "🚀 ÉTAPE 2/4 - Déploiement vers Netlify"
echo "========================================="

DEPLOY_TYPE=$([ "$PRODUCTION" = true ] && echo "production" || echo "preview")

if [ -f "$SCRIPT_DIR/deploy-netlify.sh" ]; then
    if ./deploy-netlify.sh "$DEPLOY_TYPE"; then
        success "✅ Déploiement réussi"
    else
        error "❌ Échec du déploiement"
        exit 1
    fi
else
    error "❌ Script de déploiement manquant"
    exit 1
fi

echo ""

# Étape 3: Récupération de l'URL (si pas fournie)
if [ -z "$SITE_URL" ]; then
    step "🔗 ÉTAPE 3/4 - Récupération de l'URL du site"
    echo "============================================="
    
    if command -v netlify &> /dev/null; then
        if [ "$PRODUCTION" = true ]; then
            SITE_URL=$(netlify status --json | grep -o '"ssl_url":"[^"]*"' | cut -d'"' -f4 || echo "")
        else
            warning "⚠️ Preview URL non récupérable automatiquement"
            log "💡 Vérifiez les logs Netlify pour l'URL de preview"
        fi
        
        if [ -n "$SITE_URL" ]; then
            success "✅ URL récupérée: $SITE_URL"
        else
            warning "⚠️ URL non récupérée automatiquement"
            log "💡 Spécifiez l'URL avec --site-url pour les tests automatiques"
        fi
    else
        warning "⚠️ Netlify CLI non disponible"
    fi
    
    echo ""
fi

# Étape 4: Tests post-déploiement
step "🧪 ÉTAPE 4/4 - Tests post-déploiement"
echo "====================================="

if [ -n "$SITE_URL" ] && [ -f "$SCRIPT_DIR/test-production.sh" ]; then
    if ./test-production.sh "$SITE_URL"; then
        success "✅ Tests post-déploiement réussis"
    else
        warning "⚠️ Certains tests ont échoué - vérifiez manuellement"
    fi
else
    if [ -z "$SITE_URL" ]; then
        warning "⚠️ URL non disponible - tests automatiques sautés"
    else
        warning "⚠️ Script de test manquant"
    fi
    
    log "💡 Tests manuels recommandés:"
    info "   1. Vérifiez l'accessibilité du site"
    info "   2. Testez les fonctionnalités critiques"
    info "   3. Vérifiez les variables d'environnement"
fi

echo ""

# Rapport final
step "📊 RAPPORT FINAL"
echo "================"

echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo ""

if [ "$PRODUCTION" = true ]; then
    info "🌟 PRODUCTION DEPLOY"
    [ -n "$SITE_URL" ] && info "🌐 URL: $SITE_URL"
else
    info "🔍 PREVIEW DEPLOY"
    info "💡 Vérifiez les logs Netlify pour l'URL de preview"
fi

echo ""
log "📋 Prochaines étapes recommandées:"
echo "1. 🔍 Vérifier le site dans un navigateur"
echo "2. 🧪 Tester les fonctionnalités critiques:"
echo "   • Création de facture"
echo "   • Génération PDF"
echo "   • Envoi email"
echo "   • Impression HTML"
echo "   • Paiement Alma"
echo "3. 📊 Surveiller les métriques Netlify"
echo "4. 📞 Informer l'équipe du déploiement"

if [ "$PRODUCTION" = true ]; then
    echo ""
    warning "🚨 ATTENTION: Déploiement en PRODUCTION"
    info "   • Surveillez les logs d'erreur"
    info "   • Préparez un rollback si nécessaire"
    info "   • Documentez ce déploiement"
fi

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    ✅ DÉPLOIEMENT RÉUSSI                    ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

success "🎊 Kit de déploiement MyConfort exécuté avec succès !"
