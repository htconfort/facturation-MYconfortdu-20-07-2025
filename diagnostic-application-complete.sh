#!/bin/bash

# 🔧 DIAGNOSTIC COMPLET APPLICATION MYCONFORT
# ==========================================
# Teste toutes les fonctionnalités après optimisation PDF

echo "🔧 DIAGNOSTIC COMPLET APPLICATION MYCONFORT"
echo "=========================================="
echo ""

# 1. Vérifier que le serveur dev est démarré
echo "1️⃣ VÉRIFICATION SERVEUR DÉVELOPPEMENT"
echo "-----------------------------------"
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ Serveur dev accessible sur http://localhost:5173/"
else
    echo "❌ Serveur dev non accessible - Démarrez avec 'npm run dev'"
    exit 1
fi

# 2. Tester webhook N8N direct
echo ""
echo "2️⃣ TEST WEBHOOK N8N DIRECT"
echo "-------------------------"
curl -X POST https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle \
  -H "Content-Type: application/json" \
  -d '{"test": true, "source": "diagnostic-script"}' \
  -w "\nTemps: %{time_total}s | Status: %{http_code}\n" \
  -s

# 3. Tester proxy Vite
echo ""
echo "3️⃣ TEST PROXY VITE DÉVELOPPEMENT"
echo "-------------------------------"
curl -X POST http://localhost:5173/api/n8n/webhook/facture-universelle \
  -H "Content-Type: application/json" \
  -d '{"test": true, "source": "diagnostic-proxy"}' \
  -w "\nTemps: %{time_total}s | Status: %{http_code}\n" \
  -s

# 4. Vérifier les variables d'environnement
echo ""
echo "4️⃣ VÉRIFICATION VARIABLES ENVIRONNEMENT"
echo "--------------------------------------"
if [ -f .env ]; then
    echo "✅ Fichier .env présent"
    echo "📋 Variables configurées:"
    grep -E "^VITE_" .env | sed 's/=.*/=***/' | head -5
    echo "   ... (autres variables masquées)"
else
    echo "❌ Fichier .env manquant"
fi

# 5. État des dépendances
echo ""
echo "5️⃣ ÉTAT DES DÉPENDANCES"
echo "---------------------"
echo "📦 Node.js: $(node --version)"
echo "📦 npm: $(npm --version)"
echo "📦 Dernière installation: $(stat -f "%Sm" package-lock.json 2>/dev/null || echo "Inconnue")"

# 6. Logs récents du serveur dev (si accessible)
echo ""
echo "6️⃣ RECOMMANDATIONS TESTS"
echo "-----------------------"
echo "🌐 Ouvrez http://localhost:5173/ dans votre navigateur"
echo "📝 Créez une facture test avec signature"
echo "📧 Testez l'envoi email via N8N"
echo "👁️  Surveillez la console pour les messages d'optimisation:"
echo "   - 🔧 Logo compressé: [dimensions + réduction]"
echo "   - 🔧 Signature optimisée: [dimensions + réduction]"
echo "   - 📄 PDF généré: [taille finale]"
echo ""
echo "🚨 ALERTES À SURVEILLER:"
echo "   - ⚠️ PDF très volumineux (>5MB)"
echo "   - ❌ Erreur EPIPE (connexion coupée)"
echo "   - 📦 Payload trop volumineux"
echo ""
echo "✅ Si la taille PDF < 1MB, les optimisations fonctionnent parfaitement!"

# 7. Guide de résolution si problème persiste
echo ""
echo "7️⃣ SI PROBLÈME PERSISTE"
echo "----------------------"
echo "🔧 Actions correctives:"
echo "   1. Vider le cache: rm -rf node_modules/.vite/"
echo "   2. Redémarrer: npm run dev"
echo "   3. Tester avec logo/signature plus petits"
echo "   4. Vérifier console navigateur pour erreurs JS"
echo "   5. Monitorer taille payload dans Network tab"

echo ""
echo "🎯 DIAGNOSTIC TERMINÉ - Application prête pour test!"
