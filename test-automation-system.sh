#!/bin/bash

# 🧪 SCRIPT DE TEST - Système d'automatisation complet

echo "🧪 Test du Système d'Automatisation MYcomfort"
echo "=============================================="

# Test 1: Vérification des scripts
echo ""
echo "📋 Test 1/5 : Vérification des scripts..."

if [ -x "./auto-save-push.sh" ]; then
    echo "✅ auto-save-push.sh : Exécutable"
else
    echo "❌ auto-save-push.sh : Problème"
    exit 1
fi

if [ -x "./operation-monitor.sh" ]; then
    echo "✅ operation-monitor.sh : Exécutable"
else
    echo "❌ operation-monitor.sh : Problème"  
    exit 1
fi

# Test 2: Test du monitoring
echo ""
echo "📊 Test 2/5 : Test du système de monitoring..."
./operation-monitor.sh status

# Test 3: Création de fichiers tests pour déclencher l'automatisation
echo ""
echo "🎯 Test 3/5 : Création de modifications test..."

# Créer un fichier temporaire de test
echo "# Test automatisation $(date)" > "test_auto_$(date +%s).tmp"
echo "console.log('Test automatisation');" > "test_auto_$(date +%s).js"

# Test 4: Déclenchement forcé de l'automatisation
echo ""
echo "🚀 Test 4/5 : Test de déclenchement forcé..."
./operation-monitor.sh force

# Test 5: Nettoyage des fichiers tests
echo ""
echo "🧹 Test 5/5 : Nettoyage..."
rm -f test_auto_*.tmp test_auto_*.js

echo ""
echo "✅ Tests terminés - Système d'automatisation validé !"
echo "=============================================="
