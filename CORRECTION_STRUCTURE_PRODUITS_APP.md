# 🔧 CORRECTION STRUCTURE PRODUITS - APPLICATION

## 🎯 PROBLÈME POTENTIEL IDENTIFIÉ

L'expert a raison : notre application envoie `produits` comme **chaîne de caractères** au lieu d'un **tableau d'objets** que N8N attend.

### ❌ **STRUCTURE ACTUELLE (PROBLÉMATIQUE)**
```javascript
produits: "2x Volet Roulant, 1x Installation" // CHAÎNE
```

### ✅ **STRUCTURE CORRECTE ATTENDUE**
```javascript
produits: [ // TABLEAU D'OBJETS
  {
    name: "Volet Roulant Alu",
    quantity: 2,
    priceTTC: 450.00,
    total: 900.00
  },
  {
    name: "Installation", 
    quantity: 1,
    priceTTC: 450.00,
    total: 450.00
  }
]
```

## 🛠️ CORRECTION À APPLIQUER

Dans `src/services/n8nWebhookService.ts`, remplacer :

```typescript
// ❌ ACTUEL (ligne ~112)
produits: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),

// ✅ NOUVEAU (tableau d'objets complets)
produits: invoice.products.map(product => ({
  name: product.name,
  quantity: product.quantity,
  priceTTC: product.priceTTC,
  priceHT: product.priceHT,
  total: product.quantity * product.priceTTC,
  totalHT: product.quantity * product.priceHT,
  category: product.category || '',
  discount: product.discount || 0,
  discountType: product.discountType || 'fixed'
})),

// Garder aussi la chaîne formatée pour compatibilité
produits_text: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),
```

## 🧪 TESTS DE VALIDATION

J'ai envoyé 2 emails de test :
1. **"Client Test Structure Chaîne"** (structure actuelle)
2. **"Client Test Structure Tableau"** (structure corrigée)

### Vérifiez vos emails :
- Si les **2 emails** ont les mêmes anciens produits → Problème N8N
- Si l'email **TABLEAU** a les bons produits → **L'expert a raison, problème APP !**

## ⚡ CORRECTION RAPIDE

Si l'expert a raison, voici le code exact à modifier dans `n8nWebhookService.ts` :

```typescript
// Remplacer la ligne ~112 par :
produits: invoice.products.map(product => ({
  nom: product.name,
  quantite: product.quantity,
  prix_ttc: product.priceTTC,
  prix_ht: product.priceHT,
  total_ttc: product.quantity * product.priceTTC,
  total_ht: product.quantity * product.priceHT,
  categorie: product.category || 'Non spécifiée',
  remise: product.discount || 0,
  type_remise: product.discountType || 'fixed'
})),
```

Une fois corrigé, le Code node N8N trouvera le tableau `produits` et utilisera nos vraies données au lieu des exemples codés en dur ! 🎯
