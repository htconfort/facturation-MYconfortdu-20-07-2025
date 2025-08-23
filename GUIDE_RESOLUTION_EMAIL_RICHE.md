# 🔧 GUIDE DE RÉSOLUTION - Email Minimaliste vers Email Riche

## 🎯 Objectif
Remplacer le template email minimaliste par un template riche qui utilise tous les champs envoyés par l'application MyConfort.

## 📊 Diagnostic Confirmé
✅ **L'application MyConfort envoie TOUS les champs nécessaires**
✅ **Le service N8N reçoit bien le payload complet**
❌ **Le template email N8N utilise un format minimaliste**

## 🛠️ Solution : Mise à Jour du Template N8N

### Étape 1 : Accéder à N8N
1. Connectez-vous à votre interface N8N
2. Ouvrez le workflow **"facture-universelle"**
3. Localisez le nœud d'**envoi d'email**

### Étape 2 : Identifier le Template Actuel
Le template actuel ressemble probablement à ceci :
```
Bonjour {{$json.nom_du_client}},

Votre facture {{$json.numero_facture}} est prête.
Montant : {{$json.montant_ttc}}€

Cordialement,
MYCONFORT
```

### Étape 3 : Remplacer par le Template Riche
1. **Copiez le contenu** du fichier `TEMPLATE_EMAIL_N8N_COMPLET.html`
2. **Collez-le** dans le champ "HTML Body" du nœud email N8N
3. **Vérifiez** que le "Content Type" est réglé sur "HTML"

### Étape 4 : Configuration du Nœud Email
```javascript
// Configuration recommandée pour le nœud Email
Subject: Facture MYCONFORT {{$json.numero_facture}} - {{$json.nom_du_client}}
To: {{$json.email_client}}
Content Type: HTML
HTML Body: [Contenu du template TEMPLATE_EMAIL_N8N_COMPLET.html]
```

### Étape 5 : Test
1. **Sauvegardez** le workflow N8N
2. **Testez** avec une facture depuis MyConfort
3. **Vérifiez** que l'email contient :
   - ✅ Liste complète des produits
   - ✅ Détails de paiement
   - ✅ Coordonnées bancaires (si virement)
   - ✅ Design professionnel

## 🔍 Champs Clés Utilisés dans le Template

### Informations de Base
- `{{$json.nom_du_client}}` - Nom du client
- `{{$json.numero_facture}}` - Numéro de facture
- `{{$json.date_facture}}` - Date de la facture
- `{{$json.montant_ttc}}` - Montant TTC

### Produits
- `{{{$json.produits_html}}}` - Liste des produits en HTML (⚠️ 3 accolades pour HTML brut)
- `{{$json.noms_produits_string}}` - Noms des produits en texte
- `{{$json.nombre_produits}}` - Nombre de produits

### Paiement
- `{{$json.mode_paiement_avec_details}}` - Détails complets du paiement
- `{{$json.acompte}}` - Montant de l'acompte
- `{{$json.montant_restant}}` - Montant restant à payer

### Coordonnées Bancaires (conditionnelles)
- `{{#if $json.afficher_rib}}` - Condition d'affichage
- `{{{$json.rib_html}}}` - HTML des coordonnées bancaires

### Métadonnées
- `{{$json.conseiller}}` - Nom du conseiller
- `{{$json.notes_facture}}` - Notes de la facture
- `{{$json.lieu_evenement}}` - Lieu de l'événement

## ⚠️ Points Importants

### 1. Accolades HTML
Pour les champs contenant du HTML (produits_html, rib_html), utilisez **3 accolades** :
```
{{{$json.produits_html}}}  ✅ Correct
{{$json.produits_html}}    ❌ Incorrect (HTML échappé)
```

### 2. Conditions
Pour les champs optionnels, utilisez les conditions :
```
{{#if $json.afficher_rib}}
    {{{$json.rib_html}}}
{{/if}}
```

### 3. Fallback
Le template inclut des fallbacks pour les anciens emails.

## 🧪 Test de Validation

Après la mise à jour, testez avec :
1. **Facture avec virement** → Doit afficher les coordonnées bancaires
2. **Facture avec acompte** → Doit afficher le montant restant
3. **Facture avec plusieurs produits** → Doit lister tous les produits
4. **Facture avec remises** → Doit afficher les remises

## 🎯 Résultat Attendu

L'email final contiendra :
- 🎨 **Design professionnel** avec couleurs MYCONFORT
- 📋 **Informations complètes** de la facture
- 🛒 **Liste détaillée** des produits avec prix
- 💳 **Modalités de paiement** claires
- 🏦 **Coordonnées bancaires** (si virement)
- 👨‍💼 **Informations conseiller**
- 📱 **Compatible mobile**

## 🚨 En Cas de Problème

Si l'email reste minimaliste après la mise à jour :
1. **Vérifiez** que le workflow N8N a bien été sauvegardé
2. **Contrôlez** les logs N8N pour voir les erreurs de template
3. **Testez** d'abord avec un template simple pour valider la réception des données
4. **Contactez-nous** si les champs n'arrivent pas dans N8N

## ✅ Validation

Email riche = ✅ Problème résolu
Email minimaliste = ❌ Vérifier la configuration N8N
