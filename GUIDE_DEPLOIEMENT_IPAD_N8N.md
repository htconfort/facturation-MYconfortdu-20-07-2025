# 📱 GUIDE DÉPLOIEMENT IPAD - MYCONFORT AVEC N8N

## 🎯 **Configuration N8N pour iPad - Production**

### **✅ Configuration actuelle validée :**

#### **1. Proxy Netlify configuré (`netlify.toml`) :**
```toml
[[redirects]]
  from = "/api/n8n/*"
  to = "https://n8n.srv765811.hstgr.cloud/:splat"
  status = 200
  force = true
```

#### **2. Headers CORS pour N8N :**
```toml
[[headers]]
  for = "/api/n8n/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, X-Requested-With"
```

#### **3. WebhookUrlHelper intelligent :**
- **Production (iPad)** : Utilise `/api/n8n/webhook/facture-universelle`
- **Local** : Utilise le proxy Vite vers N8N
- **Auto-détection** de l'environnement

## 🚀 **Étapes de déploiement pour iPad**

### **1. Préparation du build :**
```bash
# Build de production avec toutes les optimisations iPad
npm run build

# Vérification du build
ls -la dist/
```

### **2. Variables d'environnement Netlify :**
Dans votre interface Netlify, définissez :
```
VITE_N8N_WEBHOOK_URL=https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a
```

### **3. Déploiement :**
- **Drag & Drop** du dossier `dist/` sur Netlify
- Ou **déploiement automatique** via Git

## 🔍 **Tests de connexion N8N obligatoires**

### **Test 1 : Vérifier que N8N répond**
```bash
curl -I https://n8n.srv765811.hstgr.cloud/healthz
# Doit retourner 200 OK
```

### **Test 2 : Tester le webhook N8N**
```bash
curl -X POST https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a \
  -H "Content-Type: application/json" \
  -d '{"test": "ping", "source": "deployment_test"}'
```

### **Test 3 : Tester le proxy Netlify**
Une fois déployé sur `https://votre-app.netlify.app` :
```bash
curl -X POST https://votre-app.netlify.app/api/n8n/webhook/facture-universelle \
  -H "Content-Type: application/json" \
  -d '{"test": "proxy", "source": "ipad_test"}'
```

## 📱 **Configuration spécifique iPad**

### **Optimisations déjà intégrées :**
- ✅ **Sélection automatique** des champs numériques (`onFocus`/`onTouchStart`)
- ✅ **Boutons de retour** dans toutes les modales
- ✅ **Couleurs contrastées** pour une meilleure visibilité
- ✅ **Interface responsive** adaptée aux écrans tactiles
- ✅ **Validation sans blocage** pour la colonne livraison

### **Nouvelles fonctionnalités pour l'iPad :**
- ✅ **Colonne "Emporté"** avec statuts visuels
- ✅ **Affichage dynamique** des produits par statut de livraison
- ✅ **Envoi N8N** avec tous les champs de statut de livraison

## 🛠️ **Diagnostic sur iPad**

### **1. Ouvrir les outils développeur Safari :**
1. iPad : Réglages → Safari → Avancé → Inspecteur Web
2. Mac : Safari → Développement → [Nom iPad] → [Votre app]

### **2. Vérifier les logs N8N :**
```javascript
// Dans la console Safari sur iPad, après un envoi :
// Chercher ces logs :
"🔗 N8nWebhookService - Using webhook URL: /api/n8n/webhook/facture-universelle"
"✅ Using proxy URL: /api/n8n/webhook/facture-universelle"
```

### **3. Test complet sur iPad :**
1. Créer une nouvelle facture
2. Ajouter un produit "À livrer" (rouge)
3. Ajouter un produit "Emporté" (vert)
4. Vérifier l'affichage dans "Précisions de livraison"
5. Envoyer par email/drive
6. Vérifier les logs dans la console

## 🎯 **Payload N8N avec statuts de livraison**

L'iPad enverra maintenant ces données enrichies :
```json
{
  "numero_facture": "FAC-001",
  "produits": [
    {
      "nom": "MATELAS BAMBOU 80x200",
      "statut_livraison": "a_livrer"
    },
    {
      "nom": "OREILLER MÉMOIRE",
      "statut_livraison": "emporte"
    }
  ],
  "produits_statuts_livraison": ["a_livrer", "emporte"],
  "nombre_produits_a_livrer": 1,
  "nombre_produits_emportes": 1,
  "noms_produits_a_livrer": "MATELAS BAMBOU 80x200",
  "noms_produits_emportes": "OREILLER MÉMOIRE",
  "a_une_livraison": "Oui",
  "a_des_produits_emportes": "Oui"
}
```

## 🚨 **Résolution de problèmes**

### **Erreur 404 sur /api/n8n/* :**
- Vérifier que `netlify.toml` est à la racine
- Vérifier la configuration du proxy
- Redeployer l'application

### **Erreur CORS :**
- Vérifier les headers CORS dans `netlify.toml`
- Vérifier que N8N accepte les requêtes externes

### **Erreur 500 N8N :**
- Vérifier que le workflow N8N est actif
- Vérifier l'URL du webhook
- Tester avec un payload minimal

## ✅ **Checklist de déploiement iPad**

- [ ] Build de production généré (`npm run build`)
- [ ] N8N répond au ping (`curl test`)
- [ ] Webhook N8N actif (`curl POST test`)
- [ ] Variables d'environnement Netlify définies
- [ ] Application déployée sur Netlify
- [ ] Proxy Netlify testé
- [ ] Test complet sur iPad réel
- [ ] Logs Safari vérifiés
- [ ] Envoi d'email test réussi
- [ ] Statuts de livraison transmis à N8N

## 🎉 **Application prête pour iPad !**

L'application MyConfort est maintenant optimisée pour iPad avec :
- Interface tactile complète
- Gestion des statuts de livraison
- Connexion N8N sécurisée via proxy
- Toutes les fonctionnalités opérationnelles

**URL de production :** https://votre-app.netlify.app
**Support iPad :** Optimisé pour Safari Mobile
