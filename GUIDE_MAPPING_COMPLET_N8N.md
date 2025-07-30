# 📋 GUIDE COMPLET - MAPPING DE TOUS LES CHAMPS VERS N8N

## ✅ RÉSUMÉ DES AMÉLIORATIONS

Le service `n8nWebhookService.ts` a été mis à jour pour inclure **TOUS les champs** de votre interface de facturation, passant de 25 champs à **48 champs complets**.

### 🎯 AVANT vs APRÈS

**AVANT** : Seulement les champs de base (nom, email, montant, produits)
**APRÈS** : TOUS les champs de saisie disponibles dans N8N

---

## 📊 CHAMPS DISPONIBLES PAR CATÉGORIE

### 🔢 CHAMPS FINANCIERS (8 champs)
- `numero_facture` - Numéro de facture
- `montant_ht` - Montant hors taxes
- `montant_tva` - Montant TVA
- `montant_ttc` - Montant TTC
- `montant_remise` - Montant des remises
- `taux_tva` - Taux de TVA (%)
- `acompte` - Montant de l'acompte
- `montant_restant` - Montant restant à payer

### 👤 CHAMPS CLIENT DÉTAILLÉS (9 champs)
- `nom_du_client` - Nom complet du client
- `email_client` - Email du client
- `telephone_client` - Téléphone du client
- `client_adresse_rue` - Adresse rue (séparée)
- `client_code_postal` - Code postal (séparé)
- `client_ville` - Ville (séparée)
- `client_type_logement` - Type de logement (Maison/Appartement)
- `client_code_porte` - Code porte/étage
- `client_siret` - SIRET du client (si applicable)

### 💳 CHAMPS PAIEMENT ET SIGNATURE (6 champs)
- `mode_paiement` - Mode de paiement
- `signature_presente` - Si facture signée (Oui/Non)
- `date_signature` - Date de signature
- `nombre_cheques` - Nombre de chèques à venir
- `montant_par_cheque` - Montant calculé par chèque
- `mode_paiement_avec_details` - Description complète pour email

### 🚚 CHAMPS LIVRAISON (2 champs)
- `methode_livraison` - Méthode de livraison
- `notes_livraison` - Notes de livraison spéciales

### 📋 CHAMPS MÉTADONNÉES (7 champs)
- `notes_facture` - Notes sur la facture
- `conseiller` - Nom du conseiller
- `lieu_evenement` - Lieu de l'événement/salon
- `conditions_acceptees` - CGV acceptées (Oui/Non)
- `date_creation_facture` - Date de création
- `date_modification_facture` - Date de modification
- `date_facture` - Date de la facture

### 📦 CHAMPS PRODUITS (10 arrays)
- `produits_noms` - Array des noms de produits
- `produits_categories` - Array des catégories
- `produits_quantites` - Array des quantités
- `produits_prix_unitaires` - Array des prix TTC unitaires
- `produits_prix_ht_unitaires` - Array des prix HT unitaires
- `produits_remises` - Array des remises
- `produits_types_remises` - Array des types de remises
- `produits_totaux` - Array des totaux TTC par ligne
- `produits_totaux_ht` - Array des totaux HT par ligne
- `nombre_produits` - Nombre total de produits

---

## 🚀 UTILISATION DANS N8N

### 📧 POUR LES EMAILS AUTOMATIQUES

```javascript
// Utilisation des champs dans un template email N8N
const emailContent = `
Bonjour ${$json.nom_du_client},

Votre facture ${$json.numero_facture} d'un montant de ${$json.montant_ttc}€ est prête.

Détails du client :
- Adresse : ${$json.client_adresse_rue}, ${$json.client_code_postal} ${$json.client_ville}
- Type de logement : ${$json.client_type_logement}
- Code d'accès : ${$json.client_code_porte}

Mode de règlement : ${$json.mode_paiement_avec_details}

Livraison : ${$json.methode_livraison}
Notes : ${$json.notes_livraison}

Conseiller : ${$json.conseiller}
`;
```

### 📊 POUR LES TRAITEMENTS EN BOUCLE

```javascript
// Traitement de chaque produit dans N8N
const products = [];
for (let i = 0; i < $json.nombre_produits; i++) {
  products.push({
    nom: $json.produits_noms[i],
    categorie: $json.produits_categories[i],
    quantite: $json.produits_quantites[i],
    prix_ht: $json.produits_prix_ht_unitaires[i],
    prix_ttc: $json.produits_prix_unitaires[i],
    remise: $json.produits_remises[i],
    type_remise: $json.produits_types_remises[i],
    total_ht: $json.produits_totaux_ht[i],
    total_ttc: $json.produits_totaux[i]
  });
}
```

