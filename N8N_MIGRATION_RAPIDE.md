# 🚀 MIGRATION RAPIDE N8N - Format Standard

## ⚡ **CHANGEMENTS IMMÉDIATS DANS N8N**

Votre application envoie maintenant les données au **format standard N8N**. Voici les changements à faire :

### **1. 📧 Node "Envoi Email Client"**

**CHANGEZ LE CHAMP "TO" :**
```javascript
// ❌ ANCIEN
{{$json.clientEmail}}

// ✅ NOUVEAU (Format Standard)
{{$json.client_email}}
```

### **2. 💰 Montants dans vos nodes**

```javascript
// ❌ ANCIEN
{{$json.totalTTC}}

// ✅ NOUVEAU (Format Standard)
{{$json.amount}}              // Montant principal (recommandé)
// OU
{{$json.amount_ttc}}          // Si vous voulez être explicite
```

### **3. 👤 Nom du client**

```javascript
// ❌ ANCIEN
{{$json.clientName}}

// ✅ NOUVEAU (Format Standard)
{{$json.client_name}}
```

### **4. 📄 PDF (reste identique)**

```javascript
// ✅ NOUVEAU (pas de changement)
{{$json.pdf_base64}}
```

---

## 🔥 **LISTE COMPLÈTE DES CHANGEMENTS**

| **Ancien Format** | **Nouveau Format Standard** | **Description** |
|-------------------|------------------------------|-----------------|
| `clientEmail` | `client_email` | Email du client |
| `clientName` | `client_name` | Nom du client |
| `clientPhone` | `client_phone` | Téléphone |
| `totalTTC` | `amount` | Montant principal |
| `totalHT` | `amount_ht` | Montant HT |
| `products` | `items` | Liste des produits |
| `invoiceNumber` | `invoice_number` | Numéro de facture |
| `pdfBase64` | `pdf_base64` | PDF en base64 |

---

## 🧪 **NOUVEAU CODE DE TEST**

**Remplacez votre node de debug par :**

```javascript
console.log("=== FORMAT STANDARD N8N ===");
console.log("✅ Email:", $json.client_email);
console.log("✅ Nom:", $json.client_name);
console.log("✅ Montant:", $json.amount, "€");
console.log("✅ Produits:", $json.items_count);
console.log("✅ PDF:", $json.pdf_base64 ? "PRÉSENT" : "ABSENT");

// Vérification champs standards
const required = ['invoice_number', 'client_email', 'amount', 'items'];
console.log("Champs standards:");
required.forEach(field => {
  console.log(`- ${field}:`, $json[field] ? "✅" : "❌");
});

return $input.all();
```

---

## ⚡ **ACTIONS IMMÉDIATES**

1. **Ouvrez votre workflow N8N**
2. **Modifiez le node "Envoi Email Client"** :
   - Changez `{{$json.clientEmail}}` → `{{$json.client_email}}`
3. **Sauvegardez**
4. **Testez** depuis l'application

## ✅ **RÉSULTAT ATTENDU**

- ✅ L'email sera envoyé correctement
- ✅ Le format respecte les standards N8N
- ✅ Compatibilité avec d'autres outils N8N
- ✅ Meilleure lisibilité des workflows

**Votre intégration sera maintenant conforme aux standards N8N !**
