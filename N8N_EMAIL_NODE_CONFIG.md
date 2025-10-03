# 📧 CONFIGURATION NODE EMAIL N8N - EMAIL CLIENT DYNAMIQUE

## 🎯 OBJECTIF
Envoyer automatiquement l'email avec la facture PDF à l'adresse email du client saisie dans le formulaire.

## ⚙️ CONFIGURATION NODE EMAIL

### 📮 **Champ "To" (Destinataire)**
```
{{$json.email_client}}
```

### 📝 **Champ "Subject" (Objet)**
```
Facture MYCONFORT N°{{$json.numero_facture}} - {{$json.nom_du_client}}
```

### 🏷️ **Champ "From Name" (Nom expéditeur)**
```
MYCONFORT
```

### 📧 **Champ "From Email" (Email expéditeur)**
```
contact@myconfort.fr
```
*Ou votre adresse email professionnelle*

### 📄 **Champ "Text" (Contenu texte)**
```
Bonjour {{$json.nom_du_client}},

Vous trouverez ci-joint votre facture MYCONFORT N°{{$json.numero_facture}}.

Détails de votre facture :
- Date : {{$json.date_facture}}
- Montant total : {{$json.montant_ttc}}€
- Acompte versé : {{$json.acompte}}€
- Montant restant : {{$json.montant_restant}}€
- Mode de paiement : {{$json.mode_paiement}}

{{$json.nombre_cheques > 0 ? "📅 Chèques à venir : " + $json.nombre_cheques + " chèque(s) de " + $json.montant_par_cheque + "€ chacun\n\n📮 Vos chèques sont à envoyer à l'adresse suivante :\nMyconfort\n8, rue du Grégal\n66510 Saint-Hippolyte" : ""}}

Merci de votre confiance.

Cordialement,
L'équipe MYCONFORT
```

### 🌐 **Champ "HTML" (Contenu HTML)**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #477A0C; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .invoice-details { background: #f9f9f9; padding: 15px; border-left: 4px solid #477A0C; margin: 20px 0; }
        .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; }
        .amount { font-weight: bold; color: #477A0C; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 MYCONFORT</h1>
        <p>Votre facture est prête</p>
    </div>
    
    <div class="content">
        <h2>Bonjour {{$json.nom_du_client}},</h2>
        
        <p>Vous trouverez ci-joint votre facture MYCONFORT N°<strong>{{$json.numero_facture}}</strong>.</p>
        
        <div class="invoice-details">
            <h3>📋 Détails de votre facture</h3>
            <ul>
                <li><strong>Date :</strong> {{$json.date_facture}}</li>
                <li><strong>Montant total :</strong> <span class="amount">{{$json.montant_ttc}}€</span></li>
                <li><strong>Acompte versé :</strong> <span class="amount">{{$json.acompte}}€</span></li>
                <li><strong>Montant restant :</strong> <span class="amount">{{$json.montant_restant}}€</span></li>
                <li><strong>Mode de paiement :</strong> {{$json.mode_paiement}}</li>
            </ul>
            
            {{$json.nombre_cheques > 0 ? 
                "<div style='background: #e8f5e8; padding: 10px; border-radius: 5px; margin-top: 10px;'>" +
                "<strong>📅 Chèques à venir :</strong> " + $json.nombre_cheques + " chèque(s) de " + $json.montant_par_cheque + "€ chacun" +
                "</div>" +
                "<div style='background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px; border: 1px solid #ffeaa7;'>" +
                "<strong>📮 Adresse d'envoi des chèques :</strong><br/>" +
                "<strong>Vos chèques sont à envoyer à l'adresse suivante :</strong><br/>" +
                "Myconfort<br/>" +
                "8, rue du Grégal<br/>" +
                "66510 Saint-Hippolyte" +
                "</div>"
                : ""
            }}
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
            <strong>🎯 Produits/Services :</strong>
            <div style="margin-top: 10px;">
                {{{$json.produits_html}}}
            </div>
        </div>
        
        <p style="margin-top: 30px;">Merci de votre confiance !</p>
    </div>
    
    <div class="footer">
        <p><strong>L'équipe MYCONFORT</strong></p>
        <p>Pour toute question, contactez-nous</p>
    </div>
</body>
</html>
```

### 📎 **Section "Attachments" (Pièces jointes)**

**Nom du fichier :**
```
{{$json.nom_facture}}.pdf
```

**Contenu (Binary Data) :**
```
{{Object.keys($binary).length > 0 ? $binary : $json.fichier_facture}}
```

**Content Type :**
```
application/pdf
```

## ✅ **RÉSULTAT**

L'email sera automatiquement envoyé à l'adresse saisie dans le formulaire (`{{$json.email_client}}`) avec :
- ✉️ Un contenu personnalisé avec le nom du client
- 📊 Tous les détails de la facture
- 📎 Le PDF en pièce jointe
- 🎨 Un design professionnel aux couleurs MYCONFORT

## 🧪 **TEST**

Pour tester, utilisez ce payload dans N8N :
```json
{
  "email_client": "test@exemple.com",
  "nom_du_client": "Jean Dupont",
  "numero_facture": "FAC001",
  "montant_ttc": "1520.00",
  "fichier_facture": "JVBERi0xLjQKJcOkw7zDtsO..." 
}
```
