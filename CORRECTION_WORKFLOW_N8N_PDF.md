# 🔧 CORRECTION WORKFLOW N8N - PIÈCE JOINTE PDF MANQUANTE

## 🐛 PROBLÈME IDENTIFIÉ
L'email client est envoyé mais **sans la pièce jointe PDF** de la facture.

## 🔍 DIAGNOSTIC
Dans le workflow N8N actuel :
1. ✅ Le PDF base64 est reçu dans `fichier_facture`
2. ✅ Le node "Code3" prépare le PDF en binaire
3. ❌ Le node "✉️ Envoi Email Client" n'utilise pas la donnée binaire

## 🛠️ CORRECTIONS À APPLIQUER DANS N8N

### 1. **Node "✉️ Envoi Email Client" - Ajouter la pièce jointe**

**Paramètres actuels :**
```json
{
  "sendTo": "= {{ ... }}",
  "subject": "MyCoNfort - Facture",
  "message": "={{ $json.body_html }}",
  "options": {}
}
```

**Paramètres corrigés :**
```json
{
  "sendTo": "= {{ ... }}",
  "subject": "MyCoNfort - Facture",
  "message": "={{ $json.body_html }}",
  "options": {
    "attachments": [
      {
        "name": "={{ $json.nom_facture }}.pdf",
        "data": "={{ $binary.facture_pdf.data }}",
        "type": "application/pdf"
      }
    ]
  }
}
```

### 2. **Alternative : Utiliser le champ binaire directement**

Si l'option `attachments` ne fonctionne pas, modifier le node "✉️ Envoi Email Client" :

**Dans les options avancées :**
- **Attachments** : `{{ $binary.facture_pdf }}`
- **Attachment Name** : `{{ $json.nom_facture }}.pdf`

### 3. **Vérification du node "Code3"**

S'assurer que le node "Code3" génère bien la donnée binaire :

```javascript
// Le node Code3 doit retourner :
return [{
  json: j,
  binary: {
    facture_pdf: {
      data: b64,
      mimeType: 'application/pdf',
      fileName: fileName,
    },
  },
}];
```

## 🧪 TEST DE VALIDATION

### 1. **Test avec facture de test**
```json
{
  "numero_facture": "TEST-PDF-001",
  "date_facture": "2025-10-08",
  "email_client": "test@example.com",
  "nom_du_client": "Client Test",
  "fichier_facture": "JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K"
}
```

### 2. **Vérifications à faire**
- ✅ L'email est envoyé
- ✅ La pièce jointe PDF est présente
- ✅ Le PDF s'ouvre correctement
- ✅ Le contenu du PDF correspond à la facture

## 🔄 WORKFLOW CORRIGÉ

```
📥 Webhook Facture
    ↓
Code1 (Normalisation)
    ↓
If (Filtrage)
    ↓
Code3 (Préparation PDF binaire) ← CRITIQUE
    ↓
Code4 (HTML produits)
    ↓
Code6 (Template email)
    ↓
✉️ Envoi Email Client ← AJOUTER PIÈCE JOINTE ICI
    ↓
📊 Google Sheets
    ↓
📥 Supabase
```

## 🎯 RÉSULTAT ATTENDU

Après correction :
- ✅ Email client envoyé avec pièce jointe PDF
- ✅ PDF contient la facture complète
- ✅ Format unifié (même que l'impression)
- ✅ Logo centré, informations client à droite

## 📞 SUPPORT

Si le problème persiste :
1. Vérifier les logs N8N
2. Tester avec un PDF simple
3. Vérifier les permissions Gmail OAuth2
4. Contrôler la taille du PDF (limite Gmail : 25MB)
