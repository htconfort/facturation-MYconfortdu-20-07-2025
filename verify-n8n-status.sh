#!/bin/bash

echo "🔍 VÉRIFICATION AUTOMATIQUE DU STATUT N8N"
echo "========================================"

# Fonction pour tester le webhook
test_webhook() {
    echo ""
    echo "🧪 Test webhook N8N..."
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a" \
        -H "Content-Type: application/json" \
        -d '{"test": true, "source": "verification_script"}')
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    echo "📊 Status HTTP: $http_code"
    echo "📋 Réponse: $body"
    
    if [ "$http_code" -eq 404 ]; then
        echo "❌ WORKFLOW INACTIF - Le webhook n'est pas enregistré"
        echo "   👉 Activez le workflow dans l'interface N8N"
        return 1
    elif [ "$http_code" -eq 500 ]; then
        echo "⚠️  WORKFLOW ACTIF mais erreur de traitement"
        echo "   👉 Le webhook répond, mais il y a un problème dans le workflow"
        echo "   💡 Vérifiez la configuration du workflow N8N"
        return 2
    elif [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ WORKFLOW ACTIF ET FONCTIONNEL"
        echo "   👉 L'application peut maintenant envoyer des factures"
        return 0
    else
        echo "⚠️  Status inattendu: $http_code"
        echo "   👉 Vérifiez manuellement le workflow N8N"
        return 3
    fi
}

# Fonction pour tester en boucle
monitor_webhook() {
    echo ""
    echo "🔄 Surveillance automatique (Ctrl+C pour arrêter)..."
    echo "   Vérification toutes les 10 secondes"
    
    while true; do
        echo ""
        echo "⏰ $(date '+%H:%M:%S') - Vérification..."
        
        if test_webhook; then
            echo ""
            echo "🎉 SUCCÈS ! Le workflow N8N est maintenant actif"
            echo "   Vous pouvez maintenant tester l'application web"
            break
        fi
        
        echo "   ⏳ Nouvelle vérification dans 10 secondes..."
        sleep 10
    done
}

# Menu principal
echo ""
echo "Choisissez une option :"
echo "1) Test unique"
echo "2) Surveillance continue (recommandé)"
echo ""
read -p "Votre choix (1 ou 2): " choice

case $choice in
    1)
        test_webhook
        ;;
    2)
        monitor_webhook
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "🏁 Script terminé"
