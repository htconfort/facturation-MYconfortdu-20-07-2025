#!/bin/bash

# 🚀 SCRIPT DE VÉRIFICATION PRÉ-DÉPLOIEMENT NETLIFY
# MyConfort Facturation - Validation automatique

echo "🔍 VÉRIFICATION PRÉ-DÉPLOIEMENT NETLIFY"
echo "======================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleur
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Compteur d'erreurs
errors=0

echo ""
print_info "1. Vérification des dépendances..."

# Vérification de Node.js
if command -v node &> /dev/null; then
    node_version=$(node -v)
    print_status "Node.js installé ($node_version)" 0
else
    print_status "Node.js non trouvé" 1
    ((errors++))
fi

# Vérification de npm
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    print_status "npm installé ($npm_version)" 0
else
    print_status "npm non trouvé" 1
    ((errors++))
fi

echo ""
print_info "2. Vérification des fichiers de configuration..."

# Vérification package.json
if [ -f "package.json" ]; then
    print_status "package.json présent" 0
else
    print_status "package.json manquant" 1
    ((errors++))
fi

# Vérification netlify.toml
if [ -f "netlify.toml" ]; then
    print_status "netlify.toml présent" 0
else
    print_status "netlify.toml manquant" 1
    ((errors++))
fi

# Vérification _redirects
if [ -f "public/_redirects" ]; then
    print_status "public/_redirects présent" 0
else
    print_status "public/_redirects manquant" 1
    ((errors++))
fi

# Vérification _headers
if [ -f "public/_headers" ]; then
    print_status "public/_headers présent" 0
else
    print_status "public/_headers manquant" 1
    ((errors++))
fi

echo ""
print_info "3. Installation des dépendances..."

# Installation des dépendances
if npm ci --silent > /dev/null 2>&1; then
    print_status "Dépendances installées" 0
else
    print_status "Erreur installation dépendances" 1
    ((errors++))
fi

echo ""
print_info "4. Vérification du lint..."

# Vérification ESLint
if npm run lint > /dev/null 2>&1; then
    print_status "Lint passé avec succès" 0
else
    print_warning "Lint avec warnings/erreurs (vérifiez manuellement)"
fi

echo ""
print_info "5. Test du build de production..."

# Test du build
if npm run build > /dev/null 2>&1; then
    print_status "Build de production réussi" 0
    
    # Vérification du dossier dist
    if [ -d "dist" ]; then
        dist_size=$(du -sh dist | cut -f1)
        print_status "Dossier dist créé ($dist_size)" 0
    else
        print_status "Dossier dist non créé" 1
        ((errors++))
    fi
    
    # Vérification index.html
    if [ -f "dist/index.html" ]; then
        print_status "index.html généré" 0
    else
        print_status "index.html manquant" 1
        ((errors++))
    fi
else
    print_status "Échec du build de production" 1
    ((errors++))
fi

echo ""
print_info "6. Vérification de la structure des fichiers..."

# Vérification des composants principaux
components=(
    "src/App.tsx"
    "src/main.tsx"
    "src/components/InvoicePDF.tsx"
    "src/services/n8nWebhookService.ts"
    "src/utils/invoice-calculations.ts"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        print_status "$component présent" 0
    else
        print_status "$component manquant" 1
        ((errors++))
    fi
done

echo ""
print_info "7. Vérification Git..."

# Vérification du statut Git
if git status > /dev/null 2>&1; then
    print_status "Repository Git initialisé" 0
    
    # Vérification des changements non commitées
    if [ -z "$(git status --porcelain)" ]; then
        print_status "Aucun changement non commité" 0
    else
        print_warning "Changements non commitées détectés"
        echo "   Fichiers modifiés:"
        git status --porcelain | head -5
    fi
else
    print_status "Pas de repository Git" 1
    ((errors++))
fi

echo ""
print_info "8. Analyse des fichiers de configuration Netlify..."

# Vérification netlify.toml
if grep -q "publish = \"dist\"" netlify.toml 2>/dev/null; then
    print_status "Configuration publish correcte" 0
else
    print_status "Configuration publish incorrecte" 1
    ((errors++))
fi

if grep -q "command = \"npm run build\"" netlify.toml 2>/dev/null; then
    print_status "Commande de build correcte" 0
else
    print_status "Commande de build incorrecte" 1
    ((errors++))
fi

echo ""
echo "======================================"

# Résumé final
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 PRÊT POUR LE DÉPLOIEMENT NETLIFY !${NC}"
    echo ""
    echo -e "${BLUE}Prochaines étapes :${NC}"
    echo "1. Connectez-vous à https://app.netlify.com"
    echo "2. Créez un nouveau site depuis Git"
    echo "3. Sélectionnez ce repository"
    echo "4. Les paramètres de build sont déjà configurés"
    echo "5. Ajoutez les variables d'environnement nécessaires"
    echo ""
    echo -e "${YELLOW}Variables d'environnement requises :${NC}"
    echo "- VITE_EMAILJS_PUBLIC_KEY"
    echo "- VITE_EMAILJS_SERVICE_ID"
    echo "- VITE_EMAILJS_TEMPLATE_ID"
    echo "- VITE_N8N_WEBHOOK_URL"
    echo "- VITE_COMPANY_NAME"
    echo "- VITE_COMPANY_PHONE"
    echo "- VITE_COMPANY_EMAIL"
    echo ""
else
    echo -e "${RED}❌ $errors ERREUR(S) DÉTECTÉE(S)${NC}"
    echo ""
    echo -e "${YELLOW}Corrigez les erreurs avant de déployer.${NC}"
    echo "Consultez le guide GUIDE_DEPLOIEMENT_NETLIFY.md pour plus d'informations."
fi

echo ""
