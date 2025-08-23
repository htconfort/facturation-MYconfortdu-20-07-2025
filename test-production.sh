#!/bin/bash
# Script de test des fonctionnalités critiques après déploiement
# Usage: ./test-production.sh [URL]

set -e

# Configuration
SITE_URL=${1:-"https://your-site.netlify.app"}
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[TEST]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

log "🧪 Tests de production pour: $SITE_URL"

# Test 1: Accessibilité du site
log "🌐 Test d'accessibilité..."
if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200"; then
    success "✅ Site accessible"
else
    error "❌ Site inaccessible"
    exit 1
fi

# Test 2: Vérification des assets
log "📁 Test des assets..."
ASSETS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/assets/")
if [[ "$ASSETS_RESPONSE" == "200" || "$ASSETS_RESPONSE" == "403" ]]; then
    success "✅ Assets accessibles"
else
    warning "⚠️ Assets potentiellement manquants"
fi

# Test 3: Vérification du contenu HTML
log "📄 Test du contenu HTML..."
HTML_CONTENT=$(curl -s "$SITE_URL")
if echo "$HTML_CONTENT" | grep -q "MyConfort\|Facturation"; then
    success "✅ Contenu HTML correct"
else
    warning "⚠️ Contenu HTML potentiellement incorrect"
fi

# Test 4: Vérification des headers de sécurité
log "🔒 Test des headers de sécurité..."
HEADERS=$(curl -s -I "$SITE_URL")

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    success "✅ X-Frame-Options présent"
else
    warning "⚠️ X-Frame-Options manquant"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    success "✅ X-Content-Type-Options présent"
else
    warning "⚠️ X-Content-Type-Options manquant"
fi

# Test 5: Test des redirections SPA
log "🔄 Test des redirections SPA..."
SPA_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/some-fake-route")
if [[ "$SPA_RESPONSE" == "200" ]]; then
    success "✅ Redirections SPA fonctionnelles"
else
    warning "⚠️ Redirections SPA potentiellement défaillantes"
fi

# Test 6: Vérification HTTPS
log "🔐 Test HTTPS..."
if [[ "$SITE_URL" == https* ]]; then
    success "✅ HTTPS configuré"
else
    warning "⚠️ HTTPS non configuré"
fi

# Test 7: Test de performance basique
log "⚡ Test de performance..."
LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL")
LOAD_TIME_MS=$(echo "$LOAD_TIME * 1000" | bc -l | cut -d. -f1)

if (( $(echo "$LOAD_TIME < 3.0" | bc -l) )); then
    success "✅ Temps de chargement acceptable: ${LOAD_TIME_MS}ms"
else
    warning "⚠️ Temps de chargement élevé: ${LOAD_TIME_MS}ms"
fi

# Test 8: Vérification de la taille des assets
log "📊 Test de la taille des assets..."
PAGE_SIZE=$(curl -s "$SITE_URL" | wc -c)
PAGE_SIZE_KB=$((PAGE_SIZE / 1024))

if (( PAGE_SIZE_KB < 500 )); then
    success "✅ Taille de page acceptable: ${PAGE_SIZE_KB}KB"
else
    warning "⚠️ Taille de page élevée: ${PAGE_SIZE_KB}KB"
fi

# Rapport final
log "📊 Rapport des tests de production:"
echo "=================================="
echo "🌐 URL testée: $SITE_URL"
echo "⏱️ Temps de chargement: ${LOAD_TIME_MS}ms"
echo "📦 Taille de la page: ${PAGE_SIZE_KB}KB"
echo "=================================="

success "🎉 Tests de production terminés"

# Instructions pour les tests manuels
log "🔍 Tests manuels recommandés:"
echo "1. 📝 Créer une facture test"
echo "2. 🖨️ Tester l'impression HTML"
echo "3. 📧 Vérifier l'envoi d'email"
echo "4. 💳 Tester le paiement Alma"
echo "5. 📱 Vérifier la responsivité mobile"
echo "6. 🔄 Tester le mode livraison/emporter"

log "💡 Pour surveiller la production:"
echo "- Netlify Analytics: Dashboard > Analytics"
echo "- Logs: netlify logs"
echo "- Monitoring: Configurez des alertes Netlify"
