# 🔍 GUIDE DE VÉRIFICATION - STATUT DE LIVRAISON DANS N8N

## 📋 Nouveaux champs ajoutés au webhook

### 🎯 **Objectif**
Vérifier que les statuts de livraison (emporté/à livrer) arrivent correctement dans votre workflow N8N.

### 📦 **Structure des données**

#### **1. Dans chaque produit individuel :**
```json
{
  "produits": [
    {
      "nom": "MATELAS BAMBOU 80x200",
      "quantite": 1,
      "prix_ttc": 299.99,
      "statut_livraison": "a_livrer",    // 🆕 NOUVEAU CHAMP
      "categorie": "Matelas"
    },
    {
      "nom": "OREILLER MÉMOIRE",
      "quantite": 2,
      "prix_ttc": 59.99,
      "statut_livraison": "emporte",     // 🆕 NOUVEAU CHAMP
      "categorie": "Oreillers"
    }
  ]
}
```

#### **2. Arrays séparés pour accès facile :**
```json
{
  "produits_noms": ["MATELAS BAMBOU 80x200", "OREILLER MÉMOIRE"],
  "produits_statuts_livraison": ["a_livrer", "emporte"]  // 🆕 NOUVEAU CHAMP
}
```

#### **3. Statistiques globales :**
```json
{
  "nombre_produits_a_livrer": 1,                         // 🆕 NOUVEAU CHAMP
  "nombre_produits_emportes": 1,                         // 🆕 NOUVEAU CHAMP
  "noms_produits_a_livrer": "MATELAS BAMBOU 80x200",     // 🆕 NOUVEAU CHAMP
  "noms_produits_emportes": "OREILLER MÉMOIRE",          // 🆕 NOUVEAU CHAMP
  "a_une_livraison": "Oui",                              // 🆕 NOUVEAU CHAMP
  "a_des_produits_emportes": "Oui"                       // 🆕 NOUVEAU CHAMP
}
```

## ✅ **Étapes de vérification dans N8N**

### **1. Vérifier la réception des données**
1. Allez dans votre workflow N8N
2. Cliquez sur le node **Webhook** (déclencheur)
3. Envoyez une facture test depuis l'application MyConfort
4. Regardez les **"Données d'exécution"** du webhook

### **2. Chercher les nouveaux champs**
Dans les données reçues, recherchez :
- `statut_livraison` dans les objets produits
- `produits_statuts_livraison` dans le payload principal
- Les statistiques `nombre_produits_a_livrer`, etc.

### **3. Valeurs attendues**
- `"a_livrer"` pour les produits à livrer
- `"emporte"` pour les produits emportés

## 🔧 **Expressions N8N utiles**

### **Accéder aux statuts dans un node :**
```javascript
// Récupérer tous les statuts de livraison
{{ $json.produits_statuts_livraison }}

// Récupérer le statut du premier produit
{{ $json.produits[0].statut_livraison }}

// Filtrer les produits à livrer seulement
{{ $json.noms_produits_a_livrer }}

// Vérifier s'il y a des livraisons
{{ $json.a_une_livraison }}
```

### **Conditions pour brancher la logique :**
```javascript
// Si il y a des produits à livrer
$json.nombre_produits_a_livrer > 0

// Si il y a des produits emportés
$json.nombre_produits_emportes > 0

// Si TOUS les produits sont emportés
$json.nombre_produits_emportes === $json.nombre_produits
```

## 📧 **Utilisation pour l'email**

### **Dans le template d'email, vous pouvez maintenant :**
```html
{{#if a_une_livraison}}
<h3>🚛 Produits à livrer :</h3>
<p>{{ noms_produits_a_livrer }}</p>
{{/if}}

{{#if a_des_produits_emportes}}
<h3>📦 Produits à emporter en magasin :</h3>
<p>{{ noms_produits_emportes }}</p>
{{/if}}
```

## 🚨 **Points de contrôle**

### **✅ Vérifications obligatoires :**
1. [ ] Le champ `statut_livraison` existe dans chaque produit
2. [ ] Les valeurs sont `"a_livrer"` ou `"emporte"` (pas autre chose)
3. [ ] Les statistiques correspondent au nombre réel de produits
4. [ ] Les listes de noms sont correctes et séparées par des virgules

### **🔍 Debug si problème :**
1. Vérifiez la console de l'application (F12)
2. Cherchez les logs "DIAGNOSTIC AVANT ENVOI N8N"
3. Vérifiez que `isPickupOnSite` est défini sur chaque produit
4. Testez avec le script `test-statut-livraison-webhook.js`

## 🎯 **Test recommandé**

1. Créez une facture avec 2 produits
2. Mettez un produit en "À livrer" (rouge)
3. Mettez un produit en "Emporté" (vert)
4. Envoyez la facture
5. Vérifiez dans N8N que vous avez :
   - `nombre_produits_a_livrer: 1`
   - `nombre_produits_emportes: 1`
   - `a_une_livraison: "Oui"`
   - `a_des_produits_emportes: "Oui"`

## 📞 **Support**

Si les données n'arrivent pas correctement :
1. Vérifiez que l'application est bien à jour
2. Testez le script de diagnostic
3. Vérifiez les logs dans la console navigateur
4. Contactez le support technique avec les logs
