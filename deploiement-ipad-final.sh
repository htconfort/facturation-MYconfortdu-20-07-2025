#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT IPAD MYCONFORT
# Version finale avec statut de livraison et intégration N8N
# Date: $(date)

echo "🚀 PRÉPARATION DÉPLOIEMENT IPAD MYCONFORT"
echo "==========================================="

# Vérification que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Nettoyage des anciens builds
echo "🧹 Nettoyage des anciens builds..."
rm -rf dist/
rm -f *.zip

# Génération du build de production
echo "🔨 Génération du build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Vérifiez les erreurs ci-dessus."
    exit 1
fi

# Vérification du contenu du build
echo "📋 Contenu du build généré:"
ls -la dist/

# Création du package de déploiement avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M")
ZIP_NAME="MyConfort_iPad_Deploy_${TIMESTAMP}.zip"

echo "📦 Création du package de déploiement: $ZIP_NAME"

# Création d'un dossier temporaire pour le déploiement
TEMP_DIR="deploy_temp"
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# Copie des fichiers essentiels
cp -r dist/* $TEMP_DIR/
cp netlify.toml $TEMP_DIR/ 2>/dev/null || echo "⚠️  netlify.toml non trouvé (optionnel)"
cp _redirects $TEMP_DIR/ 2>/dev/null || echo "⚠️  _redirects non trouvé (optionnel)"

# Création du fichier .htaccess pour compatibilité serveur
cat > $TEMP_DIR/.htaccess << 'EOF'
# Configuration pour MyConfort iPad
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Headers pour PWA
<FilesMatch "\.(js|css|html|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000"
</FilesMatch>

# Headers pour l'API
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
EOF

# Ajout d'un fichier README pour le déploiement
cat > $TEMP_DIR/README_DEPLOYMENT.md << 'EOF'
# 🚀 MYCONFORT - DÉPLOIEMENT IPAD

## ✅ FONCTIONNALITÉS INCLUSES DANS CE BUILD:

### 📱 Optimisations iPad:
- Interface tactile optimisée
- Sélection automatique des champs numériques
- Boutons de retour dans toutes les modales
- Ergonomie améliorée pour tablette

### 🚛📦 Nouveau: Statut de livraison:
- Colonne "EMPORTÉ" dans le tableau des produits
- Distinction visuelle: Rouge (à livrer) / Vert (emporté)
- Affichage automatique dans les précisions de livraison
- Intégration complète avec N8N

### 📧 Intégration N8N:
- Envoi automatique d'emails via webhook
- Données de statut de livraison transmises
- Statistiques complètes pour la logistique

### 🎨 Interface:
- Suppression complète d'EmailJS
- Harmonisation des couleurs des blocs
- Aperçu PDF intégré et optimisé

## 🌐 DÉPLOIEMENT:

### Option 1: Netlify (Recommandé)
1. Glissez-déposez le dossier complet sur Netlify
2. Le fichier `netlify.toml` configure automatiquement les proxies
3. Configurez les variables d'environnement N8N si nécessaire

### Option 2: Serveur traditionnel
1. Uploadez tous les fichiers sur votre serveur web
2. Le fichier `.htaccess` gère la configuration Apache
3. Assurez-vous que le serveur supporte les SPA (Single Page Applications)

### Option 3: GitHub Pages / Vercel
1. Consultez les guides fournis dans le projet
2. Configuration automatique via les fichiers de configuration

## 🔧 CONFIGURATION N8N:

L'application envoie les données vers votre endpoint N8N avec:
- `statut_livraison` pour chaque produit ("emporte" ou "a_livrer")
- Statistiques de livraison complètes
- Tous les champs de facturation existants

## 📞 SUPPORT:

En cas de problème:
1. Vérifiez la console navigateur (F12)
2. Testez d'abord en local avec `npm run dev`
3. Consultez les logs N8N pour les webhooks
EOF

# Création du ZIP
cd $TEMP_DIR
zip -r "../$ZIP_NAME" .
cd ..

# Nettoyage
rm -rf $TEMP_DIR

# Informations finales
echo ""
echo "✅ DÉPLOIEMENT PRÊT!"
echo "==================="
echo "📁 Package créé: $ZIP_NAME"
echo "📏 Taille du package:"
ls -lh "$ZIP_NAME"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. 🚀 Uploadez $ZIP_NAME sur votre hébergeur (Netlify recommandé)"
echo "2. 🔧 Configurez l'URL N8N dans les variables d'environnement"
echo "3. 📱 Testez sur iPad pour valider toutes les fonctionnalités"
echo ""
echo "🆕 NOUVELLES FONCTIONNALITÉS INCLUSES:"
echo "   • Colonne statut de livraison (emporté/à livrer)"
echo "   • Intégration N8N avec données de livraison"
echo "   • Couleurs harmonisées des blocs"
echo "   • Optimisations iPad complètes"
echo ""
echo "💡 Le fichier README_DEPLOYMENT.md dans le ZIP contient toutes les instructions détaillées."
echo ""

# Copie vers le Desktop pour faciliter l'accès
if [ -d "$HOME/Desktop" ]; then
    cp "$ZIP_NAME" "$HOME/Desktop/"
    echo "📋 Package également copié sur le Desktop: ~/Desktop/$ZIP_NAME"
fi

echo "🎯 Déploiement prêt pour iPad !"
