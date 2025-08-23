# 🔧 GUIDE DE DÉBOGAGE N8N - AFFICHAGE DES PRODUITS DANS LES EMAILS

## 🎯 PROBLÈME IDENTIFIÉ
Les noms de produits n'apparaissent pas dans les emails N8N malgré leur présence dans le payload.

## 📦 CHAMPS PRODUITS DISPONIBLES DANS LE PAYLOAD
L'application envoie **TOUS** ces champs vers N8N :

### 1. **Champs de listing simple** (pour affichage direct)
```json
{
  "noms_produits_string": "Produit A, Produit B, Produit C",
  "resume_produits": "Produit A et 2 autres produits",
  "liste_produits_email": "• Produit A - Quantité: 2 - Prix: 100€\n• Produit B - Quantité: 1 - Prix: 50€"
}
```

### 2. **Champs tableau** (pour traitement N8N)
```json
{
  "produits_noms": ["Produit A", "Produit B", "Produit C"],
  "produits_categories": ["Pompe à chaleur", "Climatisation", "..."],
  "produits_quantites": [2, 1, 3],
  "produits_prix_unitaires": ["100.00", "50.00", "25.00"]
}
```

### 3. **Champ HTML** (pour emails riches)
```json
{
  "produits_html": "<li><strong>Produit A</strong><br>Quantité: 2 × 100€ = <strong>200€</strong></li>"
}
```

### 4. **Champ tableau d'objets** (structure complète)
```json
{
  "produits": [
    {
      "nom": "Produit A",
      "quantite": 2,
      "prix_ttc": 100,
      "total_ttc": 200,
      "categorie": "Pompe à chaleur"
    }
  ]
}
```

## 🔍 DIAGNOSTIC CÔTÉ N8N

### ✅ 1. Vérifier la réception du payload
Dans votre workflow N8N, ajoutez un nœud **"Code"** après le webhook pour déboguer :

```javascript
// DIAGNOSTIC: Afficher tout le payload reçu
console.log("📦 PAYLOAD COMPLET REÇU:", JSON.stringify($input.all(), null, 2));

// DIAGNOSTIC: Vérifier spécifiquement les champs produits
const data = $input.first().json;
console.log("🛍️ CHAMPS PRODUITS DÉTECTÉS:");
console.log("- noms_produits_string:", data.noms_produits_string);
console.log("- produits_noms:", data.produits_noms);
console.log("- liste_produits_email:", data.liste_produits_email);
console.log("- resume_produits:", data.resume_produits);
console.log("- produits (array):", data.produits);

return $input.all();
```

### ✅ 2. Vérifier le template email
Dans votre nœud **"Send Email"** (Gmail/Outlook/etc.), utilisez ces syntaxes :

#### Option A : Liste simple
```
Produits commandés : {{ $json.noms_produits_string }}
```

#### Option B : Résumé
```
Commande : {{ $json.resume_produits }}
```

#### Option C : Liste détaillée (texte)
```
Détail des produits :
{{ $json.liste_produits_email }}
```

#### Option D : Liste détaillée (HTML)
```html
<h3>Produits commandés :</h3>
<ul>
{{{ $json.produits_html }}}
</ul>
```

#### Option E : Boucle sur le tableau (avancé)
```html
<h3>Produits :</h3>
<ul>
{{#each $json.produits}}
  <li><strong>{{this.nom}}</strong> - Quantité: {{this.quantite}} - Prix: {{this.prix_ttc}}€</li>
{{/each}}
</ul>
```

### ✅ 3. Diagnostic des variables N8N
Vérifiez que les variables sont bien reconnues :

1. **Dans l'éditeur N8N**, cliquez sur le champ email
2. **Utilisez le sélecteur de variables** plutôt que de taper manuellement
3. **Recherchez** "produits" ou "noms" dans la liste
4. **Vérifiez** que les champs apparaissent dans la liste

## 🔧 SOLUTIONS COURANTES

### ❌ Problème : "Variable non trouvée"
**Cause :** Le webhook ne reçoit pas les données
**Solution :**
```javascript
// Dans un nœud Code, afficher le payload brut
console.log("RAW DATA:", $input.first());
```

### ❌ Problème : "Champ vide dans l'email"
**Cause :** Mauvaise syntaxe dans le template
**Solutions :**
- Utiliser `{{ $json.noms_produits_string }}` (pas `{{ noms_produits_string }}`)
- Vérifier les majuscules/minuscules
- Tester avec un champ simple comme `{{ $json.numero_facture }}`

### ❌ Problème : "HTML non interprété"
**Cause :** Email en mode texte seulement
**Solution :**
- Activer le mode HTML dans les paramètres du nœud email
- Ou utiliser `{{{ $json.produits_html }}}` (3 accolades pour HTML)

## 🧪 TEST RAPIDE N8N

### 1. Créer un workflow de test minimal :
```
Webhook → Code (diagnostic) → Send Email (test)
```

### 2. Dans le nœud Code :
```javascript
const data = $input.first().json;
return [{
  json: {
    test_produits: data.noms_produits_string || "CHAMP MANQUANT",
    test_resume: data.resume_produits || "CHAMP MANQUANT",
    payload_size: JSON.stringify(data).length,
    all_fields: Object.keys(data).filter(k => k.includes('produit'))
  }
}];
```

### 3. Dans l'email de test :
```
TEST PRODUITS N8N :
- Liste : {{ $json.test_produits }}
- Résumé : {{ $json.test_resume }}
- Taille payload : {{ $json.payload_size }} caractères
- Champs produits disponibles : {{ $json.all_fields }}
```

## 📋 CHECKLIST DE VÉRIFICATION

- [ ] Le webhook N8N reçoit bien le payload (status 200)
- [ ] Les champs produits sont présents dans le payload (nœud Code diagnostic)
- [ ] Le template email utilise la bonne syntaxe `{{ $json.nom_champ }}`
- [ ] Le mode HTML est activé si vous utilisez `produits_html`
- [ ] Test avec un champ simple (ex: `numero_facture`) qui fonctionne
- [ ] Test avec `noms_produits_string` (le plus simple)
- [ ] Pas de caractères spéciaux qui cassent le template

## 🚀 SOLUTION RECOMMANDÉE

**Pour un affichage simple et robuste, utilisez :**

```
Produits commandés : {{ $json.noms_produits_string }}
```

**Pour un affichage détaillé en texte :**

```
{{ $json.liste_produits_email }}
```

Ces deux champs sont **garantis d'être présents** et **formatés correctement** par l'application MyConfort.

## 📞 SI LE PROBLÈME PERSISTE

1. **Envoyez-moi** le screenshot de votre workflow N8N
2. **Envoyez-moi** le template email que vous utilisez
3. **Testez** avec le nœud Code diagnostic ci-dessus
4. **Vérifiez** les logs N8N pour voir si le payload arrive

Le problème est **très probablement côté configuration N8N**, pas côté application MyConfort qui envoie tous les champs nécessaires.
