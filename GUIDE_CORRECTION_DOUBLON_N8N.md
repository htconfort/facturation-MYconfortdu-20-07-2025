# 🚨 GUIDE CORRECTION WORKFLOW N8N - PROBLÈME DOUBLON FACTURES

## 📋 PROBLÈME IDENTIFIÉ

**Symptôme** : 
- ✅ Facture 2025-002 créée et envoyée correctement depuis l'application
- ❌ Email reçu contient une ancienne facture (facture de test) avec le même numéro

**Diagnostic** : Le workflow N8N ne traite pas les données de la requête actuelle mais récupère/utilise d'anciennes données stockées quelque part.

## 🔍 ÉTAPES DE DIAGNOSTIC N8N

### 1. Connexion à N8N
- URL : `https://n8n.srv765811.hstgr.cloud/`
- Menu → "Executions"
- Identifier la dernière exécution

### 2. Vérification du flux de données
Vérifiez que chaque node utilise bien les données **du webhook actuel** :

```
Webhook → Node 1 → Node 2 → Email
   ↓         ↓        ↓        ↓
 Input    Process   Store   Send
```

### 3. Nodes suspects à vérifier

#### A. Node de stockage (Google Drive/Database)
- ❌ **Problème probable** : Le node lit toujours le même fichier
- ✅ **Solution** : S'assurer qu'il crée/lit le bon fichier basé sur les données webhook

#### B. Node Email
- ❌ **Problème probable** : L'email utilise une source de données fixe
- ✅ **Solution** : L'email doit utiliser les données du flux actuel

#### C. Node de transformation/mapping
- ❌ **Problème probable** : Variables cachées/persistantes
- ✅ **Solution** : Nettoyer les variables et utiliser les données d'entrée

## 🛠️ CORRECTIONS POSSIBLES

### Solution 1: Vérifier la source des données de l'email
```javascript
// Dans le node Email, s'assurer d'utiliser :
{{ $json.nom_du_client }}     // ✅ Données du flux
{{ $json.numero_facture }}    // ✅ Données du flux

// PAS :
{{ $node["Node X"].json.data }}  // ❌ Données d'un autre node
```

### Solution 2: Nettoyer le cache/variables persistantes
- Redémarrer le workflow
- Vider les variables globales
- Recréer les connections entre nodes

### Solution 3: Forcer l'utilisation des données webhook
```javascript
// Dans chaque node, utiliser explicitement :
{{ $input.all()[0].json.numero_facture }}
{{ $input.all()[0].json.nom_du_client }}
{{ $input.all()[0].json.fichier_facture }}
```

## 🧪 TEST DE VALIDATION

Après correction, utiliser le script de test :
```bash
node diagnostic-doublon-factures-n8n.js
```

**Résultat attendu** :
- Email reçu avec numéro : `TEST-[timestamp]`
- Nom client : `Client_Test_[timestamp]`
- ✅ Correspondance exacte avec les données envoyées

## ⚡ PROBLÈMES FRÉQUENTS N8N

1. **Cache de variables** : N8N garde en mémoire des valeurs précédentes
2. **Mauvaise référence de node** : Email utilise les données d'un autre node
3. **Variables globales** : Utilisation de variables qui ne se mettent pas à jour
4. **Buffer de stockage** : Google Drive/DB lit toujours le même fichier

## 🎯 ACTIONS IMMÉDIATES

1. **Connectez-vous à N8N**
2. **Menu "Executions"** → Voir la dernière exécution
3. **Cliquez sur chaque node** → Vérifiez les données d'entrée/sortie
4. **Identifiez où les données "se perdent"**
5. **Corrigez la référence des données dans le node problématique**

Une fois corrigé, notre application fonctionnera parfaitement avec la numérotation séquentielle ! 🚀
