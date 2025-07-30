# 🔧 TEST RAPIDE - CORRECTION MAPPING PDF

## 🎯 Objectif
Vérifier que le PDF généré utilise les vrais produits et non des montants hardcodés.

## 📋 Test Simple en 3 Étapes

### Étape 1: Ouvrir l'Application
- URL: http://localhost:5174
- Ouvrir la console du navigateur (F12)

### Étape 2: Charger le Script de Test
Copier-coller le contenu de `console-test-pdf.js` dans la console et appuyer sur Entrée.

Le script va :
- ✅ Créer une facture test avec 2 produits (total attendu: 500€)
- ✅ Calculer le total comme le fait l'aperçu HTML
- ✅ Préparer les instructions pour tester le PDF

### Étape 3: Tester la Génération PDF
Dans la console, exécuter :
```javascript
AdvancedPDFService.downloadPDF(window.testInvoiceConsole)
```

## 🔍 Résultats Attendus

### ✅ SI LA CORRECTION FONCTIONNE
Le PDF téléchargé doit afficher :
- **Total TTC: 500.00€**
- 2 produits avec les bonnes quantités et prix
- Logs de debug dans la console montrant le mapping correct

### ❌ SI LE PROBLÈME PERSISTE
Le PDF téléchargé affiche :
- Des montants incorrects (375€, 1500€, etc.)
- Pas les vrais produits de la facture test
- Logs de debug montrant un problème dans le mapping

## 🔍 Diagnostic des Logs

Si le test échoue, regarder les logs dans la console :

1. **App.tsx** - Structure envoyée au PDF :
   ```
   📤 STRUCTURE EXACTE ENVOYÉE AU SERVICE PDF: {...}
   ```

2. **advancedPdfService.ts** - Mapping des produits :
   ```
   🔍 CONVERTINVOICEDATA - Structure reçue: {...}
   ✅ Mapping produit 1: {...}
   ```

3. **addProductsSectionLikeHTML** - Données du tableau :
   ```
   📊 GÉNÉRATION TABLEAU PDF - data.items reçu: [...]
   ```

## 🛠️ Actions selon le Résultat

### Si le test RÉUSSIT (PDF = 500€)
1. La correction fonctionne ! ✅
2. Nettoyer les logs de debug
3. Tester avec une vraie facture dans l'app

### Si le test ÉCHOUE (PDF ≠ 500€)
1. Analyser les logs pour identifier où le mapping échoue
2. Vérifier que `convertInvoiceData` reçoit les bons produits
3. Corriger le mapping selon les informations des logs
4. Re-tester jusqu'à ce que ça fonctionne

## 📱 Test avec l'Application Complète

Une fois le test console réussi :
1. Remplir une facture dans l'interface
2. Ajouter quelques produits
3. Générer le PDF via "Envoyer PDF" ou "Télécharger PDF"
4. Vérifier que les montants correspondent à l'aperçu
