#!/bin/bash

echo "🎯 TEST POST-ACTIVATION N8N"
echo "=========================="
echo "À utiliser APRÈS avoir activé le workflow dans N8N"
echo ""

N8N_URL="https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a"

# Test simple pour vérifier l'activation
echo "🧪 Test d'activation du webhook..."
RESPONSE=$(curl -X POST "$N8N_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "%{http_code}" \
  -s -o /tmp/n8n_response.txt)

echo "Status reçu: $RESPONSE"

if [ "$RESPONSE" = "404" ]; then
    echo "❌ WEBHOOK TOUJOURS INACTIF"
    echo "   Le workflow N8N n'est pas encore activé"
    echo "   Veuillez l'activer dans l'interface N8N"
elif [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
    echo "✅ WEBHOOK ACTIF ET FONCTIONNEL !"
    echo "   Réponse N8N:"
    cat /tmp/n8n_response.txt
    echo ""
    echo "🎉 Vous pouvez maintenant utiliser l'application !"
elif [ "$RESPONSE" = "500" ]; then
    echo "⚠️ WEBHOOK ACTIF MAIS ERREUR DE TRAITEMENT"
    echo "   Le workflow est activé mais il y a un problème dans sa configuration"
    echo "   Réponse N8N:"
    cat /tmp/n8n_response.txt
else
    echo "🔍 STATUS INATTENDU: $RESPONSE"
    echo "   Réponse N8N:"
    cat /tmp/n8n_response.txt
fi

echo ""
echo "🔄 Pour retester, relancez ce script:"
echo "   ./test-post-activation.sh"

# Nettoyer
rm -f /tmp/n8n_response.txt
