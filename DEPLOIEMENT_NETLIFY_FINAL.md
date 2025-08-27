# 🎯 DÉPLOIEMENT NETLIFY - INSTRUCTIONS FINALES

## ✅ ÉTAT ACTUEL
- **Repository :** ✅ Synchronisé avec GitHub
- **Build :** ✅ Testé et validé (4.30s)
- **Configuration :** ✅ netlify.toml optimisé
- **Fonctionnalités :** ✅ Chèques à venir implémentées

---

## 🚀 DÉPLOIEMENT AUTOMATIQUE (Recommandé)

Si votre site Netlify est connecté au repository GitHub :

1. **Automatique :** Le déploiement se lance automatiquement
2. **Vérification :** Aller sur https://app.netlify.com
3. **Logs :** Suivre le déploiement dans l'onglet "Deploys"
4. **Test :** Une fois terminé, tester l'application

---

## 🔧 DÉPLOIEMENT MANUEL (Si nécessaire)

### Option A - CLI Netlify
```bash
# 1. Installer la CLI
npm install -g netlify-cli

# 2. Se connecter
netlify login

# 3. Déployer (test)
netlify deploy --dir=dist

# 4. Déployer (production)
netlify deploy --prod --dir=dist
```

### Option B - Script automatisé
```bash
# Exécuter le script préparé
./deploy-netlify-cheques.sh
```

---

## 🧪 TESTS POST-DÉPLOIEMENT

### Test Principal : Chèques à Venir
1. Aller sur votre site Netlify
2. Accéder à `/ipad`
3. Créer une facture complète
4. **Étape 4 :** Sélectionner "Chèques à venir"
5. Configurer 9 chèques (devrait calculer ~186€ par chèque)
6. **Étape 7 :** Vérifier l'affichage :
   - Mode : "Chèque à venir"
   - Chèques à venir : "9 chèques de 186.00 €"
   - Montant total : "1674.00 €"
7. **PDF :** Cliquer "Imprimer PDF A4" et vérifier les informations

### Tests de Régression
- ✅ Autres modes de paiement (CB, Espèces, Virement)
- ✅ Factures sans chèques
- ✅ Différents nombres de chèques (2-10)

---

## 🌐 VARIABLES D'ENVIRONNEMENT

**Important :** Si le déploiement automatique échoue, vérifiez ces variables dans Netlify :

```
NODE_VERSION=20.11.1
NPM_VERSION=10.9.3
NODE_OPTIONS=--max-old-space-size=4096
CI=false
GENERATE_SOURCEMAP=false
```

---

## 📞 SUPPORT

### En cas de problème :

1. **Logs Netlify :** Vérifier l'onglet "Deploys" pour les erreurs
2. **Build local :** `npm run build:mem` doit fonctionner
3. **Node version :** Utiliser Node.js 20.11.1
4. **Mémoire :** Augmenter la limite si nécessaire

### Fichiers de référence :
- `GUIDE_CHEQUES_A_VENIR_IMPLEMENTATION.md` : Guide technique complet
- `deploy-netlify-cheques.sh` : Script de déploiement automatisé
- `netlify.toml` : Configuration Netlify optimisée

---

## 🎉 SUCCÈS !

Une fois déployé avec succès, votre application aura :
- ✅ Affichage complet des chèques à venir dans le récapitulatif
- ✅ PDF enrichi avec détails de paiement échelonné
- ✅ Interface utilisateur cohérente
- ✅ Performance optimisée

**Félicitations ! Votre application est prête pour la production ! 🚀**
