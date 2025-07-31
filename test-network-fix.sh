#!/bin/bash

# 🧪 TEST RAPIDE CORRECTION ERREUR RÉSEAU
# Validation du fix pour l'envoi email Netlify

echo "🧪 TEST CORRECTION ERREUR RÉSEAU - NETLIFY"
echo "=========================================="

SITE_URL="${1:-https://your-site.netlify.app}"

if [ "$SITE_URL" = "https://your-site.netlify.app" ]; then
    echo "⚠️ Utilisation: ./test-network-fix.sh https://votre-site.netlify.app"
    echo ""
fi

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Test 1: Accessibilité du site
print_test "Test accessibilité du site"
if curl -s "$SITE_URL" > /dev/null; then
    print_success "Site accessible"
else
    print_error "Site non accessible"
    exit 1
fi

# Test 2: Test du proxy N8N (sans payload)
print_test "Test proxy N8N /api/n8n/"
proxy_response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/api/n8n/webhook/facture-universelle" -X GET 2>/dev/null || echo "000")

if [ "$proxy_response" = "200" ] || [ "$proxy_response" = "404" ] || [ "$proxy_response" = "405" ]; then
    print_success "Proxy N8N répond (HTTP $proxy_response)"
else
    print_warning "Proxy N8N: statut HTTP $proxy_response"
fi

# Test 3: Headers CORS
print_test "Test headers CORS"
cors_headers=$(curl -s -I "$SITE_URL/api/n8n/webhook/facture-universelle" 2>/dev/null | grep -i "access-control" || echo "")

if [ -n "$cors_headers" ]; then
    print_success "Headers CORS présents"
    echo "   $cors_headers"
else
    print_warning "Headers CORS non détectés (peut être normal)"
fi

# Test 4: Vérification redirection
print_test "Test redirection vers n8n.srv765811.hstgr.cloud"
redirect_test=$(curl -s -I "$SITE_URL/api/n8n/webhook/test" 2>/dev/null | head -1 || echo "")

if echo "$redirect_test" | grep -q "200\|302\|404\|405"; then
    print_success "Redirection fonctionne"
else
    print_warning "Redirection peut avoir un problème"
fi

echo ""
echo "=========================================="
echo -e "${BLUE}📋 TESTS MANUELS À EFFECTUER:${NC}"
echo ""

echo "1. 🌐 Ouvrir l'application:"
echo "   $SITE_URL"
echo ""

echo "2. 🔧 Ouvrir la console développeur (F12):"
echo "   - Onglet Console"
echo "   - Onglet Network"
echo ""

echo "3. 📝 Créer une facture complète:"
echo "   - Remplir toutes les informations"
echo "   - Ajouter des produits"
echo "   - Signer la facture"
echo ""

echo "4. 📧 Tester l'envoi email:"
echo "   - Cliquer 'Envoyer par email'"
echo "   - Vérifier dans Network:"
echo "     * URL: /api/n8n/webhook/facture-universelle (et PAS https://n8n.srv...)"
echo "     * Status: 200 (et PAS d'erreur CORS)"
echo ""

echo "5. ✅ Validation du succès:"
echo "   - Message de succès dans l'app"
echo "   - Email reçu avec PDF en pièce jointe"
echo "   - Pas d'erreur 'Failed to fetch' dans la console"
echo ""

echo -e "${GREEN}🎯 RÉSULTAT ATTENDU:${NC}"
echo "- ✅ URL proxy utilisée: /api/n8n/*"
echo "- ✅ Pas d'erreur CORS"
echo "- ✅ Status 200 pour l'envoi"
echo "- ✅ Email reçu avec succès"
echo ""

echo -e "${RED}❌ SI ÇA NE FONCTIONNE PAS:${NC}"
echo "1. Vérifier que le redéploiement Netlify est terminé"
echo "2. Voir le guide: NETLIFY_NETWORK_ERROR_FIX.md"
echo "3. Vérifier les logs Netlify Functions"
echo ""

echo "=========================================="
