#!/bin/bash

# 🧪 SCRIPT DE TEST POST-DÉPLOIEMENT NETLIFY
# MyConfort Facturation - Validation production

echo "🧪 TESTS POST-DÉPLOIEMENT NETLIFY"
echo "=================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# URL du site (à modifier après déploiement)
SITE_URL="${1:-https://your-site.netlify.app}"

if [ "$SITE_URL" = "https://your-site.netlify.app" ]; then
    echo -e "${YELLOW}⚠️ Utilisation: ./test-post-deploy.sh https://votre-site.netlify.app${NC}"
    echo ""
fi

print_test() {
    echo -e "${BLUE}🔍 Test: $1${NC}"
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
print_test "Accessibilité du site"
if curl -s "$SITE_URL" > /dev/null; then
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
    if [ "$response_code" = "200" ]; then
        print_success "Site accessible (HTTP $response_code)"
    else
        print_error "Erreur HTTP $response_code"
    fi
else
    print_error "Site non accessible"
fi

# Test 2: Vérification du contenu HTML
print_test "Contenu HTML principal"
content=$(curl -s "$SITE_URL")
if echo "$content" | grep -q "MyConfort\|Facturation"; then
    print_success "Contenu principal détecté"
else
    print_warning "Contenu principal non détecté"
fi

# Test 3: Assets statiques
print_test "Assets CSS et JS"
if echo "$content" | grep -q "assets.*\.css"; then
    print_success "Fichier CSS trouvé"
else
    print_error "Fichier CSS manquant"
fi

if echo "$content" | grep -q "assets.*\.js"; then
    print_success "Fichier JS trouvé"
else
    print_error "Fichier JS manquant"
fi

# Test 4: Redirection SPA
print_test "Redirection SPA (Single Page Application)"
spa_test=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/nonexistent-page")
if [ "$spa_test" = "200" ]; then
    print_success "Redirection SPA fonctionne"
else
    print_warning "Redirection SPA peut avoir un problème (HTTP $spa_test)"
fi

# Test 5: Headers de sécurité
print_test "Headers de sécurité"
headers=$(curl -s -I "$SITE_URL")

if echo "$headers" | grep -qi "x-frame-options"; then
    print_success "X-Frame-Options configuré"
else
    print_warning "X-Frame-Options manquant"
fi

if echo "$headers" | grep -qi "x-content-type-options"; then
    print_success "X-Content-Type-Options configuré"
else
    print_warning "X-Content-Type-Options manquant"
fi

# Test 6: Performance basique
print_test "Performance de base"
start_time=$(date +%s%N)
curl -s "$SITE_URL" > /dev/null
end_time=$(date +%s%N)
load_time=$(( (end_time - start_time) / 1000000 ))

if [ $load_time -lt 2000 ]; then
    print_success "Temps de chargement: ${load_time}ms (Excellent)"
elif [ $load_time -lt 5000 ]; then
    print_success "Temps de chargement: ${load_time}ms (Bon)"
else
    print_warning "Temps de chargement: ${load_time}ms (À optimiser)"
fi

# Test 7: Proxy N8N (si configuré)
print_test "Proxy N8N"
n8n_response=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/api/n8n/health" 2>/dev/null || echo "000")
if [ "$n8n_response" = "200" ] || [ "$n8n_response" = "404" ]; then
    print_success "Proxy N8N répond"
else
    print_warning "Proxy N8N peut avoir un problème"
fi

echo ""
echo "=================================="

# Tests manuels recommandés
echo -e "${BLUE}📋 TESTS MANUELS RECOMMANDÉS:${NC}"
echo ""
echo "1. 🎯 Navigation:"
echo "   - Ouvrir $SITE_URL"
echo "   - Vérifier le chargement de l'interface"
echo ""
echo "2. 📝 Création de facture:"
echo "   - Remplir tous les champs"
echo "   - Tester les modes de paiement"
echo "   - Ajouter des produits"
echo ""
echo "3. ✍️ Signature:"
echo "   - Tester le pad de signature"
echo "   - Vérifier l'affichage dans l'aperçu"
echo ""
echo "4. 📄 Génération PDF:"
echo "   - Télécharger le PDF"
echo "   - Vérifier le contenu et mise en page"
echo ""
echo "5. 📧 Envoi email:"
echo "   - Tester l'envoi via N8N"
echo "   - Vérifier la réception de l'email"
echo "   - Contrôler la pièce jointe PDF"
echo ""
echo "6. 📱 Mobile:"
echo "   - Tester sur mobile/tablette"
echo "   - Vérifier la responsivité"
echo ""

echo -e "${GREEN}🎉 Tests automatiques terminés !${NC}"
echo -e "${YELLOW}🔍 Effectuez maintenant les tests manuels ci-dessus${NC}"
echo ""
