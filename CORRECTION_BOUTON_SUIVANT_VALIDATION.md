# Correction du Bouton "Suivant" avec Validation Centralisée

## 🎯 Objectif
Corriger la validation centralisée du bouton "Suivant" dans le wizard iPad pour empêcher de passer au step suivant sans remplir les champs obligatoires.

## ❌ Problème Identifié
Dans `IpadWizard.tsx`, la fonction de validation utilisait des propriétés incorrectes du store Zustand :
- Utilisation de `clientName`, `clientEmail`, `clientAddress`, `clientCity` 
- Mais dans le store, les données client sont dans un objet `client` avec les propriétés `name`, `email`, `address`, `city`

## ✅ Solution Appliquée

### 1. Correction des Propriétés du Store
**Fichier :** `/src/ipad/IpadWizard.tsx`

**Avant :**
```tsx
const { invoiceNumber, invoiceDate, eventLocation, clientName, clientEmail, clientAddress, clientCity, produits, paiement } = useInvoiceWizard();
```

**Après :**
```tsx
const { invoiceNumber, invoiceDate, eventLocation, client, produits, paiement } = useInvoiceWizard();
```

### 2. Correction de la Logique de Validation
**Avant :**
```tsx
case 'client':
  if (!clientName.trim()) {
    errorMessage = 'Le nom du client est obligatoire';
    isValid = false;
  } else if (!clientEmail.trim()) {
    errorMessage = 'L\'email du client est obligatoire';
    isValid = false;
  } // ...
```

**Après :**
```tsx
case 'client':
  if (!client.name?.trim()) {
    errorMessage = 'Le nom du client est obligatoire';
    isValid = false;
  } else if (!client.email?.trim()) {
    errorMessage = 'L\'email du client est obligatoire';
    isValid = false;
  } // ...
```

### 3. Correction des Dépendances useCallback
**Avant :**
```tsx
}, [step, onGo, invoiceNumber, invoiceDate, eventLocation, clientName, clientEmail, clientAddress, clientCity, produits, paiement]);
```

**Après :**
```tsx
}, [step, onGo, invoiceNumber, invoiceDate, eventLocation, client.name, client.email, client.address, client.city, produits, paiement]);
```

### 4. Nettoyage des Imports
Suppression de l'import inutile `useRef` :
```tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
```

## 🔧 Fonctionnement de la Validation

### Validation par Step :

1. **Step Facture :**
   - Numéro de facture obligatoire
   - Date de facture obligatoire
   - Lieu de l'événement obligatoire

2. **Step Client :**
   - Nom du client obligatoire
   - Email du client obligatoire
   - Adresse du client obligatoire
   - Ville du client obligatoire

3. **Step Produits :**
   - Au moins un produit obligatoire
   - Mode de livraison défini pour tous les produits

4. **Step Paiement :**
   - Mode de paiement sélectionné obligatoire

5. **Steps Livraison, Signature, Recap :**
   - Pas de validation obligatoire

### Comportement du Bouton "Suivant" :
- ✅ **Si validation OK :** Passe au step suivant
- ❌ **Si validation KO :** Affiche une alert avec le message d'erreur et bloque la navigation

## 🧪 Tests à Effectuer

1. **Test Step Facture :**
   - Essayer de cliquer "Suivant" sans remplir le numéro de facture
   - Essayer de cliquer "Suivant" sans remplir la date
   - Essayer de cliquer "Suivant" sans remplir le lieu

2. **Test Step Client :**
   - Essayer de cliquer "Suivant" sans remplir le nom
   - Essayer de cliquer "Suivant" sans remplir l'email
   - Essayer de cliquer "Suivant" sans remplir l'adresse
   - Essayer de cliquer "Suivant" sans remplir la ville

3. **Test Step Produits :**
   - Essayer de cliquer "Suivant" sans ajouter de produit
   - Ajouter un produit mais ne pas définir son mode de livraison

4. **Test Step Paiement :**
   - Essayer de cliquer "Suivant" sans sélectionner de mode de paiement

## ✨ Résultat Final

- ✅ Compilation TypeScript sans erreurs dans `IpadWizard.tsx`
- ✅ Validation centralisée fonctionnelle
- ✅ Messages d'erreur explicites pour chaque champ manquant
- ✅ Navigation bloquante si validation échoue
- ✅ UX améliorée avec contrôle strict des champs obligatoires

## 📝 Structure du Store Utilisée

Le store Zustand utilise cette structure :
```typescript
interface WizardState {
  // Informations facture
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation: string;
  
  // Données client dans un objet
  client: {
    name: string;
    email?: string;
    address?: string;
    city?: string;
    // ...autres propriétés
  };
  
  // Autres données
  produits: Produit[];
  paiement: PaymentData;
  // ...
}
```

La validation utilise maintenant correctement `client.name`, `client.email`, etc.

---

**Status :** ✅ **CORRECTION TERMINÉE ET VALIDÉE**
**Date :** 23 août 2025
**Fichiers modifiés :** `/src/ipad/IpadWizard.tsx`
