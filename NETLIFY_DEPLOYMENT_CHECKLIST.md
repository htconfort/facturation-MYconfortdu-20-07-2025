# Checklist de Déploiement Netlify - MyConfort

## ✅ Pré-déploiement

### 1. Configuration Locale
- [ ] Variables d'environnement configurées (.env.local)
- [ ] Build local réussi (`npm run build`)
- [ ] Tests TypeScript passants (`npm run type-check`)
- [ ] Application fonctionnelle en local (`npm run preview`)

### 2. Repository Git
- [ ] Toutes les modifications commitées
- [ ] Branch main à jour
- [ ] Tags de version créés (optionnel)
- [ ] README.md mis à jour

### 3. Configuration Netlify
- [ ] Compte Netlify créé/configuré
- [ ] Site connecté au repository GitHub
- [ ] Build settings configurés :
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: `18.x`

## 🔧 Variables d'Environnement Netlify

### Variables Obligatoires
- [ ] `VITE_N8N_WEBHOOK_URL` : https://n8n.srv765811.hstgr.cloud/webhook/...
- [ ] `VITE_EMAILJS_SERVICE_ID` : service_xxxxxxx
- [ ] `VITE_EMAILJS_TEMPLATE_ID` : template_xxxxxxx
- [ ] `VITE_EMAILJS_PUBLIC_KEY` : user_xxxxxxx
- [ ] `VITE_SUPABASE_URL` : https://xxx.supabase.co
- [ ] `VITE_SUPABASE_ANON_KEY` : eyJhbGciOi...

### Variables Optionnelles
- [ ] `VITE_DEBUG_MODE` : false
- [ ] `VITE_COMPANY_NAME` : HT CONFORT
- [ ] `VITE_COMPANY_EMAIL` : contact@htconfort.com
- [ ] `VITE_COMPANY_PHONE` : +33 X XX XX XX XX
- [ ] `VITE_GOOGLE_DRIVE_API_KEY` : (si Google Drive utilisé)

## 🚀 Déploiement

### 1. Déploiement Automatique (Git)
- [ ] Push vers main déclenche le build automatique
- [ ] Build Netlify réussi (vérifier les logs)
- [ ] Deploy preview généré
- [ ] Tests automatiques passants

### 2. Déploiement Manuel (CLI)
- [ ] Netlify CLI installé (`npm install -g netlify-cli`)
- [ ] Authentification (`netlify login`)
- [ ] Preview deploy (`netlify deploy`)
- [ ] Production deploy (`netlify deploy --prod`)

## 🧪 Tests Post-Déploiement

### 1. Tests Techniques
- [ ] Site accessible (status 200)
- [ ] Assets chargés correctement
- [ ] Headers de sécurité présents
- [ ] Redirections SPA fonctionnelles
- [ ] HTTPS actif
- [ ] Performance acceptable (<3s)

### 2. Tests Fonctionnels
- [ ] **Création de facture** : Interface responsive, calculs corrects
- [ ] **Gestion des produits** : Ajout/suppression, remises, livraison/emporter
- [ ] **Génération PDF** : Format correct, données complètes
- [ ] **Envoi email** : EmailJS fonctionnel, PDF attaché
- [ ] **Impression HTML** : Mise en page correcte, styles d'impression
- [ ] **Paiement** : Simulation Alma, chèques ronds
- [ ] **Sauvegarde** : Données persistées, export/import

### 3. Tests Mobiles
- [ ] Interface iPad optimisée
- [ ] Navigation tactile fluide
- [ ] Signature électronique fonctionnelle
- [ ] Impression depuis mobile

## 🔍 Vérifications de Sécurité

### 1. Configuration
- [ ] Variables sensibles non exposées dans le build
- [ ] Headers de sécurité configurés
- [ ] CORS configuré pour N8N
- [ ] HTTPS forcé

### 2. Données
- [ ] Validation côté client
- [ ] Sanitisation des entrées
- [ ] Chiffrement des communications
- [ ] Logs sans données sensibles

## 📊 Monitoring

### 1. Netlify Analytics
- [ ] Analytics activées
- [ ] Métriques de performance surveillées
- [ ] Alertes configurées pour les erreurs

### 2. Surveillance Continue
- [ ] Logs de build surveillés
- [ ] Temps de réponse monitorés
- [ ] Erreurs 404/500 trackées
- [ ] Uptime monitoring configuré

## 🔄 Maintenance

### 1. Mises à Jour
- [ ] Calendrier de maintenance défini
- [ ] Process de rollback documenté
- [ ] Backup de configuration effectué
- [ ] Documentation à jour

### 2. Support
- [ ] Contacts d'urgence définis
- [ ] Procédures de debugging documentées
- [ ] Accès aux services externes vérifiés
- [ ] Formation équipe effectuée

## 📋 Validation Finale

### Responsable Technique
- [ ] Build de production validé
- [ ] Tests automatisés passants
- [ ] Performance validée
- [ ] Sécurité vérifiée

**Signature :** _________________ **Date :** _________

### Responsable Métier
- [ ] Fonctionnalités testées
- [ ] Interface validée
- [ ] Workflow N8N testé
- [ ] Formation utilisateurs effectuée

**Signature :** _________________ **Date :** _________

### Responsable Déploiement
- [ ] Configuration Netlify validée
- [ ] Monitoring activé
- [ ] Documentation complète
- [ ] Go-live autorisé

**Signature :** _________________ **Date :** _________

---

## 🚨 En Cas de Problème

### Rollback Rapide
```bash
# Revenir à la version précédente
netlify deploy --prod --alias previous

# Ou via Git
git revert HEAD
git push origin main
```

### Contacts d'Urgence
- **Technique :** [email technique]
- **Métier :** [email métier]
- **Netlify Support :** support@netlify.com

### Logs et Debug
```bash
# Logs Netlify
netlify logs

# Logs de build
netlify logs --function build

# Status du site
netlify status
```

---

**Version :** 1.0  
**Créé le :** 2025-01-30  
**Prochaine révision :** [date]
