# 🗺️ GUIDE DE MAPPING N8N - MyConfort Factures (FORMAT STANDARD)

## 📨 **DONNÉES REÇUES PAR LE WEBHOOK - FORMAT STANDARD N8N**

L'application envoie maintenant les données au **format standard N8N** avec des noms de champs en anglais :

### **🔸 Informations Facture**
```json
{
  "invoice_number": "2025-2115",
  "invoice_date": "2025-07-26",
  "date": "2025-07-26",
  "event_location": "paris",
  "created_at": "2025-07-27T13:37:02.165Z",
  "source": "MyConfort",
  "version": "1.0"
}
```

### **🔸 Informations Client**
```json
{
  "client_name": "Myconfort Priem bruno",
  "client_email": "htconfort@gmail.com",
  "client_phone": "0661486023",
  "client_address": "88 avenue des ternes",
  "client_city": "paris",
  "client_postal_code": "75017",
  "client_housing_type": "Appartement",
  "client_door_code": "1598",
  "client_siret": ""
}
```

### **🔸 Informations Commercial**
```json
{
  "advisor_name": "bruno"
}
```

### **🔸 Montants (Format Standard)**
```json
{
  "amount": 2394,              // ⭐ Montant principal (standard N8N)
  "amount_ht": 1995,          // Montant HT
  "amount_ttc": 2394,         // Montant TTC (clarté)
  "amount_tva": 399,          // TVA
  "tax_rate": 20
}
```

### **🔸 Produits (Format Standard)**
```json
{
  "items": [
    {
      "id": 1,
      "description": "MATELAS BAMBOU 140 x 200",
      "category": "Matelas",
      "quantity": 1,
      "unit_price": 1880,        // Prix unitaire TTC
      "unit_price_ht": 1566.67,  // Prix unitaire HT
      "discount": 20,
      "discount_type": "percentage",
      "total_price": 1504
    }
  ],
  "items_count": 4
}
```

### **🔸 Paiement & Livraison**
```json
{
  "payment_method": "Chèque",
  "deposit_amount": 0,
  "remaining_amount": 2394,
  "delivery_method": "Livraison par transporteur",
  "delivery_notes": "",
  "invoice_notes": ""
}
```

### **🔸 PDF & Signature**
```json
{
  "pdf_base64": "JVBERi0xLjQKJcOkw7zDtsO4...",
  "signature": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "terms_accepted": true
}
```

---

## 🔧 **EXPRESSIONS N8N CORRECTES (FORMAT STANDARD)**

### **✅ Pour l'Email**
```javascript
{{$json.client_email}}        // ⭐ NOUVEAU FORMAT STANDARD
```

### **✅ Pour les autres champs courants**
```javascript
// Informations client (format standard)
{{$json.client_name}}         // Nom du client
{{$json.client_email}}        // Email du client  
{{$json.client_phone}}        // Téléphone
{{$json.client_address}}      // Adresse
{{$json.client_city}}         // Ville
{{$json.client_postal_code}}  // Code postal

// Facture (format standard)
{{$json.invoice_number}}      // Numéro de facture
{{$json.invoice_date}}        // Date facture
{{$json.date}}               // Date (alias standard)
{{$json.amount}}             // ⭐ Montant principal (standard)
{{$json.amount_ht}}          // Total HT
{{$json.amount_ttc}}         // Total TTC

// Commercial
{{$json.advisor_name}}        // Nom du conseiller

// Produits (format standard)
{{$json.items}}              // Tableau des produits
{{$json.items_count}}        // Nombre de produits

// PDF
{{$json.pdf_base64}}         // PDF en base64
```

---

## 🚨 **MIGRATION : ANCIEN → NOUVEAU FORMAT**

### **📧 Email Client**
```javascript
// ❌ ANCIEN FORMAT
{{$json.clientEmail}}

// ✅ NOUVEAU FORMAT STANDARD
{{$json.client_email}}
```

### **💰 Montants**
```javascript
// ❌ ANCIEN FORMAT
{{$json.totalTTC}}

// ✅ NOUVEAU FORMAT STANDARD
{{$json.amount}}              // Montant principal
{{$json.amount_ttc}}          // Si vous voulez être explicite
```

### **👤 Client**
```javascript
// ❌ ANCIEN FORMAT
{{$json.clientName}}

// ✅ NOUVEAU FORMAT STANDARD
{{$json.client_name}}
```

---

## 🧪 **NOUVEAU CODE DE TEST POUR N8N**

```javascript
console.log("=== VÉRIFICATION FORMAT STANDARD N8N ===");
console.log("Email:", $json.client_email);           // Format standard
console.log("Nom:", $json.client_name);             // Format standard
console.log("Montant:", $json.amount);              // Montant principal
console.log("Produits:", $json.items_count);        // Nombre d'items
console.log("PDF présent:", $json.pdf_base64 ? "OUI" : "NON");

// Verification format standard
const standardFields = [
  'invoice_number', 'client_email', 'client_name', 
  'amount', 'items', 'date'
];

console.log("Champs standard présents:");
standardFields.forEach(field => {
  console.log(`- ${field}:`, $json[field] ? "✅" : "❌");
});

return $input.all();
```

---

## ✅ **AVANTAGES DU NOUVEAU FORMAT**

- ✅ **Compatible** avec les standards N8N
- ✅ **Noms en anglais** (convention internationale)
- ✅ **Champ `amount`** principal pour les montants
- ✅ **Format `items`** standard pour les produits
- ✅ **Métadonnées** ajoutées (`created_at`, `source`, etc.)
- ✅ **Validation** renforcée

**Votre workflow N8N utilisera maintenant le format standard attendu !**
