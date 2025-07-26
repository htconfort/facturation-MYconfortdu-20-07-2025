# 🎯 GUIDE TEST RAPIDE - MYCONFORT → N8N

## 🚀 TEST DEPUIS L'APPLICATION (2 MINUTES)

### 1. Ouvrir l'Application
```
http://localhost:5180/
```

### 2. Créer une Facture de Test
- **Client :** Jean Dupont
- **Email :** jean.dupont@email.com  
- **Téléphone :** 0123456789
- **Adresse :** 123 Avenue des Champs, 75008 Paris

**Ajouter des produits :**
- MATELAS BAMBOU - 799€
- OREILLER FLOCON - 89€

### 3. Cliquer sur le Bouton "📤 Drive"
- Se trouve dans le header à droite
- Doit afficher "🎯 Envoi vers Blueprint N8N..."
- Puis "✅ Facture envoyée avec succès !" ou erreur

### 4. Vérifier dans N8N
- Aller sur : https://n8n.srv765811.hstgr.cloud
- Menu "Executions" à gauche
- Voir la dernière exécution
- Statut doit être "Success" (vert)

### 5. Vérifier Google Drive (Optionnel)
- Rechercher un PDF nommé "Facture_FAC-2025-xxx.pdf"
- Vérifier qu'il s'ouvre correctement

---

## 🔧 EN CAS DE PROBLÈME

### ❌ Erreur "Champs obligatoires manquants"
**Solution :** Remplir tous les champs client + au moins 1 produit

### ❌ Erreur "404 Not Found"  
**Solution :** Activer le workflow N8N (toggle en haut à droite)

### ❌ Erreur "500 Server Error"
**Solution :** Vérifier les credentials Google dans N8N

### ❌ Pas de PDF dans Google Drive
**Solution :** Vérifier le mapping du champ `binary.data` dans le node Google Drive

---

## 🧪 TEST TECHNIQUE ALTERNATIF

Si vous voulez tester sans l'interface :

```bash
cd /Users/brunopriem/github.com:htconfort:Myconfort/facturation-MYconfortdu-20-07-2025-1
node test-integration-complete.cjs
```

Doit afficher : `🎉 INTÉGRATION MYCONFORT → N8N RÉUSSIE !`

---

## ✅ VALIDATION RÉUSSIE SI :
1. Bouton "📤 Drive" fonctionne sans erreur
2. Message de succès s'affiche  
3. Exécution N8N en statut "Success"
4. PDF visible dans Google Drive

**Temps estimé :** 2-3 minutes 🚀
