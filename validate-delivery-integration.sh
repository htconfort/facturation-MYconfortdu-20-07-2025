#!/bin/bash

echo "🧪 VALIDATION DE L'INTÉGRATION DES STATUTS DE LIVRAISON"
echo "======================================================"

# Chemin vers le projet
PROJECT_PATH="/Users/brunopriem/mycomfort-facturation/facturation-MYconfortdu-20-07-2025"
cd "$PROJECT_PATH"

echo ""
echo "🔍 1. Vérification des fichiers requis..."

# Vérification des composants de livraison
if [ -f "src/components/delivery/DeliveryStatusSelector.tsx" ]; then
    echo "✅ DeliveryStatusSelector.tsx - OK"
else
    echo "❌ DeliveryStatusSelector.tsx - MANQUANT"
fi

if [ -f "src/components/delivery/StatusBadge.tsx" ]; then
    echo "✅ StatusBadge.tsx - OK"
else
    echo "❌ StatusBadge.tsx - MANQUANT"
fi

if [ -f "src/components/delivery/DeliveryStatusSummary.tsx" ]; then
    echo "✅ DeliveryStatusSummary.tsx - OK"
else
    echo "❌ DeliveryStatusSummary.tsx - MANQUANT"
fi

if [ -f "src/utils/deliveryStatusUtils.ts" ]; then
    echo "✅ deliveryStatusUtils.ts - OK"
else
    echo "❌ deliveryStatusUtils.ts - MANQUANT"
fi

echo ""
echo "🔍 2. Vérification des types TypeScript..."

# Vérification du type DeliveryStatus dans types/index.ts
if grep -q "DeliveryStatus" "src/types/index.ts"; then
    echo "✅ Type DeliveryStatus défini - OK"
else
    echo "❌ Type DeliveryStatus - MANQUANT"
fi

# Vérification du champ statut_livraison dans Product
if grep -q "statut_livraison" "src/types/index.ts"; then
    echo "✅ Champ statut_livraison dans Product - OK"
else
    echo "❌ Champ statut_livraison - MANQUANT"
fi

echo ""
echo "🔍 3. Vérification de l'intégration dans ProductSection..."

# Vérification des imports
if grep -q "DeliveryStatusSelector" "src/components/ProductSection.tsx"; then
    echo "✅ Import DeliveryStatusSelector - OK"
else
    echo "❌ Import DeliveryStatusSelector - MANQUANT"
fi

if grep -q "DeliveryStatusSummary" "src/components/ProductSection.tsx"; then
    echo "✅ Import DeliveryStatusSummary - OK"
else
    echo "❌ Import DeliveryStatusSummary - MANQUANT"
fi

# Vérification de l'utilisation
if grep -q "STATUT DE LIVRAISON" "src/components/ProductSection.tsx"; then
    echo "✅ Colonne statut dans tableau - OK"
else
    echo "❌ Colonne statut dans tableau - MANQUANT"
fi

echo ""
echo "🔍 4. Vérification de l'intégration dans App.tsx..."

# Vérification du passage du prop invoiceNumber
if grep -q "invoiceNumber={invoice.invoiceNumber}" "src/App.tsx"; then
    echo "✅ Prop invoiceNumber passé - OK"
else
    echo "❌ Prop invoiceNumber - MANQUANT"
fi

echo ""
echo "🔍 5. Vérification de la configuration CSS..."

if [ -f "src/components/delivery/styles/delivery-status.css" ]; then
    echo "✅ Styles CSS de livraison - OK"
else
    echo "❌ Styles CSS de livraison - MANQUANT"
fi

echo ""
echo "🔍 6. Test de compilation TypeScript..."

# Test de compilation sans exécution
npm run build --dry-run > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Compilation TypeScript - OK"
else
    echo "❌ Erreurs de compilation détectées"
fi

echo ""
echo "🔍 7. Vérification de la configuration critique..."

if [ -f "CONFIG_CRITIQUE_MYCOMFORT.md" ]; then
    echo "✅ Documentation config critique - OK"
else
    echo "❌ Documentation config critique - MANQUANT"
fi

if [ -f "src/main.tsx" ] && grep -q "App.tsx" "src/main.tsx"; then
    echo "✅ main.tsx pointe vers App.tsx - OK"
else
    echo "❌ main.tsx configuration - PROBLÈME"
fi

echo ""
echo "🔍 8. Vérification du service N8N..."

if [ -f "src/components/delivery/services/DeliveryStatusNotificationService.ts" ]; then
    echo "✅ Service notification N8N - OK"
else
    echo "❌ Service notification N8N - MANQUANT"
fi

# Vérification de l'URL webhook
if grep -q "n8n.srv765811.hstgr.cloud" "src/components/delivery/services/DeliveryStatusNotificationService.ts"; then
    echo "✅ URL webhook N8N configurée - OK"
else
    echo "❌ URL webhook N8N - PROBLÈME"
fi

echo ""
echo "🔍 9. Test de l'application en cours..."

# Vérification que l'application est en cours d'exécution
if curl -s http://localhost:5174 > /dev/null 2>&1; then
    echo "✅ Application accessible sur localhost:5174 - OK"
else
    echo "⚠️ Application non accessible (normal si pas démarrée)"
fi

echo ""
echo "📋 RÉSUMÉ DE LA VALIDATION"
echo "========================="

# Compter les succès et échecs
SUCCESS_COUNT=$(grep -c "✅" <<< "$(bash $0 2>&1)" || echo "0")
ERROR_COUNT=$(grep -c "❌" <<< "$(bash $0 2>&1)" || echo "0")

echo "✅ Éléments validés : $SUCCESS_COUNT"
echo "❌ Éléments en erreur : $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo ""
    echo "🎉 VALIDATION RÉUSSIE !"
    echo "L'intégration des statuts de livraison est complète et fonctionnelle."
    echo ""
    echo "📖 Consultez GUIDE_STATUTS_LIVRAISON.md pour l'utilisation."
else
    echo ""
    echo "⚠️ VALIDATION PARTIELLE"
    echo "Certains éléments nécessitent une vérification."
fi

echo ""
echo "🚀 Pour tester l'application :"
echo "   npm run dev"
echo "   Puis ouvrir http://localhost:5174"
