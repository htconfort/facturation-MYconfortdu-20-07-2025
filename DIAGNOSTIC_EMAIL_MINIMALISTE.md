# 🔍 DIAGNOSTIC EMAIL MINIMALISTE - Guide de Correction

## 🚨 Problème Identifié
L'email envoyé est devenu minimaliste et ne contient plus le contenu riche (produits, coordonnées bancaires, etc.).

## 🔎 Analyse du Problème

### ✅ Ce qui fonctionne côté Application
1. **Service N8N** : Envoie TOUS les champs nécessaires
   - `produits_html` : Liste des produits formatée en HTML
   - `liste_produits_email` : Liste des produits en texte lisible
   - `rib_html` : Coordonnées bancaires formatées
   - `mode_paiement_avec_details` : Détails de paiement
   - `noms_produits_string` : Noms des produits
   - Et 50+ autres champs...

2. **Payload complet** : Le service `n8nWebhookService.ts` envoie un payload riche avec tous les champs

### ❌ Problème Probable : Configuration N8N
Le workflow N8N utilise probablement un template email basique au lieu d'utiliser les champs riches.

## 🛠️ Solutions à Vérifier

### 1. Vérifier le Template Email N8N
Dans votre workflow N8N, le noeud d'envoi d'email doit utiliser :

**❌ Template Basique (à éviter) :**
```
Bonjour {{$json.nom_du_client}},

Votre facture {{$json.numero_facture}} est prête.

Cordialement,
MYCONFORT
```

**✅ Template Riche (à utiliser) :**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture MYCONFORT {{$json.numero_facture}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- En-tête -->
        <div style="background: linear-gradient(135deg, #477A0C, #5B9212); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🏡 MYCONFORT</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre facture est prête</p>
        </div>

        <!-- Informations Facture -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #477A0C; margin-top: 0;">📋 Détails de votre commande</h2>
            <p><strong>Facture n° :</strong> {{$json.numero_facture}}</p>
            <p><strong>Date :</strong> {{$json.date_facture}}</p>
            <p><strong>Montant TTC :</strong> {{$json.montant_ttc}}€</p>
        </div>

        <!-- Liste des Produits -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #477A0C; margin-top: 0;">🛒 Vos produits</h3>
            <ul style="padding-left: 20px;">
                {{{$json.produits_html}}}
            </ul>
        </div>

        <!-- Informations de Paiement -->
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #477A0C; margin-top: 0;">💳 Modalités de paiement</h3>
            <p><strong>{{$json.mode_paiement_avec_details}}</strong></p>
        </div>

        <!-- Coordonnées Bancaires (si virement) -->
        {{#if $json.afficher_rib}}
        {{{$json.rib_html}}}
        {{/if}}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <p>Merci pour votre confiance !</p>
            <p><strong>MYCONFORT</strong> - Votre spécialiste confort</p>
        </div>
    </div>
</body>
</html>
```

### 2. Vérifier les Champs Utilisés dans N8N
Assurez-vous que le workflow N8N utilise ces champs :
- `{{$json.produits_html}}` pour la liste des produits
- `{{$json.mode_paiement_avec_details}}` pour les détails de paiement
- `{{$json.rib_html}}` pour les coordonnées bancaires
- `{{$json.nom_du_client}}` pour le nom du client
- Etc.

### 3. Test de Diagnostic
Pour tester si les champs arrivent bien, ajoutez temporairement dans le template N8N :
```html
<h4>DEBUG - Champs Reçus :</h4>
<ul>
    <li>Nom produits : {{$json.noms_produits_string}}</li>
    <li>Nombre produits : {{$json.nombre_produits}}</li>
    <li>Mode paiement : {{$json.mode_paiement}}</li>
    <li>Email client : {{$json.email_client}}</li>
</ul>
```

## 🔧 Action Immédiate
1. **Connectez-vous à votre interface N8N**
2. **Ouvrez le workflow "facture-universelle"**
3. **Vérifiez le noeud d'envoi d'email**
4. **Remplacez le template par le template riche ci-dessus**
5. **Testez avec une facture**

## 🎯 Champs Clés à Utiliser
```javascript
// OBLIGATOIRES pour un email riche
$json.nom_du_client          // Nom du client
$json.numero_facture         // Numéro de facture
$json.produits_html          // Liste produits HTML
$json.mode_paiement_avec_details // Détails paiement
$json.montant_ttc           // Montant TTC

// OPTIONNELS mais recommandés
$json.rib_html              // Coordonnées bancaires (si virement)
$json.date_facture          // Date de la facture
$json.noms_produits_string  // Noms des produits (texte)
$json.conseiller            // Nom du conseiller
```

## ✅ Résultat Attendu
Avec le bon template, l'email contiendra :
- ✅ En-tête MYCONFORT stylé
- ✅ Détails de la facture
- ✅ Liste complète des produits avec prix
- ✅ Modalités de paiement détaillées
- ✅ Coordonnées bancaires (si virement)
- ✅ Design professionnel et lisible

## 🚨 Important
Le code côté application (MyConfort) envoie DÉJÀ tous les champs nécessaires. Le problème est uniquement dans la configuration du template email côté N8N.