### 💾 POUR LA BASE DE DONNÉES

```javascript
// Structure complète pour sauvegarde BDD
const factureComplete = {
  // Identifiants
  numero: $json.numero_facture,
  date: $json.date_facture,
  
  // Client
  client: {
    nom: $json.nom_du_client,
    email: $json.email_client,
    telephone: $json.telephone_client,
    adresse: {
      rue: $json.client_adresse_rue,
      code_postal: $json.client_code_postal,
      ville: $json.client_ville,
      type_logement: $json.client_type_logement,
      code_porte: $json.client_code_porte
    },
    siret: $json.client_siret
  },
  
  // Financier
  montants: {
    ht: $json.montant_ht,
    tva: $json.montant_tva,
    ttc: $json.montant_ttc,
    remise: $json.montant_remise,
    acompte: $json.acompte,
    restant: $json.montant_restant
  },
  
  // Paiement
  paiement: {
    mode: $json.mode_paiement,
    cheques: $json.nombre_cheques,
    montant_par_cheque: $json.montant_par_cheque,
    signe: $json.signature_presente,
    date_signature: $json.date_signature
  }
};
```

---

## 🎯 EXEMPLES D'AUTOMATISATIONS POSSIBLES

### 1. 📧 EMAIL PERSONNALISÉ SELON LE TYPE DE LOGEMENT
```javascript
if ($json.client_type_logement === 'Appartement') {
  // Instructions spéciales pour appartement
  emailTemplate = apartmentDeliveryTemplate;
} else {
  // Instructions pour maison
  emailTemplate = houseDeliveryTemplate;
}
```

### 2. 💳 WORKFLOW SELON LE MODE DE PAIEMENT
```javascript
if ($json.nombre_cheques > 0) {
  // Workflow pour paiement échelonné
  createPaymentSchedule($json.nombre_cheques, $json.montant_par_cheque);
} else {
  // Workflow pour paiement comptant
  processImmediatePayment($json.montant_ttc);
}
```

### 3. 🚚 LIVRAISON SELON LES NOTES
```javascript
if ($json.notes_livraison.includes('urgent')) {
  // Livraison express
  scheduleExpressDelivery();
} else if ($json.notes_livraison.includes('matin')) {
  // Livraison matin
  scheduleMorningDelivery();
}
```

### 4. 📊 RAPPORTS PAR CONSEILLER
```javascript
// Grouper les ventes par conseiller
const salesReport = {
  conseiller: $json.conseiller,
  vente: {
    montant: $json.montant_ttc,
    produits: $json.nombre_produits,
    client: $json.nom_du_client,
    date: $json.date_facture
  }
};
```

---

## ✅ AVANTAGES DE CE MAPPING COMPLET

### 🎯 POUR VOUS
- **Accès total** : Tous vos champs de saisie disponibles dans N8N
- **Flexibilité** : Créez des automatisations sur n'importe quel critère
- **Séparation** : Champs séparés (adresse, ville) pour filtrage facile
- **Arrays** : Traitement en boucle des produits

### 🤖 POUR N8N
- **Pas de parsing** : Données déjà structurées
- **Types cohérents** : Nombres, dates, booléens
- **Performance** : Accès direct sans transformation
- **Maintenance** : Structure claire et documentée

### 📈 POUR VOS AUTOMATISATIONS
- **Emails riches** : Toutes les infos dans les templates
- **Conditions précises** : Workflows selon tous les critères
- **Intégrations** : Export vers CRM, comptabilité, etc.
- **Rapports détaillés** : Analytics sur tous les champs

---

## 🚀 PROCHAINES ÉTAPES

1. **Testez le nouveau mapping** avec le bouton "📤 Drive" de votre application
2. **Vérifiez dans N8N** que tous les champs arrivent bien
3. **Créez vos automatisations** en utilisant les nouveaux champs
4. **Documentez vos workflows** N8N pour votre équipe

---

## 📞 SUPPORT

Si vous avez besoin d'aide pour utiliser ces nouveaux champs dans vos workflows N8N, vous avez maintenant accès à **48 champs complets** au lieu des 25 de base !

**Tous les champs de votre interface sont maintenant disponibles dans N8N** ✅
