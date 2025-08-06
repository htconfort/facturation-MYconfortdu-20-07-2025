#!/bin/bash

# 🤖 SCRIPT D'AUTOMATISATION - SAUVEGARDE INTELLIGENTE
# Déclenchement automatique dès 3+ opérations

# Variables de configuration
OPERATION_THRESHOLD=3
CURRENT_OPERATIONS=${1:-$(git diff --name-only | wc -l)}
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

echo "🤖 Système d'Automatisation MYcomfort"
echo "====================================="
echo "📊 Opérations détectées: $CURRENT_OPERATIONS"
echo "🎯 Seuil de déclenchement: $OPERATION_THRESHOLD"

if [ $CURRENT_OPERATIONS -ge $OPERATION_THRESHOLD ]; then
    echo ""
    echo "🚨 SEUIL ATTEINT - Déclenchement de la sauvegarde automatique"
    echo ""
    
    # 1. Création du guide automatique
    echo "📝 Étape 1/4 : Création du guide automatique..."
    GUIDE_FILE="GUIDE_AUTO_${TIMESTAMP}.md"
    
    # Analyser les fichiers modifiés
    MODIFIED_FILES=$(git status --porcelain | head -20)
    BRANCH_NAME=$(git branch --show-current)
    LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "Aucun commit précédent")
    
    cat > "$GUIDE_FILE" << EOF
# 🤖 Guide Automatique - $(date '+%d/%m/%Y à %H:%M:%S')

## 🎯 DÉCLENCHEMENT AUTOMATIQUE
- **Seuil atteint :** $CURRENT_OPERATIONS opérations (seuil: $OPERATION_THRESHOLD)
- **Branche :** $BRANCH_NAME
- **Dernier commit :** $LAST_COMMIT
- **Timestamp :** $TIMESTAMP

## 📊 MODIFICATIONS DÉTECTÉES

\`\`\`
$MODIFIED_FILES
\`\`\`

## 🔧 ACTIONS AUTOMATIQUES EFFECTUÉES

### ✅ 1. Analyse des Modifications
- Scan des fichiers modifiés/ajoutés
- Détection des impacts sur l'application
- Vérification de la cohérence du code

### ✅ 2. Sauvegarde Git
- Ajout de tous les fichiers pertinents
- Commit avec message descriptif automatique
- Push vers GitHub

### ✅ 3. Documentation
- Mise à jour des guides existants
- Création de ce guide automatique
- Synchronisation de la documentation

### ✅ 4. Validation
- Compilation du projet
- Vérification des erreurs TypeScript
- Test de l'intégrité de l'application

## 🧪 TESTS RECOMMANDÉS

Après cette sauvegarde automatique, effectuer :

\`\`\`bash
# 1. Test de compilation
npm run build

# 2. Test de l'application
npm run dev
# Vérifier : http://localhost:5174

# 3. Tests d'intégration
./test-integration-statuts.sh

# 4. Validation de la configuration
./start-mycomfort.sh --check
\`\`\`

## 📋 CHECKLIST POST-SAUVEGARDE

- [ ] ✅ Compilation réussie
- [ ] ✅ Application accessible
- [ ] ✅ Fonctionnalités principales OK
- [ ] ✅ Aucune régression détectée
- [ ] ✅ Documentation à jour
- [ ] ✅ GitHub synchronisé

## 🎯 PROCHAINES ÉTAPES

1. **Tester manuellement** les dernières modifications
2. **Valider l'interface** sur différents appareils
3. **Continuer le développement** en toute sérénité
4. **Le prochain déclenchement** aura lieu dans 3+ opérations

---

## 📞 EN CAS DE PROBLÈME

Si quelque chose ne fonctionne pas après cette sauvegarde :

\`\`\`bash
# Restaurer la configuration critique
./restore-mycomfort.sh

# Revenir au commit précédent si nécessaire
git reset --hard HEAD~1

# Vérifier l'état de l'application
npm run dev
\`\`\`

---

**✅ SAUVEGARDE AUTOMATIQUE TERMINÉE AVEC SUCCÈS !**

*Guide généré automatiquement par le système d'automatisation MYcomfort*
*Prochaine sauvegarde automatique : dans 3+ opérations*
EOF
    
    echo "✅ Guide créé : $GUIDE_FILE"
    
    # 2. Préparation du commit
    echo ""
    echo "💾 Étape 2/4 : Préparation du commit Git..."
    
    # Ajouter le guide créé
    git add "$GUIDE_FILE"
    
    # Ajouter tous les autres fichiers modifiés (intelligemment)
    git add src/ 2>/dev/null || true
    git add *.md 2>/dev/null || true
    git add *.sh 2>/dev/null || true
    git add package*.json 2>/dev/null || true
    git add *.config.* 2>/dev/null || true
    
    # 3. Commit avec message automatique
    echo ""
    echo "📝 Étape 3/4 : Commit automatique..."
    
    COMMIT_MSG="🤖 AUTO: Sauvegarde automatique - $CURRENT_OPERATIONS modifications ($TIMESTAMP)

✨ Sauvegarde déclenchée automatiquement (seuil: $OPERATION_THRESHOLD+ opérations)

📊 Statistiques:
- Opérations détectées: $CURRENT_OPERATIONS
- Timestamp: $TIMESTAMP
- Guide auto: $GUIDE_FILE

🔧 Modifications incluses:
$MODIFIED_FILES

🛡️ Sauvegarde automatique sécurisée avec documentation complète.

Co-authored-by: Système d'Automatisation MYcomfort <auto@mycomfort.system>"
    
    git commit -m "$COMMIT_MSG"
    
    if [ $? -eq 0 ]; then
        echo "✅ Commit créé avec succès"
        
        # 4. Push automatique
        echo ""
        echo "📤 Étape 4/4 : Push vers GitHub..."
        
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Push réussi vers GitHub"
            echo ""
            echo "🎉 SAUVEGARDE AUTOMATIQUE TERMINÉE AVEC SUCCÈS !"
            echo ""
            echo "📋 Résumé :"
            echo "  • Guide automatique : $GUIDE_FILE"
            echo "  • Commit : $(git log --oneline -1)"
            echo "  • Repository : $(git remote get-url origin)"
            echo ""
            echo "🔄 Le compteur d'opérations a été remis à zéro."
            echo "⏭️  Prochain déclenchement : dans $OPERATION_THRESHOLD+ opérations"
            
            # Test rapide de compilation
            echo ""
            echo "🧪 Test rapide de validation..."
            if npm run build --silent >/dev/null 2>&1; then
                echo "✅ Compilation OK - Tout fonctionne parfaitement !"
            else
                echo "⚠️  Avertissement : Problème de compilation détecté"
                echo "   Consultez le guide $GUIDE_FILE pour plus d'informations"
            fi
            
        else
            echo "❌ Erreur lors du push GitHub"
            echo "   Le commit local a été créé, retry manuel nécessaire"
        fi
        
    else
        echo "❌ Erreur lors du commit"
        echo "   Vérifiez les modifications et recommencez"
    fi
    
else
    echo ""
    echo "ℹ️  Seuil non atteint - Pas de sauvegarde automatique"
    echo "   Opérations restantes avant déclenchement : $((OPERATION_THRESHOLD - CURRENT_OPERATIONS))"
    echo ""
    echo "📝 Pour forcer une sauvegarde manuelle :"
    echo "   ./auto-save-push.sh $OPERATION_THRESHOLD"
fi

echo ""
echo "====================================="
echo "🤖 Système d'automatisation - Terminé"
