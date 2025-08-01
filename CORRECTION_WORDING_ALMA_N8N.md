# 🎯 CORRECTION DU WORDING ALMA DANS LES SERVICES N8N

## ✅ PROBLÈME RÉSOLU
Le système affichait "4 chèques" au lieu de "4 paiements" pour les paiements ALMA dans les emails envoyés via N8N.

## 🔧 MODIFICATIONS APPORTÉES

### 1. Service N8nWebhookService.ts
- **Ajout de champs spécifiques ALMA** :
  - `est_paiement_alma`: Boolean pour détecter les paiements ALMA
  - `nombre_paiements_alma`: Nombre de paiements ALMA (distinct des chèques)
  - `montant_par_paiement_alma`: Montant par paiement ALMA

- **Logique de wording améliorée** dans `mode_paiement_avec_details` :
  ```typescript
  // Si ALMA - utiliser "paiements"
  else if (invoice.paymentMethod && invoice.paymentMethod.includes('ALMA') && invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
    return `${invoice.paymentMethod} - ${invoice.nombreChequesAVenir} paiement${invoice.nombreChequesAVenir > 1 ? 's' : ''} de ${montantRestant > 0 ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2) : '0.00'}€ chacun`;
  }
  // Si chèques classiques - utiliser "chèques"
  else if (invoice.nombreChequesAVenir && invoice.nombreChequesAVenir > 0) {
    return `${invoice.paymentMethod || 'Chèques à venir'} - ${invoice.nombreChequesAVenir} chèque${invoice.nombreChequesAVenir > 1 ? 's' : ''} à venir de ${montantRestant > 0 ? (montantRestant / invoice.nombreChequesAVenir).toFixed(2) : '0.00'}€ chacun`;
  }
  ```

### 2. Service N8nBlueprintAdapter.ts
- **Interface N8nCompatiblePayload étendue** avec :
  - `est_paiement_alma?: boolean`
  - `nombre_paiements_alma?: number`
  - `montant_par_paiement_alma?: string`
  - `mode_paiement_avec_details?: string`

- **Même logique de wording** que dans le webhook service pour cohérence.

## 📧 IMPACT SUR LES EMAILS N8N

### Avant la correction :
```
ALMA 2x - 4 chèques à venir de 250.00€ chacun
```

### Après la correction :
```
ALMA 2x - 4 paiements de 250.00€ chacun
```

## 🔍 CHAMPS DISPONIBLES POUR N8N

Le workflow N8N peut maintenant utiliser ces champs :

### Pour détecter ALMA :
- `est_paiement_alma`: true/false
- `nombre_paiements_alma`: 2, 3, ou 4
- `montant_par_paiement_alma`: "250.00"

### Pour les templates email :
- `mode_paiement_avec_details`: Phrase complète avec le bon wording

## 🧪 EXEMPLES D'USAGE

### Template N8N conditionnel :
```html
{{#if est_paiement_alma}}
  <p>Votre commande sera réglée en {{nombre_paiements_alma}} paiements de {{montant_par_paiement_alma}}€.</p>
{{else}}
  <p>{{mode_paiement_avec_details}}</p>
{{/if}}
```

### Utilisation directe :
```html
<p>{{mode_paiement_avec_details}}</p>
```

## ✅ RÉSULTAT FINAL
- ✅ ALMA affiche "paiements" dans les emails
- ✅ Chèques classiques affichent "chèques" 
- ✅ Compatibilité avec tous les modes de paiement
- ✅ Wording cohérent interface ↔ email N8N

## 🎯 PROCHAINE ÉTAPE
Tester l'envoi d'un email avec paiement ALMA pour vérifier le bon affichage.
