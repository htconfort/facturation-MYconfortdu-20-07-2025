# 🚨 RÉSOLUTION ERREUR 404 N8N

## 🎯 DIAGNOSTIC COMPLET

### ✅ Tests effectués et résultats :

1. **URL N8N directe** : ✅ FONCTIONNE (Status 200)
   ```
   https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
   ```

2. **Proxy Vite configuré** : ✅ CONFIGURÉ
   ```
   /api/n8n/* → https://n8n.srv765811.hstgr.cloud/*
   ```

3. **Code source** : ✅ URL CORRIGÉE
   - Toutes références à l'UUID supprimées
   - URL `facture-universelle` utilisée partout

## 🔍 SOURCES POSSIBLES DE L'ERREUR 404

### 1. **Cache navigateur**
- **Symptôme** : L'application utilise encore l'ancienne URL en cache
- **Solution** :
  ```
  1. Ouvrir http://localhost:5173
  2. Appuyer F12 → Application → Storage
  3. Cliquer "Clear storage" → "Clear site data"
  4. Ou : Ctrl+Shift+R (hard reload)
  ```

### 2. **Variables d'environnement**
- **Symptôme** : `VITE_N8N_WEBHOOK_URL` contient encore l'ancienne URL
- **Solution** :
  ```bash
  # Vérifier le fichier .env
  cat .env
  
  # S'assurer qu'il contient :
  VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"
  ```

### 3. **Build non régénéré**
- **Symptôme** : Le build contient encore l'ancienne URL
- **Solution** :
  ```bash
  rm -rf dist/
  rm -rf node_modules/.vite
  npm run build
  ```

### 4. **Workflow N8N inactif**
- **Symptôme** : Le workflow s'est désactivé
- **Solution** :
  ```
  1. Aller sur https://n8n.srv765811.hstgr.cloud
  2. Trouver le workflow "Workflow Facture Universel"
  3. Vérifier que le toggle "Actif" est activé
  4. S'assurer que le node Webhook utilise "facture-universelle"
  ```

## 🧪 TESTS DE VALIDATION

### Test 1 : URL directe dans navigateur
```
Aller sur : https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
Résultat attendu : "Method Not Allowed" (normal pour GET)
```

### Test 2 : Proxy depuis l'application
```javascript
// Dans la console navigateur (F12) sur http://localhost:5173
fetch('/api/n8n/webhook/facture-universelle', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({test: 'console'})
})
.then(r => console.log('Status:', r.status))
.catch(e => console.log('Error:', e));
```

### Test 3 : Vérifier la configuration
```javascript
// Dans la console navigateur
console.log('Environment:', import.meta.env);
console.log('URL configurée:', import.meta.env.VITE_N8N_WEBHOOK_URL);
```

## 🚀 SOLUTION RAPIDE

### Étapes dans l'ordre :

1. **Vider le cache navigateur** :
   ```
   Ctrl+Shift+R ou F12 → Application → Clear storage
   ```

2. **Vérifier et corriger .env** :
   ```bash
   echo 'VITE_N8N_WEBHOOK_URL="https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle"' > .env
   ```

3. **Rebuild propre** :
   ```bash
   rm -rf dist/ node_modules/.vite
   npm run build
   npm run dev
   ```

4. **Tester dans la console** :
   ```javascript
   fetch('/api/n8n/webhook/facture-universelle', {
     method: 'POST',
     headers: {'Content-Type': 'application/json'},
     body: JSON.stringify({test: 'final'})
   }).then(r => console.log('Status:', r.status));
   ```

## 🎯 SI LE PROBLÈME PERSISTE

### Vérifications avancées :

1. **Logs du proxy Vite** :
   - Regarder la console du serveur `npm run dev`
   - Chercher les logs "🔄 PROXY REQUEST"

2. **Network tab navigateur** :
   - F12 → Network
   - Créer une facture et envoyer
   - Vérifier l'URL utilisée dans la requête

3. **Workflow N8N** :
   - Vérifier que le path est exactement "facture-universelle"
   - Pas d'espaces, pas de caractères spéciaux
   - Workflow bien actif (toggle vert)

---

**🔧 Le webhook N8N fonctionne, c'est un problème de cache ou de configuration côté application.**
