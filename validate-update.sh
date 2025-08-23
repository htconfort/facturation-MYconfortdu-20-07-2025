#!/bin/bash

# 🧪 Script de validation post-déploiement UPDATE
# Vérifie les nouvelles fonctionnalités après mise à jour

echo "🧪 VALIDATION POST-MISE À JOUR - MyConfort"
echo "==========================================="

# URL de production (à personnaliser selon votre site Netlify)
PROD_URL="https://your-app.netlify.app"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

success_msg() { echo -e "${GREEN}✅ $1${NC}"; }
warning_msg() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error_msg() { echo -e "${RED}❌ $1${NC}"; }
info_msg() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Test des nouvelles fonctionnalités
echo "🎯 TESTS DES NOUVELLES FONCTIONNALITÉS"
echo "======================================"

# Test 1: Impression HTML
echo "🖨️ Test: Fonctionnalité d'impression HTML"
if curl -s "$PROD_URL" | grep -q "PrintButton\|Imprimer\|🖨️"; then
    success_msg "Bouton d'impression détecté dans le code"
else
    warning_msg "Bouton d'impression non détecté"
fi

if curl -s "$PROD_URL" | grep -q "print-bg\|no-print"; then
    success_msg "Classes d'impression détectées"
else
    warning_msg "Classes d'impression non détectées"
fi

# Test 2: Corrections remises
echo "💰 Test: Corrections des remises"
if curl -s "$PROD_URL" | grep -q "montantRemise\|Total.*remise\|sous-total"; then
    success_msg "Système de remises mis à jour détecté"
else
    warning_msg "Mise à jour remises non détectée"
fi

# Test 3: Synchronisation livraison
echo "🚚 Test: Synchronisation livraison/emporter"
if curl -s "$PROD_URL" | grep -q "isPickupOnSite\|Emporter\|Livrer"; then
    success_msg "Système livraison/emporter détecté"
else
    warning_msg "Synchronisation livraison non détectée"
fi

# Test 4: Interface Alma
echo "💳 Test: Interface Alma"
if curl -s "$PROD_URL" | grep -q "Alma\|paiement.*fois"; then
    success_msg "Interface Alma détectée"
else
    warning_msg "Interface Alma non détectée"
fi

# Génération rapport de test
REPORT_FILE="validation-update-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# 🧪 Rapport de validation - Mise à jour MyConfort

**Date:** $(date)  
**URL:** $PROD_URL  
**Commit actuel:** $(git rev-parse --short HEAD)  
**Dernière mise à jour:** Impression HTML + Corrections + Alma

## 🎯 NOUVELLES FONCTIONNALITÉS À TESTER

### 🖨️ IMPRESSION HTML (NOUVEAU)
**Localisation:** Step 7 - Récapitulatif final
**Actions à tester:**
1. Naviguer jusqu'au récapitulatif
2. Cliquer sur le bouton "🖨️ Imprimer"
3. Vérifier ouverture dialogue AirPrint
4. Contrôler masquage éléments UI (boutons, notifications)
5. Valider format A4 avec fond beige
6. Tester sauvegarde PDF depuis dialogue

**Résultat attendu:** Impression propre sans éléments d'interface

### 💰 REMISES CORRIGÉES
**Localisation:** Step 7 - Section totaux
**Actions à tester:**
1. Créer un produit avec remise (ex: 100%)
2. Aller au récapitulatif final
3. Vérifier affichage "Sous-total avant remises"
4. Contrôler ligne "Total des remises" en vert
5. Valider calculs finaux corrects

**Résultat attendu:** Remises clairement affichées et calculées

### 🚚 LIVRAISON/EMPORTER SYNCHRONISÉ
**Localisation:** Step 3 → Step 7
**Actions à tester:**
1. Dans step 3, définir mode livraison par produit
2. Sélectionner "Livrer" et "Emporter" pour différents produits
3. Aller au récapitulatif
4. Vérifier colonne "Livraison" avec bonnes icônes
5. Contrôler cohérence entre steps

**Résultat attendu:** Synchronisation parfaite des modes

### 💳 ALMA VALIDÉE
**Localisation:** Section paiement
**Actions à tester:**
1. Sélectionner "Alma" comme mode de paiement
2. Tester options 2/3/4 fois
3. Vérifier calculs échéancier
4. Contrôler montants arrondis (chèques ronds)
5. Valider affichage logo et interface

**Résultat attendu:** Interface Alma fonctionnelle et cohérente

## 🔄 TESTS WORKFLOW COMPLETS
- [ ] Test commande complète de A à Z
- [ ] Génération et envoi PDF via N8N
- [ ] Réception emails EmailJS
- [ ] Sauvegarde données Supabase
- [ ] Test sur mobile/tablette
- [ ] Vérification performances

## 📱 TESTS RESPONSIVES
- [ ] iPhone/iPad (interface tactile optimisée)
- [ ] Android (compatibilité)
- [ ] Desktop (impression et interface complète)
- [ ] Différents navigateurs (Chrome, Safari, Firefox)

## 🚨 POINTS DE VIGILANCE
1. **Impression:** Tester sur différents navigateurs
2. **Remises:** Valider avec différents pourcentages
3. **Livraison:** Contrôler avec plusieurs produits
4. **Alma:** Vérifier sur mobile et desktop

## ✅ VALIDATION FINALE
- [ ] Toutes les nouvelles fonctionnalités opérationnelles
- [ ] Pas de régression sur fonctionnalités existantes
- [ ] Performance maintenue
- [ ] Tests mobiles concluants
- [ ] Workflow N8N fonctionnel

**Status:** ⏳ En cours de validation  
**Prêt pour production:** 🔄 À confirmer après tests manuels
EOF

success_msg "Rapport généré: $REPORT_FILE"

# Ouverture du site pour test manuel
echo ""
info_msg "Ouverture du site pour validation manuelle..."
if command -v open &> /dev/null; then
    open "$PROD_URL"
    success_msg "Site ouvert dans le navigateur"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$PROD_URL"
    success_msg "Site ouvert dans le navigateur"
else
    warning_msg "Ouvrez manuellement: $PROD_URL"
fi

echo ""
echo "🎉 VALIDATION DE MISE À JOUR TERMINÉE"
echo "===================================="
echo "🔗 Site: $PROD_URL"
echo "📄 Rapport: $REPORT_FILE"
echo ""
echo "🎯 ACTIONS PRIORITAIRES:"
echo "   1. 🖨️ Tester impression HTML (step 7)"
echo "   2. 💰 Vérifier affichage remises"
echo "   3. 🚚 Contrôler sync livraison/emporter"
echo "   4. 💳 Valider interface Alma"
echo "   5. 🔄 Test workflow complet"
echo ""
echo "✨ Une fois validé, les nouvelles fonctionnalités seront prêtes!"
