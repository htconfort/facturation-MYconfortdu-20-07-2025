#!/bin/bash
echo "🧪 Test du proxy N8N après déploiement"
echo "====================================="

echo "1. Test N8N direct..."
curl -I https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle

echo -e "\n2. Test proxy Netlify..."
curl -I https://willowy-nougat-0a4af3.netlify.app/api/n8n/webhook/facture-universelle

echo -e "\n✅ Si proxy retourne 404 avec application/json → SUCCESS"
echo "❌ Si proxy retourne 200 avec text/html → FAILURE (cache?)"
