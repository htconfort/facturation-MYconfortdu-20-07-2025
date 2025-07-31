#!/bin/bash

# 🔍 SCRIPT DE VALIDATION DES VARIABLES D'ENVIRONNEMENT
# MyConfort Facturation - Vérification configuration Netlify

echo "🔐 VALIDATION VARIABLES D'ENVIRONNEMENT"
echo "======================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# URL du site Netlify (à modifier)
SITE_URL="${1:-https://your-site.netlify.app}"

if [ "$SITE_URL" = "https://your-site.netlify.app" ]; then
    echo -e "${YELLOW}⚠️ Utilisation: ./validate-env-vars.sh https://votre-site.netlify.app${NC}"
    echo ""
fi

print_check() {
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

# Test d'accessibilité du site
print_check "Vérification accessibilité du site"
if curl -s "$SITE_URL" > /dev/null; then
    print_success "Site accessible"
else
    print_error "Site non accessible - Vérifiez l'URL"
    exit 1
fi

# Récupération du contenu pour analyser les variables
echo ""
print_check "Analyse des variables dans l'application..."

# Test de la console pour vérifier les variables (simulation)
echo ""
echo -e "${BLUE}📋 VARIABLES À VÉRIFIER MANUELLEMENT:${NC}"
echo ""

echo -e "${YELLOW}1. Ouvrir la console développeur (F12)${NC}"
echo -e "${YELLOW}2. Aller dans l'onglet Console${NC}"
echo -e "${YELLOW}3. Taper ces commandes une par une:${NC}"
echo ""

echo "// Vérification N8N Webhook"
echo "console.log('N8N URL:', import.meta.env.VITE_N8N_WEBHOOK_URL);"
echo ""

echo "// Vérification informations entreprise"
echo "console.log('Company Name:', import.meta.env.VITE_COMPANY_NAME);"
echo "console.log('Company Phone:', import.meta.env.VITE_COMPANY_PHONE);"
echo "console.log('Company Email:', import.meta.env.VITE_COMPANY_EMAIL);"
echo ""

echo "// Vérification mode production"
echo "console.log('NODE_ENV:', import.meta.env.NODE_ENV);"
echo "console.log('Debug Mode:', import.meta.env.VITE_DEBUG_MODE);"
echo ""

echo -e "${GREEN}✅ VALEURS ATTENDUES:${NC}"
echo "N8N URL: https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a"
echo "Company Name: MYCONFORT"
echo "Company Phone: 06 61 48 60 23"
echo "Company Email: myconfort66@gmail.com"
echo "NODE_ENV: production"
echo "Debug Mode: false"
echo ""

echo -e "${BLUE}📝 TESTS FONCTIONNELS:${NC}"
echo ""

echo "1. 🏢 Test informations entreprise:"
echo "   - Créer une facture"
echo "   - Vérifier que 'MYCONFORT' apparaît dans le PDF"
echo "   - Vérifier téléphone et email corrects"
echo ""

echo "2. 🔗 Test webhook N8N:"
echo "   - Créer et envoyer une facture"
echo "   - Vérifier réception email automatique"
echo "   - Contrôler logs N8N si nécessaire"
echo ""

echo "3. 📄 Test génération PDF:"
echo "   - Créer une facture complète"
echo "   - Télécharger le PDF"
echo "   - Vérifier toutes les informations"
echo ""

echo "4. 🎨 Test mode production:"
echo "   - Ouvrir console développeur"
echo "   - Vérifier absence de logs debug"
echo "   - Performance optimisée"
echo ""

echo -e "${YELLOW}⚠️ SI DES VARIABLES SONT MANQUANTES:${NC}"
echo ""
echo "1. Retourner sur Netlify Dashboard"
echo "2. Site settings → Environment variables"
echo "3. Ajouter les variables manquantes"
echo "4. Redéployer le site"
echo "5. Tester à nouveau"
echo ""

echo -e "${RED}❌ VARIABLES CRITIQUES MANQUANTES → APP NE FONCTIONNERA PAS:${NC}"
echo "- VITE_N8N_WEBHOOK_URL (envoi email)"
echo "- VITE_COMPANY_NAME (informations PDF)"
echo ""

echo -e "${GREEN}🎉 SI TOUS LES TESTS PASSENT:${NC}"
echo "L'application est correctement configurée !"
echo ""

echo "======================================="
echo -e "${BLUE}📖 Guides disponibles:${NC}"
echo "- NETLIFY_VARIABLES_GUIDE.md"
echo "- NETLIFY_ENV_VARIABLES.md" 
echo "- DEPLOYMENT_READY.md"
echo ""
