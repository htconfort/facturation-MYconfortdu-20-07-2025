#!/bin/bash
# 🚨 SCRIPT DE RESTAURATION D'URGENCE MYCOMFORT 🚨
# À utiliser si l'application ne s'affiche plus correctement

echo "🚨 RESTAURATION D'URGENCE DE LA CONFIGURATION MYCOMFORT..."

# Restaurer main.tsx
echo "📁 Restauration main.tsx..."
cat > src/main.tsx << 'EOF'
// ⚠️ ALERTE CRITIQUE MYCOMFORT ⚠️
// CE FICHIER A ÉTÉ VALIDÉ LE 6 AOÛT 2025
// NE PAS MODIFIER LA CONFIGURATION CI-DESSOUS
// DOIT TOUJOURS POINTER VERS App.tsx (application MYcomfort originale)
// ❌ NE JAMAIS CHANGER VERS DeliveryStatusDemo ou autre fichier

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // ⚠️ CRITIQUE: Toujours App.tsx
import './index.css'; // ⚠️ CRITIQUE: CSS requis pour TailwindCSS

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ CONFIGURATION VALIDÉE ET FONCTIONNELLE
EOF

# Restaurer postcss.config.js
echo "⚙️ Restauration postcss.config.js..."
cat > postcss.config.js << 'EOF'
// ⚠️ ALERTE CRITIQUE MYCOMFORT ⚠️ 
// CONFIGURATION VALIDÉE LE 6 AOÛT 2025
// NE PAS MODIFIER - FONCTIONNE AVEC TAILWINDCSS 3.4.4
// ❌ NE PAS UTILISER @tailwindcss/postcss

export default {
  plugins: {
    tailwindcss: {}, // ⚠️ CRITIQUE: Configuration standard qui fonctionne
    autoprefixer: {},
  },
};

// ✅ CONFIGURATION VALIDÉE ET FONCTIONNELLE
EOF

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
rm -rf node_modules/.vite
rm -rf dist

# Réinstaller TailwindCSS correct
echo "📦 Réinstallation TailwindCSS 3.4.4..."
npm install tailwindcss@^3.4.4

echo "✅ RESTAURATION TERMINÉE !"
echo "🚀 Démarrage du serveur..."
npm run dev
