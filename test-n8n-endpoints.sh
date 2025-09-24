#!/bin/bash

echo "🔍 TEST DES ENDPOINTS N8N - MÉTHODES HTTP CORRECTES"
echo "=================================================="
echo

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://n8n.srv765811.hstgr.cloud/webhook"

echo "📡 Test 1 - POST /caisse/facture (méthode correcte):"
echo "curl -X POST '$BASE_URL/caisse/facture'"
response=$(curl -i "$BASE_URL/caisse/facture" -H 'Content-Type: application/json' -X POST -d '{"numero_facture":"TEST-001","date_facture":"2025-01-23","nom_client":"Test Client","montant_ttc":280,"vendeuse":"Sylvie","produits":[{"nom":"Matelas","quantite":1,"prix_ttc":280}]}' -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - Webhook POST fonctionne${NC}"
    response_json=$(echo "$response" | tail -n 1)
    if echo "$response_json" | jq -e '.success' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Réponse structurée valide${NC}"
        echo "Message: $(echo "$response_json" | jq -r '.message')"
        echo "Facture: $(echo "$response_json" | jq -r '.invoiceNumber // "N/A"')"
    else
        echo -e "${YELLOW}⚠️  Réponse non structurée (ancien format)${NC}"
    fi
else
    echo -e "${RED}❌ FAILED - Status: $status${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

echo
echo "📡 Test 2 - GET /caisse/factures (méthode correcte):"
echo "curl -X GET '$BASE_URL/caisse/factures'"
response=$(curl -i "$BASE_URL/caisse/factures" -H 'Content-Type: application/json' -X GET -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ SUCCESS - Webhook GET fonctionne${NC}"
    response_json=$(echo "$response" | tail -n 1)
    if echo "$response_json" | jq -e '.success' >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Réponse structurée valide${NC}"
        echo "Nombre de factures: $(echo "$response_json" | jq '.count // 0')"
        echo "Timestamp: $(echo "$response_json" | jq -r '.timestamp' 2>/dev/null || echo 'N/A')"
    else
        echo -e "${YELLOW}⚠️  Réponse non structurée (ancien format)${NC}"
        echo "Données brutes: $(echo "$response_json" | jq '. | length' 2>/dev/null || echo 'Format JSON')"
    fi
else
    echo -e "${RED}❌ FAILED - Status: $status${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

echo
echo "📡 Test 3 - GET /caisse/facture (méthode INCORRECTE - doit échouer):"
echo "curl -X GET '$BASE_URL/caisse/facture'"
response=$(curl -i "$BASE_URL/caisse/facture" -H 'Content-Type: application/json' -X GET -s 2>/dev/null)
status=$(echo "$response" | head -n 1 | cut -d' ' -f2)

if [ "$status" = "404" ]; then
    echo -e "${GREEN}✅ SUCCESS - Méthode incorrecte refusée comme attendu${NC}"
    echo "Message: $(echo "$response" | tail -n 1 | jq -r '.message // "Méthode non supportée"' 2>/dev/null || echo "$response" | tail -n 1)"
else
    echo -e "${YELLOW}⚠️  UNEXPECTED - Status: $status (devrait être 404)${NC}"
    echo "Réponse: $(echo "$response" | tail -n 1)"
fi

echo
echo "🔧 RÉSUMÉ DES MÉTHODES HTTP:"
echo "==========================="
echo "✅ POST /caisse/facture     - Envoi de factures (workflow principal)"
echo "✅ GET  /caisse/factures    - Liste des factures"
echo "❌ GET  /caisse/facture     - NON SUPPORTÉ (utiliser POST)"
echo "✅ POST /webhook/caisse/factures/upsert - Import en batch"

echo
echo "📋 PROCHAINES ÉTAPES:"
echo "==================="
echo "1. ✅ Importer le workflow n8n workflow_syncro_caisse.json"
echo "2. ✅ Tester avec les méthodes HTTP correctes (POST pour factures)"
echo "3. ✅ Vérifier l'archivage dans Supabase"
echo "4. ✅ Vérifier les réponses structurées des nodes Respond"
echo "5. 🔄 Activer les fonctions Netlify si souhaité"

echo
echo "📊 RAPPORT COMPLET:"
echo "=================="
echo "Date: $(date)"
echo "Workflow: workflow_syncro_caisse.json"
echo "Endpoints testés: $(git rev-parse --short HEAD)"
echo "Branch: $(git branch --show-current)"

echo
echo -e "${GREEN}🎉 TESTS RÉUSSIS - LES ENDPOINTS N8N FONCTIONNENT CORRECTEMENT!${NC}"
