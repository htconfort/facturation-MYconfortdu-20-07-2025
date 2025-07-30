# 🔧 GUIDE DE TEST - CORRECTION MAPPING PRODUITS PDF

## ✅ Corrections Apportées

1. **Mapping dynamique dans `advancedPdfService.ts`** :
   - Détection automatique de `products`, `items` ou `produits`
   - Mapping intelligent des propriétés (`name`/`description`, `quantity`/`qty`, etc.)
   - Logs détaillés pour diagnostic

2. **Debug ultime dans `App.tsx`** :
   - Logs de la structure exacte envoyée au service PDF
   - Vérification des propriétés de chaque produit

## 🧪 Test de Validation

### Étape 1: Accéder à l'application
- URL: http://localhost:5174
- L'application doit être démarrée avec `npm run dev`

### Étape 2: Créer une facture de test
Utiliser les données suivantes (générées par `test-pdf-mapping.mjs`) :

**Client** :
- Nom: Client Test
- Email: test@example.com  
- Téléphone: 0123456789
- Adresse: 123 Rue de Test, 75015 Paris

**Produits** :
1. Matelas Premium King Size - Qté: 2 - Prix: 899.99€
2. Sommier tapissier 160x200 - Qté: 1 - Prix: 456.50€ - Remise: 10%
3. Oreiller mémoire de forme - Qté: 4 - Prix: 89.90€

**Totaux attendus** :
- Total HT: 2142.03€
- Total TVA (20%): 428.40€
- **Total TTC: 2570.43€**
- Acompte: 500€
- Restant dû: 2070.43€

### Étape 3: Tester la génération PDF
1. Remplir tous les champs obligatoires
2. Cliquer sur "Envoyer PDF" ou "Télécharger PDF"
3. **Vérifier les logs dans la console** :
   - Logs de `App.tsx` : structure envoyée au service PDF
   - Logs de `advancedPdfService.ts` : mapping des produits

### Étape 4: Validation
**✅ SUCCÈS** si le PDF contient les montants exacts :
- Total TTC: 2570.43€
- Les détails des 3 produits avec les bonnes quantités et prix

**❌ ÉCHEC** si le PDF montre :
- Des montants hardcodés (375€, 1500€, etc.)
- Des produits manquants ou incorrects
- Des totaux qui ne correspondent pas

## 🔍 Diagnostic des Logs

### Logs attendus dans la console :

1. **App.tsx** :
```
🔍 DIAGNOSTIC AVANT GÉNÉRATION PDF
📋 Invoice data COMPLET: [objet complet]
🛒 PRODUITS RÉELS DE LA FACTURE AVANT PDF: {products: [...], productsCount: 3}
🏷️ Produit 1: {name: "Matelas Premium King Size", quantity: 2, priceTTC: 899.99}
📤 STRUCTURE EXACTE ENVOYÉE AU SERVICE PDF: [structure complète]
```

2. **advancedPdfService.ts** :
```
🔍 CONVERTINVOICEDATA - Structure reçue: {hasProducts: true, productsLength: 3}
✅ Utilisation de invoice.products: [array de 3 produits]
🏷️ Mapping produit 1: {name: "Matelas Premium King Size", quantity: 2, priceTTC: 899.99}
```

## 🚨 Actions en cas d'échec

Si les montants ne correspondent toujours pas :

1. **Vérifier les logs** pour identifier où le mapping échoue
2. **Rechercher des montants hardcodés** restants dans le code
3. **Analyser la structure de données** transmise vs reçue
4. **Corriger le mapping** selon les logs de diagnostic

## 📝 Structure de test disponible

Le fichier `test-invoice-structure.json` contient la structure complète pour reproduire le test facilement.
