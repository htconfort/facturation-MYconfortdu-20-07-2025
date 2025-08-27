#!/bin/bash

# 🧪 Script de test rapide pour valider la signature iPad

echo "🚀 Test de validation - Signature iPad MyConfort"
echo "================================================="
echo ""

# Test 1: Vérifier que les fichiers signature sont présents
echo "✅ Test 1: Fichiers signature"
if [[ -f "assets/index-"*.js ]]; then
    echo "   ✓ Build JavaScript présent"
    grep -q "backgroundColor.*rgb.*255.*255.*255" assets/index-*.js && echo "   ✓ Fond blanc opaque détecté" || echo "   ❌ Fond blanc non trouvé"
    grep -q "penColor.*111827" assets/index-*.js && echo "   ✓ Couleur contraste détectée" || echo "   ❌ Couleur contraste non trouvée"
else
    echo "   ❌ Fichiers JS non trouvés"
fi

echo ""

# Test 2: Vérifier la configuration
echo "✅ Test 2: Configuration"
if [[ -f "_redirects" ]]; then
    echo "   ✓ Configuration SPA OK"
else
    echo "   ❌ Configuration SPA manquante"
fi

if [[ -f "index.html" ]]; then
    echo "   ✓ Point d'entrée OK"
else
    echo "   ❌ index.html manquant"
fi

echo ""

# Instructions de déploiement
echo "🌐 INSTRUCTIONS DE DÉPLOIEMENT"
echo "=============================="
echo ""
echo "1. Aller sur https://netlify.com"
echo "2. Glisser-déposer TOUT ce dossier sur Netlify"
echo "3. Attendre le déploiement (30s-1min)"
echo "4. Tester sur iPad à l'étape signature (6/8)"
echo ""
echo "🎯 RÉSULTAT ATTENDU:"
echo "   ✅ Signature visible avec fond blanc"
echo "   ✅ Traits noirs/gris foncé visibles"
echo "   ✅ Pas de problème transparent"
echo ""
echo "📱 Test sur iPad Safari ou WebView obligatoire!"
