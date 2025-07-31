# 🔄 GUIDE DE ROLLBACK - Correction montant_restant

## 📋 Information du Commit

**Commit de la correction :** `5ec79a7`  
**Message :** "fix: Correction définitive du problème montant_restant pour paiements espèces"

## 🔙 Comment revenir en arrière

Si vous souhaitez annuler cette correction et revenir à l'état précédent :

### Option 1: Rollback complet (recommandé pour test)
```bash
# Revenir au commit précédent en gardant les fichiers modifiés
git reset --soft HEAD~1

# Ou revenir au commit précédent en supprimant toutes les modifications
git reset --hard HEAD~1
```

### Option 2: Checkout du commit précédent
```bash
# Revenir temporairement au commit précédent
git checkout b4ef156

# Pour revenir au dernier commit
git checkout main
```

### Option 3: Revert (crée un nouveau commit qui annule les changements)
```bash
# Créer un commit qui annule la correction
git revert 5ec79a7
```

## 📁 Fichiers modifiés dans cette correction

### Fichiers principaux modifiés :
- `src/services/n8nWebhookService.ts` - Logique de calcul corrigée
- `src/services/googleDriveService.ts` - Logique de calcul corrigée  
- `src/App.tsx` - useEffect pour recalcul automatique
- `src/utils/invoice-calculations.ts` - Fonction de calcul (déjà présente)

### Fichiers de documentation créés :
- `CORRECTION_MONTANT_RESTANT_FINAL.md` - Guide complet de la correction
- `test-montant-restant-correction.cjs` - Script de test de validation
- Autres fichiers de test et documentation

## 🧪 Comment tester la correction

### Avant de rollback, testez la correction :
1. Créer une facture avec un produit (ex: 450€)
2. Sélectionner "Espèces" comme mode de paiement
3. Laisser l'acompte à 0€
4. Générer la facture et vérifier :
   - PDF affiche "MONTANT PAYÉ: 450€"
   - Logs N8N montrent `"montant_restant": 0`

### Après rollback, pour confirmer le problème :
1. Répéter les mêmes étapes
2. Vérifier que :
   - PDF affiche "TOTAL TTC: 450€" (problématique)
   - Logs N8N montrent `"montant_restant": 450` (incohérent)

## ⚠️ Points d'attention

**Si vous faites un rollback :**
- Le problème original reviendra (espèces → montant_restant ≠ 0)
- Les factures créées après le rollback auront l'ancien comportement
- Les factures créées avec la correction gardent leur état

**Recommandation :**
- Testez d'abord la correction en production
- Ne faites un rollback que si la correction cause des problèmes
- Vous pouvez toujours re-appliquer la correction plus tard

## 🔍 Vérification de l'état actuel

```bash
# Voir l'historique des commits
git log --oneline -10

# Voir les différences avec le commit précédent
git diff HEAD~1

# Voir les fichiers modifiés
git show --name-only 5ec79a7
```
