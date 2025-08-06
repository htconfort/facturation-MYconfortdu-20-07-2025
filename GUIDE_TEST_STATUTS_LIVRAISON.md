# 🧪 Guide de Test Manuel - Statuts de Livraison MYcomfort

## ✅ TESTS À EFFECTUER

### 1. **Interface de Base**
- [ ] Ouvrir l'application sur http://localhost:5174
- [ ] Vérifier que l'interface MYcomfort s'affiche correctement (fond vert, logo 🌸)
- [ ] Naviguer vers la section "PRODUITS & TARIFICATION"

### 2. **Ajout de Produits**
- [ ] Ajouter un produit via le formulaire
- [ ] **Vérifier** : Le produit apparaît avec le statut "⏳ En attente" par défaut
- [ ] **Vérifier** : La colonne s'appelle maintenant "STATUT DE LIVRAISON" (plus "EMPORTÉ")

### 3. **Changement de Statuts**
- [ ] Cliquer sur le sélecteur de statut d'un produit
- [ ] **Tester chaque statut** :
  - ⏳ **En attente** (orange) - statut initial
  - 📦 **À livrer** (bleu) - produit à livrer
  - ✅ **Emporté** (vert) - produit récupéré
  - ❌ **Annulé** (rouge) - produit annulé

### 4. **Résumé des Statuts**
- [ ] **Vérifier** : Le résumé apparaît au-dessus du tableau quand il y a des produits
- [ ] **Observer** : La barre de progression se met à jour en temps réel
- [ ] **Compter** : Les badges affichent le bon nombre par statut
- [ ] **Tester** : Message "⚠️ X produit(s) en attente" si il y en a
- [ ] **Tester** : Message "✅ Tous les produits ont été traités !" si tout est fini

### 5. **Console de Debug N8N**
- [ ] Ouvrir les outils de développement (F12)
- [ ] Changer le statut d'un produit
- [ ] **Vérifier dans la Console** :
  ```
  🔄 Notification de changement de statut: {...}
  ✅ Statut notifié avec succès à N8N: {...}
  ```
  OU
  ```
  ⚠️ Notification N8N échouée, mais le changement local est conservé
  ```

### 6. **Compatibilité avec l'Existant**
- [ ] **Vérifier** : Les calculs de totaux fonctionnent toujours
- [ ] **Vérifier** : Les autres sections (Client, Paiement) ne sont pas affectées
- [ ] **Vérifier** : La génération PDF fonctionne toujours
- [ ] **Vérifier** : L'envoi d'email fonctionne toujours

### 7. **Tests de Régression**
- [ ] Créer une facture complète avec plusieurs produits
- [ ] Modifier les statuts de livraison
- [ ] Sauvegarder la facture
- [ ] Réouvrir la facture
- [ ] **Vérifier** : Les statuts sont conservés

## 🎨 ÉLÉMENTS VISUELS À VÉRIFIER

### **Couleurs des Statuts**
- ⏳ **En attente** : Fond orange clair `#FFF3E0`, texte orange `#FF9800`
- 📦 **À livrer** : Fond bleu clair `#E3F2FD`, texte bleu `#2196F3`
- ✅ **Emporté** : Fond vert clair `#E8F5E8`, texte vert `#4CAF50`
- ❌ **Annulé** : Fond rouge clair `#FFEBEE`, texte rouge `#f44336`

### **Résumé des Statuts**
- 📊 Barre de progression verte à bleue
- 🏷️ Badges colorés avec compteurs
- 📱 Interface responsive sur mobile
- ✨ Animations fluides

## 🐛 PROBLÈMES POSSIBLES

### **Si les statuts ne s'affichent pas**
1. Vérifier que TailwindCSS fonctionne (autres couleurs visibles ?)
2. Ouvrir la console pour voir les erreurs
3. Vérifier que les CSS de delivery-status.css se chargent

### **Si N8N ne reçoit pas les notifications**
1. **Normal** si N8N n'est pas configuré - l'app fonctionne quand même
2. Vérifier l'URL du webhook dans `DeliveryStatusNotificationService.ts`
3. Les échecs sont stockés localement pour retry plus tard

### **Si l'application ne démarre pas**
1. Exécuter : `./restore-mycomfort.sh` pour restaurer la config
2. Vérifier : `npm run dev` fonctionne
3. Consulter : `CONFIG_CRITIQUE_MYCOMFORT.md`

## 📱 TESTS MOBILES

- [ ] Ouvrir sur mobile/tablette
- [ ] **Vérifier** : Les sélecteurs de statuts sont tactiles
- [ ] **Vérifier** : Le résumé s'adapte à l'écran
- [ ] **Vérifier** : Les couleurs restent lisibles

## 🎯 SCÉNARIOS COMPLETS

### **Scénario 1 : Livraison Partielle**
1. Ajouter 3 produits
2. Marquer 1 comme "Emporté"
3. Marquer 1 comme "À livrer"  
4. Laisser 1 en "En attente"
5. **Vérifier** : Le résumé montre la progression

### **Scénario 2 : Commande Complète**
1. Ajouter plusieurs produits
2. Marquer tous comme "Emporté"
3. **Vérifier** : Message de félicitations
4. **Vérifier** : Barre de progression à 100%

### **Scénario 3 : Annulation**
1. Ajouter des produits
2. Marquer certains comme "Annulé"
3. **Vérifier** : Compteur d'annulés
4. **Vérifier** : Progression calcule les annulés comme "terminés"

---

## ✅ VALIDATION FINALE

Quand tous les tests passent :

🎉 **L'intégration des statuts de livraison est OPÉRATIONNELLE !**

**Fonctionnalités validées :**
- ✅ Interface intuitive avec couleurs
- ✅ Résumé visuel temps réel
- ✅ Synchronisation N8N robuste
- ✅ Compatibilité totale maintenue
- ✅ Expérience mobile optimisée

**Prêt pour utilisation en production !**

---
*Guide de test créé le 6 août 2025*
