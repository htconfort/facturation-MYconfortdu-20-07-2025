#!/bin/bash
# ⚠️ SCRIPT DE VÉRIFICATION CRITIQUE MYCOMFORT ⚠️
# Créé le 6 août 2025 - Configuration validée

echo "🔍 VÉRIFICATION DE LA CONFIGURATION MYCOMFORT..."

# Vérification du main.tsx
if grep -q "import App from './App.tsx'" src/main.tsx; then
    echo "✅ main.tsx pointe vers App.tsx"
else
    echo "❌ ERREUR: main.tsx ne pointe pas vers App.tsx !"
    exit 1
fi

# Vérification du CSS
if grep -q "import './index.css'" src/main.tsx; then
    echo "✅ CSS correctement importé"
else
    echo "❌ ERREUR: CSS non importé !"
    exit 1
fi

# Vérification PostCSS
if grep -q "tailwindcss: {}" postcss.config.js; then
    echo "✅ PostCSS configuré correctement"
else
    echo "❌ ERREUR: Configuration PostCSS incorrecte !"
    exit 1
fi

# Vérification TailwindCSS version
if npm list tailwindcss | grep -q "3.4.4"; then
    echo "✅ TailwindCSS version correcte (3.4.4)"
else
    echo "⚠️  WARNING: Version TailwindCSS différente de 3.4.4"
fi

echo "🎉 CONFIGURATION MYCOMFORT VALIDÉE !"
echo "🚀 Démarrage du serveur..."
npm run dev
