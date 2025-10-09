# 📦 Persistance des Factures - Guide Complet

## 🎯 Objectif

Garantir que les factures **ne soient JAMAIS perdues** lors de :
- Mises à jour de code (commits, déploiements)
- Actualisation du navigateur
- Vidage du cache
- Changement d'appareil

## 📊 État actuel

### Stockage LocalStorage (Temporaire)

Actuellement, les factures sont sauvegardées dans `localStorage` du navigateur :

```typescript
// src/utils/storage.ts
export const saveInvoice = (invoice: Invoice): void => {
  const invoices = loadInvoices();
  invoices.push(invoice);
  localStorage.setItem('myconfortInvoices', JSON.stringify(invoices));
};
```

**⚠️ Problèmes du localStorage** :
- ❌ Effacé si l'utilisateur vide le cache
- ❌ Perdu lors des mises à jour de l'application
- ❌ Non accessible depuis un autre appareil
- ❌ Limité à ~5-10 MB de stockage
- ❌ Non synchronisé

## ✅ Solution : Supabase (Base de données cloud)

### Architecture déjà en place

Supabase est **déjà configuré** dans le projet :

- ✅ `src/utils/supabaseClient.ts` - Configuration
- ✅ `src/utils/supabaseService.ts` - Service avec `invoiceService`
- ✅ Tables créées : `invoices`, `invoice_items`, `clients`, `products`

### Avantages Supabase

- ✅ **Persistance permanente** - jamais perdu
- ✅ **Synchronisation** multi-appareils
- ✅ **Backup automatique** par Supabase
- ✅ **Historique complet** avec horodatage
- ✅ **Recherche avancée** et filtres
- ✅ **RLS (Row Level Security)** pour sécurité
- ✅ **Stockage illimité** (dans les limites du plan)

## 🔧 Implémentation

### Étape 1 : Sauv egarde hybride (localStorage + Supabase)

**Fichier** : `src/utils/storage.ts`

La fonction `saveInvoice` a été modifiée pour être `async` et prépare l'intégration Supabase.

```typescript
export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  // 1. Sauvegarde locale immédiate (garantie)
  const invoices = loadInvoices();
  invoices.push(invoice);
  saveInvoices(invoices);
  
  // 2. Sauvegarde Supabase (persistance permanente)
  // TODO: Mapper Invoice → InvoiceInsert format
};
```

### Étape 2 : Mapping Invoice → Supabase

**À faire** : Créer une fonction de mapping pour convertir le format `Invoice` de l'application vers le format `InvoiceInsert` de Supabase.

```typescript
function mapInvoiceToSupabase(invoice: Invoice): {
  invoiceData: InvoiceInsert;
  items: InvoiceItemInsert[];
} {
  return {
    invoiceData: {
      invoice_number: invoice.invoiceNumber,
      invoice_date: invoice.invoiceDate,
      client_name: invoice.clientName,
      client_email: invoice.clientEmail,
      // ... mapping complet de tous les champs
      total_ht: invoice.totalHT,
      total_ttc: invoice.totalTTC,
      total_tva: invoice.totalTVA,
      status: 'draft',
    },
    items: invoice.products?.map(p => ({
      designation: p.designation,
      quantity: p.qty,
      unit_price_ttc: p.priceTTC,
      discount: p.discount,
      total_ttc: p.total,
    })) || [],
  };
}
```

### Étape 3 : Chargement depuis Supabase

**Fichier** : `src/utils/storage.ts`

```typescript
export const loadInvoices = async (): Promise<Invoice[]> => {
  try {
    // 1. Essayer de charger depuis Supabase
    const supabaseInvoices = await invoiceService.getAll();
    
    if (supabaseInvoices.length > 0) {
      console.log('✅ Factures chargées depuis Supabase:', supabaseInvoices.length);
      return supabaseInvoices.map(mapSupabaseToInvoice);
    }
  } catch (error) {
    console.warn('⚠️ Supabase non disponible, utilisation localStorage', error);
  }
  
  // 2. Fallback : localStorage
  const stored = localStorage.getItem('myconfortInvoices');
  return stored ? JSON.parse(stored) : [];
};
```

### Étape 4 : Suppression hybride

```typescript
export const deleteInvoice = async (invoiceNumber: string): Promise<void> => {
  // 1. Supprimer de localStorage
  const invoices = loadInvoices();
  const filteredInvoices = invoices.filter(
    inv => inv.invoiceNumber !== invoiceNumber
  );
  saveInvoices(filteredInvoices);
  
  // 2. Supprimer de Supabase
  try {
    // TODO: Trouver l'ID Supabase et supprimer
    // await invoiceService.delete(supabaseId);
  } catch (error) {
    console.error('❌ Erreur suppression Supabase:', error);
  }
};
```

## 📋 TODO - Migration complète

### Court terme (immédiat)

- [x] Modifier `saveInvoice` pour être `async`
- [x] Ajouter `await` dans les appels (StepRecap, MainApp)
- [ ] Créer fonction `mapInvoiceToSupabase(invoice: Invoice)`
- [ ] Créer fonction `mapSupabaseToInvoice(supabaseInvoice)`

### Moyen terme

- [ ] Activer sauvegarde Supabase dans `saveInvoice`
- [ ] Modifier `loadInvoices` pour charger depuis Supabase
- [ ] Tester synchronisation localStorage ↔ Supabase
- [ ] Migration des factures existantes localStorage → Supabase

### Long terme

- [ ] Interface admin pour gérer les factures Supabase
- [ ] Export massif des factures (CSV, Excel)
- [ ] Backup automatique quotidien
- [ ] Synchronisation multi-utilisateurs (si besoin)

## 🔒 Garanties actuelles

### Avec localStorage (actuellement)

Les factures sont conservées **SAUF SI** :
- L'utilisateur vide le cache du navigateur
- L'utilisateur utilise le mode navigation privée
- Le navigateur est désinstallé/réinitialisé

### Avec Supabase (après migration)

Les factures sont **TOUJOURS conservées** :
- ✅ Persistance permanente dans le cloud
- ✅ Backup automatique par Supabase
- ✅ Accessible depuis n'importe quel appareil
- ✅ Historique complet avec horodatage
- ✅ Suppression UNIQUEMENT via bouton poubelle

## 🚀 Activation rapide

Pour activer immédiatement la sauvegarde Supabase, il suffit de :

1. Créer les fonctions de mapping
2. Décommenter les lignes TODO dans `storage.ts`
3. Tester avec une facture de test

**Temps estimé** : 30-45 minutes de développement + tests

## 📝 Notes importantes

- Le code est déjà prêt côté Supabase (`invoiceService`)
- Les tables existent déjà dans Supabase
- Il manque juste le mapping de format
- localStorage reste comme backup/cache local

