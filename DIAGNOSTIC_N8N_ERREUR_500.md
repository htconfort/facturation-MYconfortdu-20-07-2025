# 🔧 GUIDE DE DIAGNOSTIC N8N - ERREUR 500

## 🎯 SITUATION ACTUELLE

**✅ Côté Application MyConfort :**
- Application lancée : http://localhost:5179/
- Services d'envoi configurés
- URL webhook correcte : https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
- Format multipart/form-data validé

**❌ Côté N8N :**
- Erreur 500 : "Workflow could not be started!"
- Credentials Google configurés
- Problème persiste malgré la configuration

---

## 🔍 CHECKLIST DE DIAGNOSTIC N8N

### 1. VÉRIFICATION WORKFLOW ACTIF
- [ ] Le workflow est-il **activé** ? (Toggle vert en haut à droite)
- [ ] Le workflow apparaît-il dans la liste des workflows actifs ?
- [ ] Le webhook trigger est-il correctement configuré ?

### 2. VÉRIFICATION NODES CREDENTIALS
- [ ] **Node Google Drive** : Credentials associés ?
- [ ] **Node Google Sheets** : Credentials associés ?
- [ ] **Node Gmail** : Credentials associés ?
- [ ] Tester chaque credential individuellement

### 3. VÉRIFICATION CONFIGURATION WEBHOOK
- [ ] Le webhook trigger accepte-t-il `multipart/form-data` ?
- [ ] Les champs attendus sont-ils configurés ?
- [ ] Le workflow a-t-il des conditions qui bloquent l'exécution ?

### 4. VÉRIFICATION PERMISSIONS GOOGLE
- [ ] Les API Google sont-elles activées ?
  - Google Drive API ✅
  - Google Sheets API ✅  
  - Gmail API ✅
- [ ] Les scopes (permissions) sont-ils corrects ?
- [ ] Le compte Google a-t-il accès aux dossiers/sheets cibles ?

---

## 🧪 TESTS À EFFECTUER

### TEST 1: Activation du workflow
1. Aller dans N8N
2. Trouver le workflow "Workflow Facture Universel"
3. Cliquer sur le **toggle en haut à droite**
4. Vérifier qu'il passe au vert ✅

### TEST 2: Test manuel des nodes
1. Ouvrir le workflow en édition
2. Tester chaque node individuellement
3. Vérifier les outputs de chaque étape
4. Identifier le node qui pose problème

### TEST 3: Logs d'exécution
1. Aller dans **Executions** (menu de gauche)
2. Regarder les dernières tentatives d'exécution
3. Identifier l'erreur précise
4. Consulter les détails de chaque node

### TEST 4: Test avec payload minimal
Testez avec ce payload minimal :
```json
{
  "numero_facture": "TEST-001",
  "client_email": "test@exemple.com"
}
```

---

## 🚨 ERREURS FRÉQUENTES ET SOLUTIONS

### Erreur : "Workflow could not be started!"
**Causes possibles :**
- Workflow inactif → Activer le toggle
- Node en erreur → Vérifier la configuration
- Credentials expirés → Ré-authentifier Google

### Erreur : "Missing credentials"
**Solution :**
- Associer les credentials à chaque node Google
- Tester la connexion de chaque credential
- Vérifier les permissions Google

### Erreur : "Webhook not found"
**Solution :**
- Vérifier l'URL du webhook
- S'assurer que le workflow est publié et actif
- Tester avec le bon nom de webhook

### Erreur : "Invalid multipart data"
**Solution :**
- Configurer le webhook pour accepter multipart/form-data
- Vérifier le parser de données
- Tester avec Content-Type correct

---

## 📊 INFORMATIONS TECHNIQUES POUR SUPPORT

**Webhook testé :**
- URL : https://n8n.srv765811.hstgr.cloud/webhook/facture-universelle
- Méthode : POST
- Format : multipart/form-data
- Taille payload : ~2.9KB
- PDF inclus : 507 bytes
- Nombre de champs : 19

**Champs principaux envoyés :**
- numero_facture, date_facture, date_echeance
- client_nom, client_email, client_telephone, client_adresse
- montant_ht, montant_tva, montant_ttc
- data (PDF en Blob)

**Erreur actuelle :**
- Code : 500
- Message : "Workflow Webhook Error: Workflow could not be started!"
- Temps de réponse : ~120-140ms

---

## 🎯 PROCHAINES ÉTAPES

1. **Vérifier l'activation du workflow** (priorité 1)
2. **Consulter les logs N8N** pour identifier l'erreur précise
3. **Tester chaque node** individuellement
4. **Vérifier les permissions Google** si les credentials sont OK
5. **Relancer un test** depuis l'application MyConfort

Une fois le problème N8N résolu, l'intégration sera **100% opérationnelle** ! 🚀

---

## 📞 SI LE PROBLÈME PERSISTE

1. Copier les logs d'erreur complets de N8N
2. Vérifier la console N8N pour des messages détaillés
3. Tester avec un workflow N8N plus simple d'abord
4. Considérer recréer le workflow depuis le blueprint
