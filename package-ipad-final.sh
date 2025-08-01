#!/bin/bash

# 📱 PACKAGE FINAL IPAD - MYCONFORT
# =================================
# Création du package final pour déploiement iPad

echo "📱 PACKAGE FINAL IPAD - MYCONFORT"
echo "=================================="

# Variables
DESKTOP_PATH="$HOME/Desktop"
PACKAGE_NAME="MyConfort-iPad-Final-$(date +%Y%m%d-%H%M%S)"
PACKAGE_DIR="$DESKTOP_PATH/$PACKAGE_NAME"

# 1. Vérification du build
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Build non trouvé. Exécutez 'npm run build' d'abord."
    exit 1
fi

echo "✅ Build trouvé"

# 2. Création du package
echo ""
echo "📦 Création du package de déploiement..."
mkdir -p "$PACKAGE_DIR"

# Copier le build
cp -r dist/* "$PACKAGE_DIR/"

# Copier netlify.toml (critique pour N8N)
cp netlify.toml "$PACKAGE_DIR/"

# 3. Créer README avec avertissement N8N
cat > "$PACKAGE_DIR/README_DEPLOIEMENT_URGENT.md" << EOF
# 🚨 DÉPLOIEMENT IPAD MYCONFORT - ATTENTION N8N

## ⚠️ PROBLÈME CRITIQUE DÉTECTÉ

### 🔴 Webhook N8N non accessible :
L'URL de webhook N8N actuelle ne répond pas :
\`https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a\`

**Erreur:** 404 - Webhook not registered

### 🛠️ ACTIONS REQUISES AVANT DÉPLOIEMENT :

#### 1. Vérifier le workflow N8N :
- Connectez-vous à votre instance N8N
- Vérifiez que le workflow est **ACTIF** (toggle en haut à droite)
- Vérifiez l'URL du webhook dans le node "Webhook"

#### 2. Corriger l'URL si nécessaire :
Si l'URL a changé, modifiez dans \`src/services/configService.ts\` :
\`\`\`typescript
webhookUrl: 'NOUVELLE_URL_WEBHOOK_N8N'
\`\`\`

#### 3. Rebuild si URL changée :
\`\`\`bash
npm run build
\`\`\`

### 📱 DÉPLOIEMENT NETLIFY :

1. **Glisser-déposer** ce dossier sur https://app.netlify.com
2. **Attendre** le déploiement
3. **Tester** la connexion N8N dans la console iPad

### 🧪 TEST SUR IPAD :

1. Ouvrir l'app dans Safari sur iPad
2. Ouvrir la console développeur (Réglages → Safari → Avancé → Inspecteur Web)
3. Créer une facture test
4. Envoyer par email
5. Vérifier les logs :
   - ✅ \`Using proxy URL: /api/n8n/webhook/facture-universelle\`
   - ❌ Si erreur 404 : Webhook N8N inactif

### 🔧 Configuration proxy (déjà incluse) :
- ✅ Proxy Netlify : \`/api/n8n/*\` → \`https://n8n.srv765811.hstgr.cloud/\`
- ✅ Headers CORS configurés
- ✅ Auto-détection environnement

### ✨ Nouvelles fonctionnalités incluses :
- ✅ Colonne statut livraison (Emporté/À livrer)
- ✅ Couleurs visuelles distinctives
- ✅ Affichage dynamique dans précisions de livraison
- ✅ Validation non-bloquante
- ✅ Interface tactile optimisée iPad
- ✅ Tous les champs de statut envoyés à N8N

### 📞 Support :
Si problème persiste :
1. Vérifier l'état du serveur N8N
2. Contacter l'administrateur N8N
3. Vérifier les logs Netlify après déploiement

**Build généré le :** $(date)
**Status N8N :** ⚠️ Webhook inactif détecté
EOF

# 4. Créer script de test N8N
cat > "$PACKAGE_DIR/test-n8n-depuis-app.js" << 'EOF'
// 🧪 TEST N8N DEPUIS L'APPLICATION DÉPLOYÉE
// Copier-coller dans la console Safari sur iPad

console.log('🧪 TEST N8N DEPUIS IPAD');

// Test 1: Configuration détectée
const debugInfo = {
  url: window.location.href,
  environment: 'production',
  expectedProxy: '/api/n8n/webhook/facture-universelle'
};
console.log('📱 Configuration iPad:', debugInfo);

// Test 2: Test proxy N8N
fetch('/api/n8n/healthz')
  .then(response => {
    console.log('✅ Proxy N8N accessible:', response.status);
    return response.text();
  })
  .then(data => console.log('📄 Réponse:', data))
  .catch(error => console.error('❌ Erreur proxy N8N:', error));

// Test 3: Test webhook
fetch('/api/n8n/webhook/facture-universelle', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({test: 'ipad', source: 'app_test'})
})
  .then(response => {
    console.log('📤 Test webhook:', response.status);
    return response.text();
  })
  .then(data => console.log('📥 Réponse webhook:', data))
  .catch(error => console.error('❌ Erreur webhook:', error));

console.log('ℹ️ Si erreurs 404 : Vérifiez que le workflow N8N est ACTIF');
EOF

# 5. Créer l'archive
cd "$DESKTOP_PATH"
zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME/" -q

# 6. Résumé final
echo ""
echo "✅ PACKAGE IPAD CRÉÉ !"
echo ""
echo "📂 Dossier: $PACKAGE_DIR"
echo "🗜️  Archive: $DESKTOP_PATH/$PACKAGE_NAME.zip"
echo ""
echo "🚨 ATTENTION: Webhook N8N inactif détecté !"
echo "⚠️  Vérifiez N8N avant déploiement"
echo ""
echo "📋 Fichiers inclus:"
echo "   - Build de production optimisé iPad"
echo "   - netlify.toml avec proxy N8N"
echo "   - README avec instructions urgentes"
echo "   - Script de test N8N pour iPad"
echo ""
echo "🚀 INSTRUCTIONS:"
echo "1. ⚠️  CORRIGER le workflow N8N d'abord"
echo "2. Glisser-déposer sur Netlify"
echo "3. Tester sur iPad"
echo ""
echo "📱 TOUTES LES FONCTIONNALITÉS IPAD INCLUSES !"

# Afficher le contenu
echo ""
echo "📄 CONTENU DU PACKAGE:"
ls -la "$PACKAGE_DIR" | head -10
