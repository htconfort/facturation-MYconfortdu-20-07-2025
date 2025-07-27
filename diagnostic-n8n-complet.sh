#!/bin/bash

echo "🔬 DIAGNOSTIC APPROFONDI N8N - TESTS CURL MULTIPLES"
echo "=================================================="

N8N_URL="https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a"

# Test 1: Payload complètement vide
echo ""
echo "🧪 Test 1: Payload complètement vide"
curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="

# Test 2: Payload minimal avec test flag
echo ""
echo "🧪 Test 2: Payload minimal avec test flag"
curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="

# Test 3: Payload avec structure webhook standard
echo ""
echo "🧪 Test 3: Payload avec structure webhook standard"
curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -d '{"webhook_id": "e7ca38d2-4b2a-4216-9c26-23663529790a", "source": "MYCONFORT", "data": {"test": true}}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="

# Test 4: Payload avec données métier minimales
echo ""
echo "🧪 Test 4: Payload avec données métier minimales"
curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -d '{"invoiceNumber": "TEST-001", "clientName": "Test Client", "clientEmail": "test@example.com", "totalTTC": 100}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="

# Test 5: Test avec headers différents
echo ""
echo "🧪 Test 5: Test avec headers spéciaux"
curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -H "User-Agent: MYCONFORT-Diagnostic/1.0" \
  -H "X-Webhook-Source: MYCONFORT" \
  -d '{"test": "headers"}' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="

# Test 6: Test GET request (pour voir si le webhook accepte GET)
echo ""
echo "🧪 Test 6: GET request"
curl -X GET "$N8N_URL" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s

echo ""
echo "=================================================="
echo "✅ Tests terminés"
echo ""
echo "📋 INTERPRÉTATION DES RÉSULTATS:"
echo "• Status 200-299: ✅ Succès"
echo "• Status 404: ❌ Webhook inactif ou URL incorrecte"
echo "• Status 500: ⚠️ Erreur dans le workflow N8N"
echo "• Status 4xx: ⚠️ Problème de format ou d'autorisation"
echo ""
echo "Si tous les tests donnent 500 → Le workflow N8N a un problème interne"
echo "Si certains tests réussissent → Le problème vient du format des données"
