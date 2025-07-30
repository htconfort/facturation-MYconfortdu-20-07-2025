# 🔧 CODE NODE N8N - STRUCTURE CORRIGÉE

## ✅ PROBLÈME RÉSOLU CÔTÉ APPLICATION

Notre application envoie maintenant `produits` comme un **tableau d'objets** :

```json
{
  "produits": [
    {
      "nom": "Volet Roulant Alu Premium",
      "quantite": 2,
      "prix_ttc": 550.00,
      "total_ttc": 1100.00,
      "categorie": "Volets Roulants"
    },
    {
      "nom": "Moustiquaire",
      "quantite": 1,
      "prix_ttc": 200.00,
      "total_ttc": 200.00,
      "categorie": "Moustiquaires"
    }
  ]
}
```

## 🛠️ CODE NODE N8N CORRECT

### Version Simple (Recommandée)
```javascript
// ✅ PASSER LES DONNÉES SANS LES MODIFIER
const items = $input.all();
return items; // N8N structure respectée : [{ json: data }]
```

### Version avec Vérification
```javascript
const items = $input.all();

return items.map(item => {
  // Les produits sont maintenant un tableau d'objets ✅
  const produits = item.json.produits || [];
  
  // Vérifier que c'est bien un tableau
  if (Array.isArray(produits) && produits.length > 0) {
    console.log(`✅ ${produits.length} produits trouvés`);
    
    // Générer HTML depuis le tableau si besoin
    const produitsHtml = produits.map(p => 
      `<li><strong>${p.nom}</strong><br>Quantité: ${p.quantite} × ${p.prix_ttc}€ = <strong>${p.total_ttc}€</strong></li>`
    ).join('');
    
    return {
      json: {
        ...item.json,
        produits_html_genere: produitsHtml, // HTML généré côté N8N
        nombre_produits_calcule: produits.length
      }
    };
  } else {
    console.log('❌ Aucun produit ou format incorrect');
    return {
      json: {
        ...item.json,
        produits_html_genere: '<li>Aucun produit spécifié</li>'
      }
    };
  }
});
```

### Version Ultra-Simple
```javascript
// ✅ SI LE CODE NODE NE FAIT RIEN DE SPÉCIAL
return $input.all();
```

## 📧 UTILISATION DANS L'EMAIL

### Option 1 : HTML pré-généré par l'application
```html
{{ $json.produits_html }}
```

### Option 2 : Boucle sur le tableau produits
```html
<ul>
{{#each $json.produits}}
  <li>
    <strong>{{nom}}</strong><br>
    Quantité: {{quantite}} × {{prix_ttc}}€ = <strong>{{total_ttc}}€</strong>
    {{#if remise}}<br><em>Remise: -{{remise}}{{#eq type_remise "percent"}}%{{/eq}}</em>{{/if}}
  </li>
{{/each}}
</ul>
```

### Option 3 : HTML généré par le Code node
```html
{{ $json.produits_html_genere }}
```

## 🎯 VÉRIFICATION

1. **Connectez-vous à N8N** : `https://n8n.srv765811.hstgr.cloud/`
2. **Menu "Executions"** → Dernière exécution
3. **Cliquez sur le Code node** → Vérifiez les données d'entrée
4. **Vous devriez voir** : `produits: [{ nom: "...", quantite: 2, ... }]`

## ✅ RÉSULTAT ATTENDU

**Email avec les vrais produits** :
- Volet Roulant Alu Premium (2x 550€)
- Moustiquaire Enroulable (1x 200€)
- Installation + Pose (1x 200€)

**Plus jamais** les anciens exemples codés en dur ! 🚀

## 🚨 DÉPANNAGE

Si ça ne marche toujours pas :
1. Vérifiez que `items[0].json.produits` est un tableau
2. Ajoutez `console.log(JSON.stringify(items[0].json.produits, null, 2))`
3. Assurez-vous que le Code node retourne bien `[{ json: ... }]`
