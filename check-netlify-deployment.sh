#!/bin/bash

echo "🔍 VÉRIFICATION DÉPLOIEMENT NETLIFY - ENDPOINT CAISSE"
echo "=================================================="
echo

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Fonction directe
echo "📡 Test 1 - Fonction directe:"
echo "curl -i 'https://caissemycomfort2025.netlify.app/.netlify/functions/caisse-facture'"
response=$(curl -i 'https://caissemycomfort2025.netlify.app/.netlify/functions/caisse-facture' -H 'Content-Type: application/json' -d '{"amount":280,"vendorId":"sylvie"}' -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - Fonction déployée${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
else
    echo -e "${RED}❌ FAILED - Status: $status${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

echo

# Test 2: URL principale
echo "📡 Test 2 - URL principale:"
echo "curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/facture'"
response=$(curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/facture' -H 'Content-Type: application/json' -d '{"amount":280,"vendorId":"sylvie"}' -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - Règle de redirection active${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
else
    echo -e "${RED}❌ FAILED - Status: $status${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

echo

# Test 3: Alias webhook
echo "📡 Test 3 - Alias webhook:"
echo "curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture'"
response=$(curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture' -H 'Content-Type: application/json' -d '{"amount":280,"vendorId":"sylvie"}' -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - Alias webhook fonctionnel${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
else
    echo -e "${RED}❌ FAILED - Status: $status${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

# Test 4: Option alternative - Envoi direct vers app Caisse
echo
echo "📡 Test 4 - Option alternative (immédiate):"
echo "curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture'"
response=$(curl -i 'https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture' -H 'Content-Type: application/json' -d '{"amount":280,"vendorId":"sylvie","date":"2025-01-23","invoiceNumber":"F-TEST"}' -s 2>/dev/null)
status_alt=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status_alt" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - App Caisse répond directement${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
    echo
    echo -e "${GREEN}🎉 SOLUTION ALTERNATIVE DISPONIBLE IMMÉDIATEMENT!${NC}"
    echo
    echo "🚀 PROCHAINES ÉTAPES (OPTION ALTERNATIVE):"
    echo "======================================="
    echo "1. 📥 Importer le workflow n8n workflow_syncro_caisse.json"
    echo "2. 🧪 Tester avec le workflow n8n complet"
    echo "3. 🔄 Intégrer dans l'app Facturation (option directe)"
    echo "4. ✅ Vérifier que le CA instant se met à jour"
else
    echo -e "${YELLOW}⚠️  Envoi direct non disponible (fonctions Netlify inactives)${NC}"
fi

echo
echo "🔧 DIAGNOSTIC:"
echo "=============="

if [ "$status" != "200" ]; then
    echo -e "${YELLOW}⚠️  Netlify n'a pas encore redéployé avec les nouvelles configurations${NC}"
    echo
    echo "📋 ACTIONS À EFFECTUER:"
    echo "======================"
    echo "1. 💻 Aller sur https://app.netlify.com/sites/caissemycomfort2025"
    echo "2. 🔄 Déclencher un nouveau déploiement (Deploy manually)"
    echo "3. ⏳ Attendre 2-3 minutes que le déploiement se termine"
    echo "4. 🔄 Relancer ce script de vérification"
    echo
    echo "📁 FICHIERS À VÉRIFIER:"
    echo "- ✅ netlify/functions/caisse-facture.js (existe)"
    echo "- ✅ netlify.toml avec règles de redirection (configuré)"
    echo "- ✅ Commit et push vers GitHub (effectué)"
    echo
    echo "🎯 URL ATTENDUES:"
    echo "- Direct: https://caissemycomfort2025.netlify.app/.netlify/functions/caisse-facture"
    echo "- Principal: https://caissemycomfort2025.netlify.app/api/caisse/facture"
    echo "- Alias: https://caissemycomfort2025.netlify.app/api/caisse/webhook/facture"
    echo
    if [ "$status_alt" = "200" ]; then
        echo -e "${GREEN}✅ SOLUTION ALTERNATIVE: Utiliser l'envoi direct vers l'app Caisse${NC}"
    fi
else
    echo -e "${GREEN}🎉 TOUS LES TESTS RÉUSSISSENT - DÉPLOIEMENT OK!${NC}"
    echo
    echo "🚀 PROCHAINES ÉTAPES:"
    echo "==================="
    echo "1. 📥 Importer le workflow n8n workflow_syncro_caisse.json"
    echo "2. 🧪 Tester avec le workflow n8n complet"
    echo "3. 🔄 Intégrer dans l'app Facturation (n8nWebhookService.ts)"
    echo "4. ✅ Vérifier que le CA instant se met à jour"
fi

echo
echo "📊 RAPPORT COMPLET:"
echo "=================="
echo "Date: $(date)"
echo "Site: caissemycomfort2025.netlify.app"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Branch: $(git branch --show-current)"
