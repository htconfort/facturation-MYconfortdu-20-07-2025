# 🧮 Système de Chèques Ronds - Mode de Paiement

## 🎯 Objectif

Dans l'onglet 4 "Mode de paiement", lorsque l'option **"Chèque à venir"** est sélectionnée, le système garantit que :

- ✅ **Les montants des chèques sont TOUJOURS des nombres entiers** (sans virgule)
- ✅ **L'acompte s'ajuste automatiquement** pour compenser les centimes
- ✅ **Facilité d'édition pour le client** qui évite les calculs compliqués

## ⚙️ Fonctionnement

### Logique Automatique

1. **Calcul initial** : `montantParCheque = Math.round(resteAPayer / nombreCheques)`
2. **Vérification** : Si l'acompte devient négatif → réduction du montant par chèque
3. **Ajustement final** : `acompte = totalTTC - (montantParCheque × nombreCheques)`

### Exemple Concret

```
Total facture : 1 234,56 €
Nombre de chèques : 3

┌─ Calcul automatique ─┐
│ Reste: 1234,56 €     │
│ ÷ 3 = 411,52 €       │
│ → Arrondi: 411 €     │ ← MONTANT ENTIER !
└──────────────────────┘

Résultat final :
• Acompte ajusté : 1,56 € (peut avoir des centimes)
• 3 chèques de : 411 € chacun (ENTIERS)
• Total : 1,56 + (411 × 3) = 1 234,56 €
```

## 📝 Modifications Appliquées

### Fichiers Concernés

1. **`/src/ipad/steps/StepPaiement.tsx`**
   - Calcul automatique des montants ronds
   - Ajustement de l'acompte
   - Affichage cohérent

2. **`/src/utils/chequeMath.ts`** 
   - Fonction `chequeFriendlyDeposits()` optimisée
   - Suggestions d'acomptes intelligentes

### Logique Implémentée

```typescript
// Montant par chèque toujours entier
const montantParCheque = Math.round(remainingAmount / nombreCheques);

// Acompte ajusté pour éviter les virgules sur les chèques
const adjustedDepositAmount = paiement.method === 'Chèque à venir' 
  ? totalTTC - (montantParCheque * nombreCheques)
  : depositAmount;

// Protection contre acomptes négatifs
if (adjustedDepositAmount < 0) {
  const adjustedPerCheque = Math.floor(totalTTC / nombreCheques);
  acompte = totalTTC - (adjustedPerCheque * nombreCheques);
}
```

## 🎨 Interface Utilisateur

### Affichage
- **Chèques** : Toujours affichés comme des montants entiers
- **Acompte** : Peut contenir des centimes (affiché normalement)
- **Suggestions** : Proposent automatiquement des répartitions optimales

### Comportement
- **Changement du nombre de chèques** → Recalcul automatique
- **Modification de l'acompte** → Ajustement pour garder des chèques ronds
- **Validation** → Vérification de cohérence

## ✅ Avantages

1. **Pour le client** : Pas de calculs compliqués avec des centimes
2. **Pour l'utilisateur** : Interface simplifiée et claire
3. **Pour l'entreprise** : Réduction des erreurs de saisie
4. **Mathématiquement** : Toujours cohérent et équilibré

## 🧪 Tests Validés

```
✅ Total: 1234,56€ → 3 chèques de 411€ + acompte 1,56€
✅ Total: 2567,89€ → 5 chèques de 513€ + acompte 2,89€
✅ Total: 890,25€ → 2 chèques de 445€ + acompte 0,25€
✅ Total: 1500,00€ → 4 chèques de 375€ + acompte 0,00€
✅ Total: 999,99€ → 3 chèques de 333€ + acompte 0,99€
```

## 🚀 Résultat

**Mission accomplie** : Les chèques à venir sont systématiquement sans virgule, quoi qu'il arrive ! 🎯

---

*Dernière mise à jour : 23 août 2025*
