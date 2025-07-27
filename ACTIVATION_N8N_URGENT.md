# 🚨 ACTIVATION WORKFLOW N8N - GUIDE URGENT

## 🎯 **PROBLÈME CONFIRMÉ**
- Workflow N8N **INACTIF** (erreur 404 transformée en 500 par le proxy)
- Tous les tests échouent à cause de cela
- Le proxy et l'application fonctionnent parfaitement

## 🔧 **SOLUTION IMMÉDIATE**

### **Étape 1: Accéder à N8N**
1. Ouvrez : https://n8n.srv765811.hstgr.cloud
2. Connectez-vous avec vos identifiants

### **Étape 2: Trouver le workflow**
1. Dans la liste des workflows, cherchez celui qui contient :
   - **Webhook ID** : `e7ca38d2-4b2a-4216-9c26-23663529790a`
   - **Type** : Webhook HTTP
   - **Nom** : probablement "Factures MyConfort" ou similaire

### **Étape 3: Activer le workflow**
1. **Cliquez sur le workflow** pour l'ouvrir
2. **En haut à droite**, trouvez le toggle **"Active"**
3. **Activez-le** (il doit passer au vert)
4. **Vérifiez** que le statut indique "Active"

### **Étape 4: Tester immédiatement**
Une fois activé, testez avec curl :

```bash
curl -X POST "https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -v
```

**Résultat attendu** : Status 200 (ou autre que 404)

### **Étape 5: Tester dans l'application**
1. Retournez sur : http://localhost:5174
2. Cliquez sur **"Debug"**
3. Testez **"Test Connection"** → Devrait maintenant réussir ✅

## ⚠️ **IMPORTANT**
- **Sans activation**, rien ne fonctionnera
- **Le proxy fonctionne parfaitement**
- **L'application est prête**
- **Il ne manque que l'activation N8N**

## 🔍 **Comment savoir si c'est activé ?**
- ✅ **Activé** : Tests retournent 200/201/autres (pas 404)
- ❌ **Inactif** : Tests retournent 404 "webhook not registered"

---

**ACTIVEZ LE WORKFLOW MAINTENANT, puis retestez !**
