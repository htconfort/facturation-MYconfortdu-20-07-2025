#!/bin/bash

echo "🧪 Test N8N avec CURL - Diagnostic complet"
echo "============================================"

# Test 1: Payload minimal
echo ""
echo "🔍 Test 1: Payload minimal"
curl -X POST "https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a" \
  -H "Content-Type: application/json" \
  -d '{"test": 1}' \
  -v

echo ""
echo "============================================"

# Test 2: Payload avec structure basique
echo ""
echo "🔍 Test 2: Payload structure basique"
curl -X POST "https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a" \
  -H "Content-Type: application/json" \
  -d '{"clientName": "Test", "clientEmail": "test@example.com", "totalTTC": 100}' \
  -v

echo ""
echo "============================================"

# Test 3: Test GET (pour voir si le webhook accepte GET)
echo ""
echo "🔍 Test 3: GET request"
curl -X GET "https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a" \
  -v

echo ""
echo "============================================"
echo "✅ Tests terminés"
