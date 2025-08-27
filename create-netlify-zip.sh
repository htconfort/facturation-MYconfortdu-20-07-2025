#!/bin/bash

# 📦 Script de Création ZIP pour Netlify Drag & Drop
# Date: 27 août 2025
# Objectif: Créer un zip prêt pour déploiement Netlify avec fonctionnalités chèques à venir

echo "📦 === CRÉATION ZIP NETLIFY DRAG & DROP ==="
echo ""

# 1. Vérification du build
echo "🔍 1. Vérification du build..."
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'existe pas"
    echo "Exécutez d'abord: npm run build:mem"
    exit 1
fi

echo "✓ Dossier dist trouvé"
echo "✓ Taille du build: $(du -sh dist | cut -f1)"
echo ""

# 2. Préparation des fichiers de configuration Netlify
echo "⚙️ 2. Préparation des fichiers de configuration..."

# Vérifier que _redirects existe
if [ ! -f "dist/_redirects" ]; then
    echo "Création du fichier _redirects..."
    cat > dist/_redirects << 'EOF'
# Redirections pour Single Page Application
/*    /index.html   200

# Redirections spécifiques pour l'application iPad
/ipad    /index.html   200
/ipad/*  /index.html   200
EOF
fi

echo "✓ Fichier _redirects configuré"

# 3. Création du fichier README pour le déploiement
cat > dist/README_DEPLOIEMENT.md << 'EOF'
# 🚀 Facturation MyConfort - Déploiement Netlify

## ✅ Fonctionnalités Incluses
- Application iPad de facturation complète
- **NOUVEAU:** Gestion des chèques à venir avec affichage dans récapitulatif et PDF
- Génération PDF A4 professionnelle
- Envoi automatique par email via N8N
- Interface optimisée pour iPad

## 🎯 Test de Validation
1. Accéder à `/ipad` 
2. Créer une facture complète
3. Étape 4: Sélectionner "Chèques à venir" → Configurer 9 chèques
4. Étape 7: Vérifier affichage (9 chèques de X€ + montant total)
5. Imprimer PDF: Vérifier section "Mode de règlement"

## 🔧 Configuration Netlify Post-Déploiement
Si nécessaire, ajoutez ces variables d'environnement :
- NODE_VERSION=20.11.1
- NPM_VERSION=10.9.3

## 📞 Support
En cas de problème, vérifiez les logs de déploiement Netlify.

Build créé le: $(date)
Version: Chèques à Venir v1.0
EOF

echo "✓ README de déploiement créé"

# 4. Nettoyage des fichiers inutiles
echo ""
echo "🧹 3. Nettoyage des fichiers inutiles..."

# Supprimer les fichiers de développement s'ils existent
rm -f dist/.DS_Store
rm -f dist/**/.DS_Store
rm -f dist/Thumbs.db

echo "✓ Fichiers temporaires supprimés"

# 5. Vérification du contenu
echo ""
echo "📋 4. Contenu du package à déployer:"
echo "├── index.html ($(stat -f%z dist/index.html 2>/dev/null || stat -c%s dist/index.html) bytes)"
echo "├── _redirects ($(stat -f%z dist/_redirects 2>/dev/null || stat -c%s dist/_redirects) bytes)"
echo "├── assets/"

# Compter les fichiers assets
asset_count=$(find dist/assets -type f 2>/dev/null | wc -l)
echo "│   └── $asset_count fichiers"

echo "└── README_DEPLOIEMENT.md"
echo ""

# 6. Création du ZIP
echo "🗜️ 5. Création du fichier ZIP..."

# Nom du fichier ZIP avec timestamp
timestamp=$(date +"%Y%m%d_%H%M%S")
zip_name="facturation-myconfort-cheques-avenir-${timestamp}.zip"

# Aller dans le dossier dist et créer le zip
cd dist

# Créer le zip avec tous les fichiers
zip -r "../${zip_name}" . -x "*.DS_Store" "*/.*" > /dev/null 2>&1

cd ..

# Vérifier que le zip a été créé
if [ -f "$zip_name" ]; then
    zip_size=$(du -sh "$zip_name" | cut -f1)
    echo "✅ ZIP créé avec succès: $zip_name"
    echo "✅ Taille du ZIP: $zip_size"
else
    echo "❌ Erreur lors de la création du ZIP"
    exit 1
fi

echo ""

# 7. Instructions de déploiement
echo "🌐 6. Instructions de déploiement Netlify:"
echo ""
echo "1. Aller sur https://app.netlify.com"
echo "2. Cliquer sur 'Add new site' → 'Deploy manually'"
echo "3. Glisser-déposer le fichier: $zip_name"
echo "4. Attendre le déploiement automatique"
echo "5. Tester l'application sur l'URL fournie"
echo ""

# 8. Test recommandé
echo "🧪 7. Test post-déploiement recommandé:"
echo ""
echo "URL de test: https://[votre-site].netlify.app/ipad"
echo ""
echo "Scénario de test chèques à venir:"
echo "  1. Créer une facture → Étape 4: 'Chèques à venir'"
echo "  2. Configurer 9 chèques"
echo "  3. Étape 7: Vérifier affichage détaillé"
echo "  4. PDF: Vérifier section paiement enrichie"
echo ""

# 9. Informations techniques
echo "📋 8. Informations techniques:"
echo "  • Build date: $(date)"
echo "  • Node.js: Compatible 18+ (recommandé 20.11.1)"
echo "  • Bundle size: $(du -sh dist | cut -f1)"
echo "  • SPA: Configuré avec redirections"
echo "  • Features: Chèques à venir + PDF enrichi"
echo ""

echo "🎉 === ZIP PRÊT POUR NETLIFY ==="
echo ""
echo "💡 Conseil: Conservez ce fichier pour les futurs déploiements"
echo "📞 Support: Consultez README_DEPLOIEMENT.md dans le ZIP"
echo ""
echo "Fichier créé: $zip_name"
echo "Prêt pour drag & drop sur Netlify ! 🚀"
