# 🔧 GUIDE TEST NUMÉROTATION ROBUSTE

## ✅ CORRECTIONS APPORTÉES

1. **Système de session unique** : Chaque instance de création de facture a un ID de session unique
2. **Protection temporelle renforcée** : 5 secondes entre les générations directes
3. **Cache intelligent** : Réutilisation du même numéro pour la même session
4. **Nettoyage automatique** : Le cache se remet à zéro lors des resets

## 🧪 TESTS À EFFECTUER

### Test 1: Reset complet
```javascript
// Dans la console du navigateur:
localStorage.removeItem('lastInvoiceNumber');
localStorage.removeItem('factureData');
localStorage.setItem('lastInvoiceNumber', '2025-000');
console.log('✅ Reset terminé');
```

### Test 2: Vérification de la stabilité
1. Rechargez la page de facturation
2. Le numéro affiché doit être `2025-001`
3. Rechargez la page 5-10 fois
4. ✅ **Le numéro doit rester `2025-001`** (pas d'incrémentation multiple)

### Test 3: Nouvelle facture
1. Cliquez sur "Nouvelle Facture"
2. Le numéro doit passer à `2025-002`
3. Rechargez la page plusieurs fois
4. ✅ **Le numéro doit rester `2025-002`**

### Test 4: Logs de contrôle
Vérifiez dans la console :
- `🎯 Numéro facture unique généré avec session: session-xxx → 2025-001`
- `🔒 Réutilisation numéro de session [session-xxx]: 2025-001` (lors des rechargements)
- `🆕 Nouvelle facture créée avec session: new-xxx → 2025-002` (nouvelle facture)

## 🐛 SIGNES DE PROBLÈME

❌ **Problèmes à surveiller** :
- Numéro qui change à chaque rechargement
- Sauts de numéros (2025-001 → 2025-003)
- Logs multiples de génération pour la même session

✅ **Comportement attendu** :
- Un seul numéro par session
- Incrémentation uniquement sur "Nouvelle Facture"
- Logs de réutilisation lors des rechargements

## 🔍 COMMANDES DE DEBUG

```javascript
// Voir l'état actuel
console.log('État localStorage:', localStorage.getItem('lastInvoiceNumber'));

// Voir le prochain numéro (sans l'incrémenter)
// (Utiliser depuis la console si les fonctions sont importées)

// Reset complet si problème
localStorage.setItem('lastInvoiceNumber', '2025-000');
location.reload();
```

## 📊 RÉSULTATS ATTENDUS

- **Premier chargement** : `2025-001`
- **Rechargements** : `2025-001` (même numéro)
- **Nouvelle facture** : `2025-002`
- **Rechargements** : `2025-002` (même numéro)
- **Autre nouvelle facture** : `2025-003`

La numérotation doit être **stable** et **séquentielle** sans doublons ni sauts.
