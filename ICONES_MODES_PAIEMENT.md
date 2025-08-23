# 💳 Icônes de Modes de Paiement - MyConfort

## 🎯 Objectif
Remplacer les emojis par des icônes professionnelles pour chaque mode de règlement dans le Step 4 (Paiement).

## 📁 Images Fournies

### 1. **Espèces** 💵
- Image : Liasse de billets (noir et blanc)
- Usage : Mode "Espèces"

### 2. **Virement Bancaire** 🏦  
- Image : Logo "Virement bancaire" avec bordure dorée
- Usage : Mode "Virement"

### 3. **Carte Bleue** 💳
- Image : Logos CB, MasterCard, Visa
- Usage : Mode "Carte Bleue"

### 4. **Chèque** 🧾
- Image : Icône chèque avec signature
- Usage : Mode "Chèque" et "Chèque unique"

### 5. **Alma (déjà intégré)** 
- Logo : Alma orange
- Usage : Mode "Acompte" (paiement fractionné)

## 🔧 Plan d'Intégration

### Structure de Fichiers
```
public/
├── payment-icons/
│   ├── especes.png       (liasse billets)
│   ├── virement.png      (logo virement bancaire)
│   ├── carte-bleue.png   (logos CB/MC/Visa)
│   ├── cheque.png        (icône chèque)
│   └── Alma_orange.png   (déjà présent)
```

### Modification du Code
Dans `/src/ipad/steps/StepPaiement.tsx` :

```tsx
const paymentMethods = [
  {
    value: 'Chèque à venir',
    label: '📄 Chèque à venir',
    icon: <img src="/payment-icons/cheque.png" className="h-8 w-auto" />,
  },
  {
    value: 'Espèces',
    label: '💵 Espèces', 
    icon: <img src="/payment-icons/especes.png" className="h-8 w-auto" />,
  },
  // ... etc
];
```

## 🎨 Rendu Attendu

### Interface Step 4 avec Icônes Professionnelles
```
┌─────────────────────────────────────────────────────┐
│ [Chèque]    [Billets]    [Virement]                │
│ À venir     Espèces      Bancaire                   │
│                                                     │
│ [CB/MC/V]   [Chèque]     [ALMA]                    │
│ Carte Bleue Unique       Logo                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Prochaines Étapes

1. **Copier** les images dans `/public/payment-icons/`
2. **Modifier** le tableau `paymentMethods` 
3. **Adapter** l'affichage des icônes
4. **Tester** l'interface
5. **Valider** l'harmonie visuelle

*Préparation des icônes de paiement - MyConfort*
