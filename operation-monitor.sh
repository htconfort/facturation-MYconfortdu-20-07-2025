#!/bin/bash

# 🎯 MONITEUR D'OPÉRATIONS - Système de détection intelligent
# Surveille les modifications et déclenche la sauvegarde automatique

echo "👁️  Moniteur d'Opérations MYcomfort - Démarrage"
echo "============================================="

# Fichier de comptage des opérations
COUNTER_FILE=".operation_counter"
THRESHOLD=3

# Initialiser le compteur s'il n'existe pas
if [ ! -f "$COUNTER_FILE" ]; then
    echo "0" > "$COUNTER_FILE"
    echo "📊 Compteur d'opérations initialisé"
fi

# Lire le compteur actuel
CURRENT_COUNT=$(cat "$COUNTER_FILE")
echo "📈 Opérations actuelles : $CURRENT_COUNT"

# Fonction pour incrémenter le compteur
increment_counter() {
    local reason="$1"
    CURRENT_COUNT=$((CURRENT_COUNT + 1))
    echo "$CURRENT_COUNT" > "$COUNTER_FILE"
    echo "➕ Opération #$CURRENT_COUNT : $reason"
    
    # Vérifier si le seuil est atteint
    if [ $CURRENT_COUNT -ge $THRESHOLD ]; then
        echo ""
        echo "🚨 SEUIL ATTEINT ! Déclenchement de la sauvegarde automatique..."
        ./auto-save-push.sh $CURRENT_COUNT
        
        # Remettre le compteur à zéro après sauvegarde
        echo "0" > "$COUNTER_FILE"
        echo "🔄 Compteur remis à zéro"
    else
        local remaining=$((THRESHOLD - CURRENT_COUNT))
        echo "⏳ $remaining opération(s) restante(s) avant sauvegarde auto"
    fi
}

# Fonction pour détecter les types d'opérations
detect_operations() {
    local modified_files=$(git diff --name-only 2>/dev/null | wc -l)
    local staged_files=$(git diff --cached --name-only 2>/dev/null | wc -l)
    local untracked_files=$(git ls-files --others --exclude-standard | wc -l)
    
    echo ""
    echo "🔍 Analyse des modifications en cours..."
    echo "   📝 Fichiers modifiés : $modified_files"
    echo "   📋 Fichiers stagés : $staged_files"  
    echo "   📄 Nouveaux fichiers : $untracked_files"
    
    # Détecter les opérations significatives
    if [ $modified_files -gt 0 ]; then
        increment_counter "Modification de fichiers existants"
    fi
    
    if [ $untracked_files -gt 0 ]; then
        increment_counter "Création de nouveaux fichiers"
    fi
    
    # Vérifier les modifications importantes
    if git diff --name-only | grep -E "\.(tsx|ts|css|json)$" > /dev/null 2>&1; then
        increment_counter "Modification de fichiers critiques"
    fi
}

# Fonction pour surveiller en continu (mode watch)
watch_mode() {
    echo ""
    echo "👀 Mode surveillance activé (Ctrl+C pour arrêter)"
    echo "   Vérification toutes les 30 secondes..."
    
    while true; do
        sleep 30
        echo ""
        echo "🔄 $(date '+%H:%M:%S') - Vérification automatique..."
        detect_operations
    done
}

# Fonction d'aide
show_help() {
    echo ""
    echo "📖 AIDE - Moniteur d'Opérations"
    echo ""
    echo "Usage:"
    echo "  ./operation-monitor.sh [COMMAND]"
    echo ""
    echo "Commandes:"
    echo "  check     - Vérifier une fois les opérations"
    echo "  watch     - Surveiller en continu"
    echo "  reset     - Remettre le compteur à zéro"
    echo "  status    - Afficher l'état actuel"
    echo "  force     - Forcer une sauvegarde immédiate"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  ./operation-monitor.sh check   # Vérification ponctuelle"
    echo "  ./operation-monitor.sh watch   # Surveillance continue"
    echo "  ./operation-monitor.sh force   # Sauvegarde forcée"
}

# Traitement des arguments
case "${1:-check}" in
    "check")
        detect_operations
        ;;
    "watch") 
        watch_mode
        ;;
    "reset")
        echo "0" > "$COUNTER_FILE"
        echo "🔄 Compteur remis à zéro"
        ;;
    "status")
        echo "📊 État actuel :"
        echo "   Opérations : $CURRENT_COUNT / $THRESHOLD"
        echo "   Seuil : $THRESHOLD opérations"
        echo "   Fichier compteur : $COUNTER_FILE"
        ;;
    "force")
        echo "🚀 Sauvegarde forcée déclenchée..."
        ./auto-save-push.sh $THRESHOLD
        echo "0" > "$COUNTER_FILE"
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❌ Commande inconnue : $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "============================================="
echo "👁️  Moniteur d'Opérations - Terminé"
